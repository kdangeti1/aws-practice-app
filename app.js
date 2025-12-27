let questions = [];
let currentIndex = 0;
let score = 0;
let answeredCount = 0;

// DOM Elements
const currentIdxEl = document.getElementById('current-index');
const totalQuestionsEl = document.getElementById('total-questions');
const currentScoreEl = document.getElementById('current-score');
const qIdDisplayEl = document.getElementById('q-id-display');
const qTextEl = document.getElementById('q-text');
const optionsListEl = document.getElementById('options-list');
const feedbackSectionEl = document.getElementById('feedback-section');
const statusBadgeEl = document.getElementById('status-badge');
const explanationTextEl = document.getElementById('explanation-text');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const jumpInput = document.getElementById('jump-input');
const jumpBtn = document.getElementById('jump-btn');

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        totalQuestionsEl.textContent = questions.length;
        renderQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        qTextEl.textContent = 'Failed to load questions. Make sure questions.json is in the same directory.';
    }
}

let selectedOptions = [];

function renderQuestion() {
    const q = questions[currentIndex];
    if (!q) return;

    // Reset UI
    feedbackSectionEl.style.display = 'none';
    submitBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';
    selectedOptions = [];

    currentIdxEl.textContent = currentIndex + 1;
    qIdDisplayEl.textContent = `Question ${q.id}`;
    qTextEl.textContent = q.question;
    optionsListEl.innerHTML = '';

    Object.entries(q.options).forEach(([label, text]) => {
        const item = document.createElement('div');
        item.className = 'option-item';
        item.innerHTML = `
            <span class="option-label">${label}.</span>
            <span class="option-content">${text}</span>
        `;
        item.onclick = () => toggleOption(label, item, q.answer.length > 1);
        optionsListEl.appendChild(item);
    });
}

function toggleOption(label, element, isMulti) {
    if (feedbackSectionEl.style.display === 'block') return;

    if (!isMulti) {
        selectedOptions = [label];
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    } else {
        if (selectedOptions.includes(label)) {
            selectedOptions = selectedOptions.filter(l => l !== label);
            element.classList.remove('selected');
        } else {
            selectedOptions.push(label);
            element.classList.add('selected');
        }
    }
}

function submitAnswer() {
    if (selectedOptions.length === 0) {
        alert('Please select at least one option!');
        return;
    }

    const q = questions[currentIndex];
    const isCorrect = validateAnswer(selectedOptions, q.answer);

    // Update Score
    answeredCount++;
    if (isCorrect) score++;
    currentScoreEl.textContent = `${score} / ${answeredCount}`;

    // Show Feedback
    statusBadgeEl.textContent = isCorrect ? 'Correct' : 'Incorrect';
    statusBadgeEl.className = `status-badge ${isCorrect ? 'correct' : 'incorrect'}`;
    explanationTextEl.textContent = q.explanation;
    feedbackSectionEl.style.display = 'block';

    // Highlight options
    document.querySelectorAll('.option-item').forEach(el => {
        const label = el.querySelector('.option-label').textContent.replace('.', '');
        if (q.answer.includes(label)) {
            el.classList.add('correct');
        } else if (selectedOptions.includes(label) && !q.answer.includes(label)) {
            el.classList.add('incorrect');
        }
    });

    submitBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
}

function validateAnswer(selectedArr, correctStr) {
    if (selectedArr.length !== correctStr.length) return false;
    return selectedArr.every(l => correctStr.includes(l));
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert('You have reached the end of the questions!');
    }
}

function jumpToQuestion() {
    const val = parseInt(jumpInput.value);
    if (isNaN(val) || val < 1 || val > questions.length) {
        alert(`Please enter a valid question number between 1 and ${questions.length}`);
        return;
    }
    // Search for question with that ID (sequential index might not match ID if some are missing)
    const targetIdx = questions.findIndex(q => q.id === val);
    if (targetIdx !== -1) {
        currentIndex = targetIdx;
        renderQuestion();
    } else {
        // Fallback to absolute index if ID not found
        currentIndex = val - 1;
        renderQuestion();
    }
}

// Event Listeners
submitBtn.onclick = submitAnswer;
nextBtn.onclick = nextQuestion;
jumpBtn.onclick = jumpToQuestion;
jumpInput.onkeypress = (e) => {
    if (e.key === 'Enter') jumpToQuestion();
};

// Init
loadQuestions();
