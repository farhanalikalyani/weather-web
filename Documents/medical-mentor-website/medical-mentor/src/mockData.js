export const SYSTEMS = [
  "Cardiovascular","Renal","Pulmonary","Gastrointestinal",
  "Endocrine","Neurology","Hematology","Biochemistry","Pharmacology","Musculoskeletal"
];
export const SUBJECTS = ["Physiology","Pathology","Pharmacology","Biochemistry","Anatomy","Histology","Microbiology"];
export const DIFFICULTIES = ["Easy","Medium","Hard"];
export const MISTAKE_TYPES = ["Concept Gap","Careless Error","Trap / Distractor","Time Pressure","Calculation Error"];

export const initialQuestionLog = [
  { id:"QID-001", source:"UWorld", form_block:"Block 3", question_number:12, system:"Renal",
    subject:"Physiology", topic:"ACE Inhibitor in Bilateral RAS", difficulty:"Hard",
    user_answer:"D", correct_answer:"B", correct:false,
    mistake_type:"Concept Gap", key_concept:"RAAS maintains GFR in bilateral RAS via efferent constriction",
    takeaway:"ACE-I blocks efferent constriction → GFR drops in bilateral RAS",
    pearl:"Classic: ACE-I + bilateral RAS = acute creatinine rise → stop drug",
    date:"2026-06-20", review_date:"2026-06-27" },
  { id:"QID-002", source:"NBME", form_block:"Form 31 Blk 2", question_number:47, system:"Cardiovascular",
    subject:"Physiology", topic:"Frank-Starling Mechanism", difficulty:"Medium",
    user_answer:"C", correct_answer:"A", correct:false,
    mistake_type:"Trap / Distractor", key_concept:"Starling: EDV = preload surrogate; LVEDP tested on boards",
    takeaway:"Increasing preload increases SV until heart fails. EDP = best preload index",
    pearl:"LVEDP is the Step 1 surrogate for preload — not EF",
    date:"2026-06-22", review_date:"2026-06-29" },
  { id:"QID-003", source:"UWorld", form_block:"Block 7", question_number:33, system:"Biochemistry",
    subject:"Biochemistry", topic:"Purine Synthesis Rate-Limiting Step", difficulty:"Medium",
    user_answer:"A", correct_answer:"A", correct:true,
    mistake_type:"", key_concept:"PRPP amidotransferase is rate-limiting for de novo purine synthesis",
    takeaway:"Got this right — remember PRPP amidotransferase, inhibited by AMP/GMP",
    pearl:"Lesch-Nyhan: HGPRT deficiency → salvage pathway fails → purines ↑ → gout + neuro",
    date:"2026-06-24", review_date:"2026-07-01" },
  { id:"QID-004", source:"NBME", form_block:"Form 29 Blk 1", question_number:8, system:"Pulmonary",
    subject:"Physiology", topic:"V/Q Mismatch in PE", difficulty:"Hard",
    user_answer:"B", correct_answer:"C", correct:false,
    mistake_type:"Concept Gap", key_concept:"PE = dead space (high V/Q) → PaO2↓ PaCO2↓ A-a gap↑",
    takeaway:"PE causes hyperventilation → CO2 blown off → PaCO2 falls despite dead space",
    pearl:"PE: PaO2↓ + PaCO2↓ + widened A-a gradient = pathognomonic gas exchange pattern",
    date:"2026-06-25", review_date:"2026-07-02" },
];

export const initialWeakAreas = [
  { system:"Renal",          total:18, incorrect:10, accuracy:0.44, weakness_score:5.6,  rank:1 },
  { system:"Pulmonary",      total:14, incorrect:7,  accuracy:0.50, weakness_score:3.5,  rank:2 },
  { system:"Cardiovascular", total:22, incorrect:9,  accuracy:0.59, weakness_score:3.7,  rank:3 },
  { system:"Biochemistry",   total:16, incorrect:5,  accuracy:0.69, weakness_score:1.55, rank:4 },
  { system:"Neurology",      total:10, incorrect:3,  accuracy:0.70, weakness_score:0.9,  rank:5 },
  { system:"Endocrine",      total:8,  incorrect:2,  accuracy:0.75, weakness_score:0.5,  rank:6 },
  { system:"Pharmacology",   total:12, incorrect:2,  accuracy:0.83, weakness_score:0.34, rank:7 },
];

