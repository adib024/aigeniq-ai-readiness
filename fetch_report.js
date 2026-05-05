const payload = {
  sector: "creative_agency",
  companySize: "10-49",
  aiToolsUsed: [
    "Basic Chat (ChatGPT / Claude)",
    "Automated Workflows (Zapier / Make)",
    "Specialist Creative Tools",
    "Custom AI Assistants"
  ],
  priorityAreas: [
    "Automate Repetitive Admin",
    "Data-Driven Decisions",
    "Speed Up Client Delivery"
  ],
  finalScore: 3.8,
  maturityStage: "exploring",
  highestDimension: "D4 Team Culture",
  lowestDimension: "D1 Collective Memory",
  assessmentAnswers: {
    "D1-Q1": "B",
    "D1-Q2": "A",
    "D2-Q1": "B",
    "D2-Q2": "B",
    "D3-Q1": "A",
    "D3-Q3": "B",
    "D3-Q4": "C",
    "D4-Q1": "B",
    "D4-Q4": "C",
    "D5-Q1": "B",
    "D5-Q3": "C",
    "D5-Q5": "B",
    "D6-Q1": "C",
    "D6-Q5": "B",
    "D7-Q1": "B",
    "D7-Q2": "B",
    "D8-Q1": "A",
    "D8-Q4": "B",
    "D8-Q5": "B",
    "FUN-Q1": "C"
  }
};

fetch('http://localhost:3001/api/generate-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(e => console.error(e));
