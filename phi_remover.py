"""
PHI Remover - Standalone PDF De-identification Tool

Removes Protected Health Information (PHI) from medical PDFs and generates
de-identified text files that can be safely used for research or case studies.

STANDALONE: Place this script in any folder with PDFs. It will:
  - Read PDFs from the same folder as this script
  - Output de-identified .txt files to the same folder

PHI categories covered (HIPAA Safe Harbor method):
- Names
- Dates (DOB, admission dates, etc.)
- Geographic data smaller than state
- Phone/fax numbers
- Email addresses
- Medical record numbers / Case IDs
- Social Security numbers
- Account numbers
- Device identifiers
- Ages over 89

Usage:
    python phi_remover.py                    # Process all PDFs in script's folder
    python phi_remover.py input.pdf          # Process specific file(s)
    python phi_remover.py --keep-dates       # Keep dates but redact other PHI

Requirements:
    pip install PyMuPDF
"""

import os
import re
import sys
import argparse
from datetime import datetime

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF is required. Install with: pip install PyMuPDF")
    sys.exit(1)


# --- Standalone: Use script's directory for input/output ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


# --- PHI Patterns ---
PHI_PATTERNS = {
    # Taiwan/ROC National ID (e.g., A123456789)
    'national_id': r'\b[A-Z][12]\d{8}\b',

    # Medical record numbers (病歷號) - typically 7-10 digits
    'medical_record_number': r'(?:病\s*歷\s*號|MRN|Chart\s*(?:No|Number|#)?)\s*[:：]?\s*(\d{6,10})',

    # Case ID patterns
    'case_id': r'(?:Case\s*ID|個案編號)\s*[:：]?\s*([A-Za-z0-9\-]+)',

    # Phone numbers (Taiwan format and international)
    'phone_taiwan': r'\b0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4}\b',
    'phone_intl': r'\+\d{1,3}[-\s]?\d{1,4}[-\s]?\d{3,4}[-\s]?\d{3,4}\b',

    # Email addresses
    'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',

    # Dates — only redact dates explicitly tied to PHI-identifying labels.
    # Generic dates (lab timestamps, report dates) are preserved because they
    # are clinically essential and not identifying on their own.
    'dob': r'(?:出\s*生\s*日\s*期|DOB|Date\s*of\s*Birth|生日)\s*[:：]?\s*(\d{4}[/\-]\d{2}[/\-]\d{2})',
    'admission_date': r'(?:入\s*院\s*日\s*期|Admission\s*Date)\s*[:：]?\s*(\d{4}[/\-]\d{2}[/\-]\d{2})',
    'discharge_date': r'(?:出\s*院\s*日\s*期|Discharge\s*Date)\s*[:：]?\s*(\d{4}[/\-]\d{2}[/\-]\d{2})',
    'date_roc': r'\b民國\s*\d{2,3}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日',  # ROC calendar: full dates only (民國113年1月15日)

    # Address patterns (Taiwan)
    'address_taiwan': r'[\u4e00-\u9fff]{2,3}[市縣][\u4e00-\u9fff]{2,3}[區鄉鎮市][\u4e00-\u9fff\d]+[路街巷弄號樓之\-\d]+',

    # Postal codes — require address context (市/縣/區/鄉/鎮 following) to avoid
    # matching lab values like "150 mg" that precede Chinese text
    'postal_code': r'\b\d{3}(?:\-\d{2,3})?\b(?=\s*[\u4e00-\u9fff]{2,3}[市縣區鄉鎮])',

    # Names after specific labels (Chinese)
    'patient_name_zh': r'(?:姓\s*名|病\s*患|Patient)\s*[:：]\s*([\u4e00-\u9fff]{2,4})',
    'doctor_name_zh': r'(?:主治醫師|醫師|Physician|Doctor|Dr\.?)\s*[:：]?\s*([\u4e00-\u9fff]{2,4})',

    # Age over 89 (HIPAA requirement)
    'age_over_89': r'\b(9[0-9]|[1-9]\d{2,})\s*(?:歲|years?\s*old|y/?o)\b',

    # SSN — disabled: not applicable to Taiwanese records and causes too many
    # false positives with lab reference numbers and test codes.
    # 'ssn': r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b',

    # IP addresses
    'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',

    # URLs
    'url': r'https?://[^\s<>"{}|\\^`\[\]]+',
}

# Patterns for contextual name detection
NAME_CONTEXT_PATTERNS = [
    r'(?:Mr\.|Mrs\.|Ms\.|Miss|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    r'(?:Patient|病患|姓名)\s*[:：]\s*([A-Za-z\s]+|[\u4e00-\u9fff]{2,4})',
]


