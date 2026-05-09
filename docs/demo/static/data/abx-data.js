const ABX_DATA = [
  {
    id: 'cap-demo',
    site: 'Demo Pneumonia Pathway',
    icon: 'Rx',
    tags: ['demo', 'respiratory'],
    keywords: 'pneumonia respiratory demo',
    regimens: [
      {
        sev: 'moderate',
        label: 'Stable ward patient',
        first: 'Use locally approved empiric therapy, then narrow when cultures and trajectory allow.',
        alt: 'Review allergies, renal function, severity, and local antibiogram.',
        publicNotes: [
          { cls: '', txt: 'This is public demo content only and is not a prescribing recommendation.' },
          { cls: 'warn', txt: 'Real antibiotic decisions require local guidelines and clinician review.' }
        ],
        localNotes: []
      }
    ]
  },
  {
    id: 'uti-demo',
    site: 'Demo UTI Pathway',
    icon: 'Lab',
    tags: ['demo', 'urinary'],
    keywords: 'urinary uti demo',
    regimens: [
      {
        sev: 'mild',
        label: 'Culture-directed step-down',
        first: 'Select an oral option only after susceptibility, source control, and renal function are reviewed.',
        alt: 'Escalate evaluation if systemic signs or obstruction are present.',
        publicNotes: [
          { cls: '', txt: 'Canned public demo content for interface review.' }
        ],
        localNotes: []
      }
    ]
  }
];
ABX_DATA.forEach((site) => {
  (site.regimens || []).forEach((regimen) => {
    if (!Array.isArray(regimen.publicNotes)) regimen.publicNotes = [];
    if (!Array.isArray(regimen.localNotes)) regimen.localNotes = [];
  });
});