export const initialFlashcards = [
  { id:"FC-001", topic:"Cardiac Action Potential", system:"Cardiovascular",
    front:"A patient's ECG shows a prolonged QT interval after starting a new drug. Which phase of the cardiac action potential is most affected, and which ion channel?",
    back:"Phase 3 (repolarization) — blockade of IKr (rapid delayed rectifier K⁺ channels).\n• QT prolongation = delayed repolarization\n• Common culprits: antiarrhythmics (sotalol), antibiotics (azithromycin), antipsychotics\n• Risk: Torsades de Pointes → VF",
    memory_trick:"'K+ runs out the door in Phase 3 — if the door is blocked, repolarization stalls.'",
    difficulty_rating:0, repetition:0, ef:2.5, interval:1,
    last_reviewed:"2026-06-22", next_review:"2026-06-29", due:true },
  { id:"FC-002", topic:"RAAS Axis", system:"Renal",
    front:"A 70-year-old with bilateral renal artery stenosis starts lisinopril. Creatinine rises from 1.0 → 1.9 in 2 weeks. What is the mechanism, and what should you do?",
    back:"ACE inhibitor removes angiotensin II → efferent arteriole dilates → GFR drops.\n• Efferent constriction was maintaining filtration pressure\n• Management: STOP the ACE-I immediately\n• Diagnosis confirmed if creatinine normalizes after stopping",
    memory_trick:"'Bilateral RAS: efferent tone = life support. ACE-I pulls the plug.'",
    difficulty_rating:0, repetition:0, ef:2.5, interval:1,
    last_reviewed:"2026-06-20", next_review:"2026-06-27", due:true },
  { id:"FC-003", topic:"V/Q Mismatch", system:"Pulmonary",
    front:"A post-surgical patient develops sudden dyspnea. ABG: PaO2 60, PaCO2 28, pH 7.50. What pattern does this represent and what is the likely diagnosis?",
    back:"High V/Q (dead space) pattern — consistent with Pulmonary Embolism.\n• PaO2↓ (poor gas exchange) + PaCO2↓ (compensatory hyperventilation)\n• A-a gradient will be widened\n• pH 7.50 = respiratory alkalosis from hyperventilation",
    memory_trick:"'PE = Please Exhale more — tachypnea blows off CO2 even though O2 still falls.'",
    difficulty_rating:0, repetition:0, ef:2.5, interval:1,
    last_reviewed:"2026-06-25", next_review:"2026-06-29", due:true },
  { id:"FC-004", topic:"Frank-Starling Law", system:"Cardiovascular",
    front:"On a Frank-Starling curve, a patient with dilated cardiomyopathy sits on a flat, depressed curve. Adding a vasodilator shifts them to a higher curve. What preload index is most commonly tested on boards?",
    back:"LVEDP (Left Ventricular End-Diastolic Pressure) is the Step 1 preload surrogate.\n• Normal LVEDP: 4–12 mmHg\n• In heart failure: LVEDP rises (volume overload)\n• PCWP approximates LVEDP clinically\n• Vasodilators ↓ preload → move to more favorable point on curve",
    memory_trick:"'LVEDP = Left Ventricle's Exhaustion/Distress Pressure — higher = more stressed.'",
    difficulty_rating:0, repetition:0, ef:2.5, interval:1,
    last_reviewed:"2026-06-22", next_review:"2026-07-05", due:false },
];

