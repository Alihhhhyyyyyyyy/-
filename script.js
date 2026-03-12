// ================================================
// script.js - ملك الألغاز (النسخة الكاملة)
// ================================================

let current = 0;
let score = 0;
let lives = 3;
let streak = 0;
let isDaily = false;
let timer;

const data = JSON.parse(localStorage.getItem('melkData')) || {
    level: 1,
    coins: 100,
    highScore: 0,
    dailyDone: false,
    dailyDate: ""
};

const today = new Date().toISOString().slice(0, 10);

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('level').textContent = data.level;
    document.getElementById('title').textContent = ["مبتدئ", "محترف", "خبير", "أسطورة", "ملك", "إمبراطور"][Math.min(data.level - 1, 5)];
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = data.coins;
    document.getElementById('lives').textContent = lives;
    document.getElementById('streak').textContent = streak;
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('melkData', JSON.stringify(data));
}

// عرض شاشة معينة
function showScreen(id) {
    document.querySelectorAll('.game > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// ==================== بدء اللعب العادي ====================
function startNormalGame() {
    current = 0;
    score = 0;
    lives = 3;
    streak = 0;
    isDaily = false;
    showScreen('play');
    nextQuestion();
}

// ==================== التحدي اليومي ====================
function startDailyChallenge() {
    if (data.dailyDone && data.dailyDate === today) {
        alert('خلصت التحدي اليومي! ارجع بكرة يا وحش 🔥');
        return;
    }
    current = 0;
    score = 0;
    lives = 5;
    streak = 0;
    isDaily = true;
    showScreen('play');
    nextQuestion();
}

// ==================== عرض السؤال التالي ====================
function nextQuestion() {
    if ((isDaily && current >= 5) || (!isDaily && current >= questions.length) || lives <= 0) {
        endGame();
        return;
    }

    const q = questions[current];
    document.getElementById('question').textContent = q.q;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    q.a.forEach((answer, i) => {
        const btn = document.createElement('div');
        btn.className = 'choice';
        btn.textContent = answer;
        btn.onclick = () => checkAnswer(i === q.c, btn);
        choicesDiv.appendChild(btn);
    });

    document.getElementById('feedback').textContent = '';
    startTimer(isDaily ? 15 : 25);
}

// ==================== الإجابة ====================
function checkAnswer(isCorrect, btn) {
    clearInterval(timer);
    document.querySelectorAll('.choice').forEach(b => b.onclick = null);

    if (isCorrect) {
        score += isDaily ? 100 : 10;
        streak++;
        data.coins += isDaily ? 100 : 10;
        btn.classList.add('correct');
        document.getElementById('feedback').textContent = 'صحيح! ✅';
        playSound('correct');
    } else {
        lives--;
        streak = 0;
        btn.classList.add('wrong');
        document.getElementById('feedback').textContent = 'خطأ! الصحيح: ' + questions[current].a[questions[current].c];
        playSound('wrong');
    }

    updateStats();
    saveData();
    current++;
    setTimeout(nextQuestion, 1800);
}

// ==================== المؤقت ====================
function startTimer(seconds) {
    let timeLeft = seconds;
    const bar = document.getElementById('timer-bar');
    bar.style.width = '100%';

    timer = setInterval(() => {
        timeLeft--;
        bar.style.width = (timeLeft / seconds * 100) + '%';

        if (timeLeft <= 0) {
            clearInterval(timer);
            lives--;
            updateStats();
            saveData();
            current++;
            nextQuestion();
        }
    }, 1000);
}

// ==================== تلميح ====================
function useHint() {
    if (data.coins >= 30) {
        data.coins -= 30;
        document.getElementById('feedback').textContent = 'تلميح: ' + questions[current].h;
        updateStats();
        saveData();
    } else {
        alert('عملاتك مش كفاية يا ملك');
    }
}

// ==================== مشاهدة إعلان ====================
function watchRewardAd() {
    data.coins += 50;
    lives = Math.min(lives + 1, 5);
    updateStats();
    saveData();
    alert('✅ +50 عملة + قلب إضافي');
    playSound('win');
}

// ==================== نهاية اللعبة ====================
function endGame() {
    clearInterval(timer);

    if (isDaily) {
        data.coins += 500;
        data.dailyDone = true;
        data.dailyDate = today;
        alert('🎉 مبروك! كسبت 500 عملة من التحدي اليومي!');
    }

    if (score > data.highScore) data.highScore = score;

    document.getElementById('finalScore').textContent = score;
    showScreen('end');
    saveData();
    playSound('win');
}

// ==================== الإعدادات ====================
function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
    alert('✅ تم حفظ الإعدادات');
    closeSettings();
}

// ==================== تخطي السؤال (خروج) ====================
function exitQuestion() {
    if (confirm('هتخسر قلب واحد لو خرجت من السؤال. متأكد؟')) {
        lives--;
        updateStats();
        saveData();
        current++;
        nextQuestion();
    }
}

// ==================== الصوت ====================
function playSound(type) {
    const audio = new Audio();
    if (type === 'correct') audio.src = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
    if (type === 'wrong') audio.src = 'https://www.soundjay.com/buttons/sounds/button-10.mp3';
    if (type === 'win') audio.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3';
    audio.play().catch(() => {});
}

// بدء اللعبة عند تحميل الصفحة
updateStats();
showScreen('start');