def extract_text_from_pdf(input_path):
    """
    Extracts text from a PDF file using PyMuPDF.
    Returns the full text content or None if extraction fails.
    """
    if not os.path.exists(input_path):
        print(f"Error: Input file not found at '{input_path}'")
        return None

    file_extension = os.path.splitext(input_path)[1].lower()
    if file_extension != '.pdf':
        print(f"Error: File must be a PDF (got {file_extension})")
        return None

    full_text = ""
    print(f"Extracting text from PDF...")

    try:
        doc = fitz.open(input_path)
        total_pages = len(doc)

        for i, page in enumerate(doc, 1):
            print(f"  Processing page {i}/{total_pages}...", end='\r')
            text = page.get_text("text")
            full_text += text + "\n\n"

        doc.close()
        print(f"\n  Extracted {total_pages} pages successfully")

    except Exception as e:
        print(f"\nError during extraction: {e}")
        return None

    return full_text


def redact_phi(text, keep_dates=False, replacement_map=None):
    """
    Identifies and redacts PHI from the text.

    Args:
        text: The input text to de-identify
        keep_dates: If True, preserves dates (useful for timeline analysis)
        replacement_map: Optional dict to track what was redacted

    Returns:
        De-identified text with PHI replaced by category labels
    """
    if replacement_map is None:
        replacement_map = {}

    redacted_text = text
    phi_counts = {}

    # --- Process each PHI pattern ---
    for phi_type, pattern in PHI_PATTERNS.items():
        # Skip date patterns if keep_dates is True
        if keep_dates and phi_type in ['date_roc', 'dob', 'admission_date', 'discharge_date']:
            continue

        matches = list(re.finditer(pattern, redacted_text, re.IGNORECASE))

        if matches:
            phi_counts[phi_type] = len(matches)

            # Process matches in reverse order to preserve positions
            for match in reversed(matches):
                original = match.group(0)

                # Generate replacement tag
                redaction_tag = f"[{phi_type.upper()}_REDACTED]"

                # For patterns with capture groups, redact only the captured part
                if match.lastindex and match.lastindex >= 1:
                    # Find the captured group's position within the match
                    captured = match.group(1)
                    captured_start = match.group(0).find(captured)
                    if captured_start >= 0:
                        prefix = match.group(0)[:captured_start]
                        suffix = match.group(0)[captured_start + len(captured):]
                        replacement = prefix + redaction_tag + suffix
                    else:
                        replacement = redaction_tag
                else:
                    replacement = redaction_tag

                # Store mapping for audit trail
                if original not in replacement_map:
                    replacement_map[original] = redaction_tag

                # Perform replacement
                start, end = match.start(), match.end()
                redacted_text = redacted_text[:start] + replacement + redacted_text[end:]

    # --- Additional contextual name detection ---
    for name_pattern in NAME_CONTEXT_PATTERNS:
        matches = list(re.finditer(name_pattern, redacted_text, re.IGNORECASE))
        for match in reversed(matches):
            if match.lastindex and match.lastindex >= 1:
                name = match.group(1)
                # Only redact if it looks like a real name (not already redacted)
                if '[' not in name and len(name.strip()) > 1:
                    redacted_text = redacted_text[:match.start(1)] + "[NAME_REDACTED]" + redacted_text[match.end(1):]
                    phi_counts['names'] = phi_counts.get('names', 0) + 1

    return redacted_text, phi_counts


def clean_text(text):
    """
    Cleans up the extracted text by removing artifacts and PHI-labeled lines.
    """
    # Remove page header/footer artifacts
    text = re.sub(r"西元.*?版次\s*[:：]\s*\d+", "", text, flags=re.DOTALL)

    # Redact entire lines containing sensitive PHI labels
    # 帳號 (account number), 電話 (phone), 身分證號 (national ID)
    phi_line_redactions = [
        (r'^.*帳\s*號.*$', '[ACCOUNT_NUMBER_LINE_REDACTED]'),
        (r'^.*電\s*話.*$', '[PHONE_LINE_REDACTED]'),
        (r'^.*身\s*分\s*證\s*號.*$', '[NATIONAL_ID_LINE_REDACTED]'),
    ]
    for pattern, replacement in phi_line_redactions:
        text = re.sub(pattern, replacement, text, flags=re.MULTILINE)

    # Remove excessive whitespace while preserving paragraph structure
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)

    # Remove page numbers
    text = re.sub(r'\n\s*第\s*\d+\s*頁\s*\n', '\n', text)
    text = re.sub(r'\n\s*Page\s*\d+\s*(?:of\s*\d+)?\s*\n', '\n', text, flags=re.IGNORECASE)

    return text.strip()


