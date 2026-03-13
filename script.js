let current = 0;
let score = 0;
let lives = 3;
let streak = 0;
let isDaily = false;
let timer;
let currentCategory = "";

const data = JSON.parse(localStorage.getItem('melkData')) || {
    level: 1,
    coins: 100,
    highScore: 0,
    dailyDone: false,
    dailyDate: ""
};

const today = new Date().toISOString().slice(0,10);

function updateStats() {
    document.getElementById('level').textContent = data.level;
    document.getElementById('title').textContent = ["مبتدئ","محترف","خبير","أسطورة","ملك","إمبراطور"][Math.min(data.level-1,5)];
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = data.coins;
    document.getElementById('lives').textContent = lives;
    document.getElementById('streak').textContent = streak;
}

function saveData() {
    localStorage.setItem('melkData', JSON.stringify(data));
}

function showScreen(id) {
    document.querySelectorAll('.game > div').forEach(d => d.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// شاشة اختيار المواضيع
function showTopicScreen() {
    showScreen('topic-selection');
}

function startCategory(category) {
    currentCategory = category;
    current = 0;
    score = 0;
    lives = 3;
    streak = 0;
    isDaily = false;
    showScreen('play');
    nextQuestion();
}

function nextQuestion() {
    const categoryQuestions = getQuestionsByCategory(currentCategory);
    if (current >= categoryQuestions.length || lives <= 0) {
        endGame();
        return;
    }

    const q = categoryQuestions[current];
    document.getElementById('question').textContent = q.q;
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    q.a.forEach((ans, i) => {
        const btn = document.createElement('div');
        btn.className = 'choice';
        btn.textContent = ans;
        btn.onclick = () => checkAnswer(i === q.c, btn);
        choicesDiv.appendChild(btn);
    });
    document.getElementById('feedback').textContent = '';
    startTimer(25);
}

function checkAnswer(isCorrect, btn) {
    clearInterval(timer);
    document.querySelectorAll('.choice').forEach(b => b.onclick = null);
    if (isCorrect) {
        score += 10;
        streak++;
        data.coins += 10;
        btn.classList.add('correct');
        document.getElementById('feedback').textContent = 'صحيح! ✅';
    } else {
        lives--;
        streak = 0;
        btn.classList.add('wrong');
        document.getElementById('feedback').textContent = 'خطأ!';
    }
    updateStats();
    saveData();
    current++;
    setTimeout(nextQuestion, 2000);
}

function startTimer(seconds) {
    let timeLeft = seconds;
    const bar = document.getElementById('timer-bar');
    bar.style.width = '100%';
    timer = setInterval(() => {
        timeLeft--;
        bar.style.width = (timeLeft / seconds * 100) + '%';
        if (timeLeft <= 0) {
            lives--;
            updateStats();
            saveData();
            current++;
            nextQuestion();
        }
    }, 1000);
}

function useHint() {
    if (data.coins >= 30) {
        data.coins -= 30;
        document.getElementById('feedback').textContent = 'تلميح: ' + questionsDB[currentCategory][current].h;
        updateStats();
        saveData();
    }
}

function watchRewardAd() {
    data.coins += 50;
    lives = Math.min(lives + 1, 5);
    updateStats();
    saveData();
    alert('✅ +50 عملة + قلب');
}

function endGame() {
    clearInterval(timer);
    document.getElementById('finalScore').textContent = score;
    showScreen('end');
    saveData();
}

// الإعدادات والخروج
function openSettings() { document.getElementById('settings-modal').classList.remove('hidden'); }
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }
function saveSettings() { alert('تم الحفظ'); closeSettings(); }
function exitQuestion() {
    if (confirm('هتخسر قلب. متأكد؟')) {
        lives--;
        updateStats();
        saveData();
        current++;
        nextQuestion();
    }
}

// بدء التطبيق
updateStats();
showTopicScreen();
