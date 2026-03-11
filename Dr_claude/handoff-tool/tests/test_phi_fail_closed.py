import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


def load_module(module_name: str, file_path: Path):
    sys.path.insert(0, str(file_path.parent))
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class PublicHandoffFailClosedTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app_dir = Path(__file__).resolve().parents[1]
        cls.module = load_module("mediport_public_handoff_app", cls.app_dir / "app.py")
        cls.module.app.testing = True

    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmpdir.cleanup)
        self.patients_dir = Path(self.tmpdir.name)
        self.patient_id = "test_patient"
        (self.patients_dir / f"{self.patient_id}.md").write_text(
            "# Patient: Test Patient\n**Admitted:** 2026-03-10\n**Admitting Dx:** Fever\n",
            encoding="utf-8",
        )
        self.client = self.module.app.test_client()

    def test_generate_refuses_outbound_request_when_scrub_fails(self):
        with patch.object(self.module, "PATIENTS_DIR", str(self.patients_dir)), \
             patch.object(self.module, "scrub_phi_for_llm", side_effect=RuntimeError("PHI scrubbing failed")), \
             patch.object(self.module, "call_llm", side_effect=AssertionError("call_llm should not run")):
            response = self.client.post(
                "/api/generate",
                json={"patient_id": self.patient_id, "type": "sbar"},
            )

        self.assertEqual(response.status_code, 500)
        self.assertIn("PHI scrubbing failed", response.get_json()["error"])

    def test_batch_sbar_records_error_without_calling_llm_when_scrub_fails(self):
        with patch.object(self.module, "PATIENTS_DIR", str(self.patients_dir)), \
             patch.object(self.module, "scrub_phi_for_llm", side_effect=RuntimeError("PHI scrubbing failed")), \
             patch.object(self.module, "call_llm", side_effect=AssertionError("call_llm should not run")):
            response = self.client.post("/api/generate/batch-sbar", json={})

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(len(payload), 1)
        self.assertIsNone(payload[0]["note"])
        self.assertIn("PHI scrubbing failed", payload[0]["error"])

    def test_export_chart_embeds_error_without_calling_llm_when_scrub_fails(self):
        with patch.object(self.module, "PATIENTS_DIR", str(self.patients_dir)), \
             patch.object(self.module, "scrub_phi_for_llm", side_effect=RuntimeError("PHI scrubbing failed")), \
             patch.object(self.module, "call_llm", side_effect=AssertionError("call_llm should not run")):
            response = self.client.post("/api/export/chart", json={"type": "sbar"})

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(len(payload["patients"]), 1)
        self.assertIn("Error generating note: PHI scrubbing failed", payload["patients"][0]["note"])


if __name__ == "__main__":
    unittest.main()