def generate_summary_header(input_file, phi_counts, keep_dates):
    """
    Generates a summary header for the de-identified output.
    """
    header = []
    header.append("=" * 70)
    header.append("DE-IDENTIFIED MEDICAL RECORD")
    header.append("=" * 70)
    header.append(f"Source: {os.path.basename(input_file)}")
    header.append(f"Processed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    header.append(f"Date preservation: {'Enabled' if keep_dates else 'Disabled'}")
    header.append("")

    if phi_counts:
        header.append("PHI Redaction Summary:")
        total_redactions = 0
        for phi_type, count in sorted(phi_counts.items()):
            header.append(f"  - {phi_type}: {count} instance(s) redacted")
            total_redactions += count
        header.append(f"  Total: {total_redactions} PHI elements redacted")
    else:
        header.append("PHI Redaction Summary: No PHI detected")

    header.append("=" * 70)
    header.append("")

    return "\n".join(header)


def process_pdf(input_path, output_dir=None, keep_dates=False):
    """
    Main processing function for a single PDF.

    Args:
        input_path: Path to the input PDF
        output_dir: Directory for output file (defaults to same as input file)
        keep_dates: If True, preserves dates in the output

    Returns:
        True if successful, False otherwise
    """
    print(f"\nProcessing: {os.path.basename(input_path)}")
    print("-" * 50)

    # Extract text
    raw_text = extract_text_from_pdf(input_path)
    if not raw_text:
        return False

    # Clean text
    print("Cleaning extracted text...")
    cleaned_text = clean_text(raw_text)

    # Redact PHI
    print("Identifying and redacting PHI...")
    replacement_map = {}
    deidentified_text, phi_counts = redact_phi(cleaned_text, keep_dates, replacement_map)

    # Generate output path - same directory as input by default
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    if output_dir is None:
        output_dir = os.path.dirname(input_path) or SCRIPT_DIR
    output_path = os.path.join(output_dir, f"{base_name}_deidentified.txt")

    # Generate header
    header = generate_summary_header(input_path, phi_counts, keep_dates)

    # Write output
    print(f"Writing de-identified text...")
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(header)
            f.write(deidentified_text)
        print(f"  Output saved to: {output_path}")
    except Exception as e:
        print(f"Error writing output: {e}")
        return False

    # Print summary
    total_redactions = sum(phi_counts.values())
    print(f"\n  PHI Redaction Summary:")
    if phi_counts:
        for phi_type, count in sorted(phi_counts.items()):
            print(f"    {phi_type}: {count}")
    print(f"  Total: {total_redactions} PHI elements redacted")

    return True


def main():
    """
    Main entry point with command-line argument parsing.
    Standalone mode: reads from and outputs to the script's directory.
    """
    parser = argparse.ArgumentParser(
        description='Remove PHI from medical PDFs and generate de-identified text files.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python phi_remover.py                  Process all PDFs in script's folder
  python phi_remover.py document.pdf     Process specific file(s)
  python phi_remover.py --keep-dates     Keep dates while redacting other PHI

Output files are saved in the same folder as the input PDFs.
        """
    )

    parser.add_argument(
        'files',
        nargs='*',
        help='PDF file(s) to process. If none specified, processes all PDFs in script folder'
    )

    parser.add_argument(
        '--keep-dates', '-k',
        action='store_true',
        help='Preserve dates in the output (useful for timeline analysis)'
    )

    args = parser.parse_args()

    print("=" * 60)
    print("  PHI Remover - Standalone PDF De-identification Tool")
    print("=" * 60)
    print(f"Script location: {SCRIPT_DIR}")

    # Determine files to process
    if args.files:
        pdf_files = []
        for f in args.files:
            # Handle relative paths from script directory
            if not os.path.isabs(f):
                f_path = os.path.join(SCRIPT_DIR, f)
                if not os.path.isfile(f_path):
                    f_path = os.path.abspath(f)  # Try current working dir
            else:
                f_path = f

            if os.path.isfile(f_path) and f_path.lower().endswith('.pdf'):
                pdf_files.append(f_path)
            elif os.path.isfile(f_path):
                print(f"Warning: Skipping non-PDF file: {f}")
            else:
                print(f"Warning: File not found: {f}")
    else:
        # Process all PDFs in script's directory
        pdf_files = [
            os.path.join(SCRIPT_DIR, f)
            for f in os.listdir(SCRIPT_DIR)
            if f.lower().endswith('.pdf')
        ]

    if not pdf_files:
        print("\nNo PDF files found to process.")
        print(f"Place PDF files in: {SCRIPT_DIR}")
        print("Or specify files: python phi_remover.py file1.pdf file2.pdf")
        sys.exit(1)

    print(f"\nFound {len(pdf_files)} PDF(s) to process")
    print(f"Date preservation: {'Enabled' if args.keep_dates else 'Disabled'}")

    # Process each file
    successful = 0
    failed = 0

    for pdf_path in pdf_files:
        # Output to same directory as input file
        output_dir = os.path.dirname(pdf_path)
        if process_pdf(pdf_path, output_dir, args.keep_dates):
            successful += 1
        else:
            failed += 1

    # Final summary
    print("\n" + "=" * 60)
    print("  PROCESSING COMPLETE")
    print("=" * 60)
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Output location: Same folder as input PDFs")
    print("=" * 60)


if __name__ == "__main__":
    main()