export const MOCK_AI_RESPONSES = {
  "quiz":
`🎯 **Targeting your weakest area: Renal (44% accuracy)**

---

**Clinical Vignette:**
A 62-year-old man with longstanding hypertension and known atherosclerotic vascular disease is started on lisinopril 10mg daily. Three weeks later, his serum creatinine has risen from 1.1 → 1.9 mg/dL and potassium from 4.2 → 5.7 mEq/L. Renal ultrasound shows bilateral kidneys of 7.5 cm with no hydronephrosis.

What is the most likely underlying cause?

**A)** Acute tubular necrosis from lisinopril nephrotoxicity
**B)** Bilateral renal artery stenosis with hemodynamic compromise ✓
**C)** IgA nephropathy exacerbated by RAAS blockade
**D)** Hypertensive nephrosclerosis progression
**E)** Drug-induced membranous nephropathy

*Type your answer (A–E) to see the full explanation.*`,

  "b":
`✅ **Correct! Option B — Bilateral Renal Artery Stenosis**

**Why B is correct:**
In bilateral RAS, GFR is maintained entirely by angiotensin II–mediated efferent arteriolar constriction. Lisinopril blocks ACE → angiotensin II falls → efferent tone drops → GFR collapses. The bilateral nature means both kidneys are simultaneously affected.

**Why the others are wrong:**
• **A (ATN):** ATN presents with muddy brown casts on UA — not this hemodynamic pattern
• **C (IgA nephropathy):** ACE inhibitors are actually *protective* in IgA nephropathy
• **D (Nephrosclerosis):** Progresses over years, not 3 weeks after one drug
• **E (Membranous):** Would cause nephrotic-range proteinuria, not creatinine jump

**🎯 High-Yield Pearl:**
ACE-I + bilateral RAS = classic Step 1 trap. The creatinine rise is *hemodynamic*, not structural — it reverses when you stop the drug.

**🧠 Memory Trick:** *"Bilateral RAS: efferent tone = life support for GFR. ACE-I pulls the plug."*`,

  "weak":
`📊 **Your Weakness Analysis**

**🔴 Critical Priority:**
1. **Renal (44%)** — You're mixing up hemodynamic vs. intrinsic AKI causes. Guyton Ch 28 tonight.
2. **Pulmonary (50%)** — V/Q mismatch calculations trip you up. Draw the West Zones.

**🟡 Moderate:**
3. **Cardiovascular (59%)** — Pressure-volume loops and Starling curves. Guyton Ch 9.

**🟢 Maintaining well:**
Pharmacology (83%), Endocrine (75%), Biochemistry (69%)

**📅 This week's plan:**
• Days 1–3: Renal deep dive (Guyton 27–30, 40 Qs)
• Days 4–5: Pulmonary (West Zones, ABGA practice)
• Days 6–7: Mixed timed review

**🎯 Right now:** Open Guyton Ch 28 and read the GFR regulation section — 25 minutes. Then come back and I'll quiz you.`,

  "mistakes":
`🔍 **Mistake Pattern Analysis**

Looking at your last 4 logged questions:

**Pattern 1: Hemodynamic Physiology (2/4 mistakes)**
You're missing the *mechanism* behind drug effects on kidney perfusion. You know the drugs but not what they're doing at the efferent/afferent arteriole level.

**Pattern 2: Gas Exchange Interpretation (1/4 mistakes)**
The V/Q ratio logic isn't clicking yet. You need a reliable mental model for dead space vs. shunt.

**🧩 Concepts you're confusing:**
• Preload surrogates: EDV ≈ EDP ≈ PCWP (not EF)
• Dead space (PE) vs. shunt (pneumonia) — opposite ABG patterns

**⚡ Fix these first:**
1. Bilateral RAS physiology — 1 Guyton session locks this
2. V/Q mismatch mental model — draw it once, own it forever
3. Frank-Starling curve positions

**💪 You've logged 4 questions and already have clear patterns — that's the work paying off.**`,

  "mentor":
`I hear you — and I want to be direct with you, because that's what a good mentor does.

The feeling of "studying but nothing sticking" after 3 weeks is almost always a *method* problem, not a capacity problem. You're almost certainly *reading* your mistakes instead of *learning* from them. Reading feels productive. Learning requires you to close the book and reconstruct the concept from scratch.

**Here's what to try for 3 days:**

When you get a question wrong, don't move on. Close everything. On blank paper, write: *"The concept this tested was ___. Here's how it works: ___."* Then check yourself. This reconstruction is how knowledge actually wires in.

Your Renal gap is real, but here's the thing — every hypertensive patient you'll ever see in Pakistan has a renal story. When you understand RAAS and tubular physiology, you're not studying for an exam. You're learning to protect your patients' kidneys for the next 40 years.

**One small win, right now:** Log the last 3 questions you got wrong in Medical Mentor — in *your own words*, not copied from UWorld. That one act is worth 2 hours of passive reading.

You're not stuck. You're building. 🩺`,

  "default":
`I'm your Medical Mentor AI. Here are some things I can help with:

• **"quiz me"** — Generate a clinical vignette targeting your weakest system
• **"my weak topics"** — Analyze your performance and suggest a study plan
• **"review my mistakes"** — Identify patterns in your error log
• **"mentor mode"** — Get coaching on study strategies and motivation

What would you like to work on?`,
};

export function getMockResponse(msg) {
  const m = msg.toLowerCase().trim();
  if (m.includes("quiz") || m.includes("question") || m.includes("vignette")) return MOCK_AI_RESPONSES.quiz;
  if (m === "b" || m === "option b") return MOCK_AI_RESPONSES.b;
  if (m.includes("weak") || m.includes("topic") || m.includes("study plan")) return MOCK_AI_RESPONSES.weak;
  if (m.includes("mistake") || m.includes("error") || m.includes("review")) return MOCK_AI_RESPONSES.mistakes;
  if (m.includes("mentor") || m.includes("motivat") || m.includes("stuck") || m.includes("help")) return MOCK_AI_RESPONSES.mentor;
  return MOCK_AI_RESPONSES.default;
}
