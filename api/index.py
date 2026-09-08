from flask import Flask, jsonify, request
import random

app = Flask(__name__)

QUESTION_BANK = {
    "Pharmacology": [
        ("A patient is prescribed a medication that can lower blood pressure. Which finding should be reported before the next dose?", ["Mild thirst", "Dizziness when standing", "Dry skin", "Increased appetite"], 1),
        ("What is the safest first action when a patient reports a new medication allergy?", ["Document the report and hold the dose", "Give half the dose", "Ask them to wait", "Administer with food"], 0),
        ("Medication reconciliation is most important at which transition?", ["Shift change only", "Admission, transfer, and discharge", "After visiting hours", "During breakfast"], 1),
    ],
    "Patient care": [
        ("Which action best supports patient-centred care?", ["Using the same plan for all patients", "Including the patient in goal setting", "Limiting questions", "Avoiding family input"], 1),
        ("A patient suddenly becomes short of breath. What is the priority?", ["Assess airway and breathing", "Complete documentation", "Offer water", "Call a family member"], 0),
    ],
    "Clinical judgement": [
        ("After noticing an unexpected assessment finding, what is the next judgement step?", ["Recognize relevant cues", "Immediately discharge", "Ignore a single change", "Assign a diagnosis without data"], 0),
        ("Which activity evaluates whether an intervention worked?", ["Generating solutions", "Taking action", "Evaluating outcomes", "Recognizing cues"], 2),
    ],
}

def all_questions(topic):
    if topic == "All domains":
        return [item for items in QUESTION_BANK.values() for item in items]
    return QUESTION_BANK.get(topic, QUESTION_BANK["Clinical judgement"])

@app.post("/api/exam")
def make_exam():
    payload = request.get_json(silent=True) or {}
    topic = payload.get("topic", "All domains")
    count = max(3, min(int(payload.get("count", 5)), 10))
    bank = all_questions(topic)
    selected = [random.choice(bank) for _ in range(count)]
    questions = [{"prompt": q[0], "options": q[1], "correct": q[2]} for q in selected]
    return jsonify({"topic": topic, "discipline": payload.get("discipline", "General"), "questions": questions})

@app.post("/api/exam/grade")
def grade_exam():
    payload = request.get_json(silent=True) or {}
    questions, answers = payload.get("questions", []), payload.get("answers", [])
    if not questions or len(questions) != len(answers):
        return jsonify({"error": "A complete set of answers is required."}), 400
    correct = sum(question.get("correct") == answer for question, answer in zip(questions, answers))
    score = round(correct / len(questions) * 100)
    if score >= 80:
        headline, message = "You’re building strong momentum.", "Keep reinforcing this domain with mixed, timed practice."
    elif score >= 60:
        headline, message = "You have a clear foundation to build on.", "Review the missed concepts, then re-test with fresh questions."
    else:
        headline, message = "This is your clearest study signal yet.", "Start with the fundamentals in this topic and re-test after focused review."
    return jsonify({"score": score, "readiness": min(100, score + 8), "headline": headline, "message": message})
