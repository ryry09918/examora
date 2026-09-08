const form = document.querySelector('#examForm');
const dialog = document.querySelector('#examDialog');
const content = document.querySelector('#examContent');
const selectedTopic = () => document.querySelector('.choice.selected')?.dataset.topic || 'All domains';

document.querySelectorAll('.choice').forEach(choice => choice.addEventListener('click', () => {
  document.querySelectorAll('.choice').forEach(item => item.classList.remove('selected'));
  choice.classList.add('selected');
}));
document.querySelector('#count').addEventListener('input', event => document.querySelector('#countOutput').textContent = `${event.target.value} questions`);
document.querySelectorAll('#heroStart, #navStart').forEach(button => button.addEventListener('click', () => document.querySelector('#diagnostic').scrollIntoView({behavior:'smooth'})));
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('[type=submit]');
  button.textContent = 'Creating your set…'; button.disabled = true;
  try {
    const response = await fetch('/api/exam', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({discipline:document.querySelector('#discipline').value, topic:selectedTopic(), count:+document.querySelector('#count').value})});
    if (!response.ok) throw new Error('Could not create exam');
    showQuestion(await response.json(), 0, []);
  } catch (error) {
    content.innerHTML = `<div class="exam-modal"><p class="modal-kicker">CONNECTION ISSUE</p><h2>We couldn't create that set.</h2><p>Please check the Python API deployment and try again.</p></div>`;
    dialog.showModal();
  } finally { button.innerHTML = 'Generate my diagnostic <span>→</span>'; button.disabled = false; }
});

function showQuestion(exam, index, answers) {
  const question = exam.questions[index];
  content.innerHTML = `<div class="exam-modal"><p class="modal-kicker">${exam.topic.toUpperCase()} / QUESTION ${index + 1} OF ${exam.questions.length}</p><h2>Practice diagnostic</h2><div class="modal-question"><p>${question.prompt}</p><div class="answers">${question.options.map((option, optionIndex) => `<button data-answer="${optionIndex}"><b>${String.fromCharCode(65 + optionIndex)}.</b> ${option}</button>`).join('')}</div></div><div class="modal-foot"><span>Your answers are saved automatically</span><span>${Math.round((index / exam.questions.length) * 100)}% complete</span></div></div>`;
  dialog.showModal();
  content.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', async () => {
    const nextAnswers = [...answers, Number(button.dataset.answer)];
    if (index + 1 < exam.questions.length) showQuestion(exam, index + 1, nextAnswers);
    else {
      const response = await fetch('/api/exam/grade', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({questions:exam.questions, answers:nextAnswers, topic:exam.topic})});
      showResults(await response.json());
    }
  }));
}

function showResults(result) {
  content.innerHTML = `<div class="results-modal"><p class="modal-kicker">YOUR DIAGNOSTIC IS COMPLETE</p><div class="result-number">${result.score}%</div><h2>${result.headline}</h2><p>${result.message}</p><div class="result-breakdown"><div class="breakdown-row"><span>Accuracy</span><i><em style="width:${result.score}%"></em></i><b>${result.score}%</b></div><div class="breakdown-row"><span>Focus readiness</span><i><em style="width:${result.readiness}%"></em></i><b>${result.readiness}%</b></div></div><button class="primary-button" onclick="document.querySelector('#examDialog').close()">Build study plan <span>→</span></button></div>`;
}
