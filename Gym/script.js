// script.js - Versi Final Louis Workout Tracker
let workoutQueue = [];
let currentIndex = 0;
let currentSet = 1;
let isResting = false;
let totalCalories = 0;
let timerInterval;
const userWeight = 70; // Silakan ganti berat badanmu di sini, Louis! ⚖️

// Update Tanggal di Header
document.addEventListener('DOMContentLoaded', () => {
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        dateDisplay.innerText = new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    }
});

// 1. Logika ganti label input secara dinamis
function toggleInputLabel() {
    const select = document.getElementById('exercise-type');
    const type = select.options[select.selectedIndex].dataset.type;
    const label = document.getElementById('unit-label');
    const input = document.getElementById('unit-value');

    if (type === 'reps') {
        label.innerText = "Jumlah Reps:";
        input.value = 12;
    } else {
        label.innerText = "Durasi (Detik):";
        input.value = 30;
    }
}

// 2. Tambah Latihan ke Daftar
function addExercise() {
    const select = document.getElementById('exercise-type');
    const name = select.value;
    const type = select.options[select.selectedIndex].dataset.type;
    const met = parseFloat(select.options[select.selectedIndex].dataset.met);
    const sets = parseInt(document.getElementById('sets').value);
    const unitValue = parseFloat(document.getElementById('unit-value').value);
    const rest = parseInt(document.getElementById('rest-time').value);

    // Hitung estimasi kalori per set
    let durationInMinutes = (type === 'reps') ? (unitValue * 4 / 60) : (unitValue / 60);
    const calPerSet = (met * 3.5 * userWeight / 200) * durationInMinutes;

    workoutQueue.push({ name, type, sets, unitValue, rest, calPerSet });
    renderList();
}

function renderList() {
    const listDiv = document.getElementById('exercise-list');
    listDiv.innerHTML = workoutQueue.map((ex, i) => `
        <div class="exercise-item">
            <span><strong>${i + 1}. ${ex.name}</strong></span>
            <span>${ex.sets} set x ${ex.unitValue} ${ex.type === 'reps' ? 'Reps' : 'Detik'}</span>
        </div>
    `).join('');
    document.getElementById('start-btn').classList.remove('hidden');
}

// 3. Mulai Latihan
function startWorkout() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('workout-screen').classList.remove('hidden');
    updateWorkoutUI();
}

// 4. Update Tampilan Workout (Inti dari Timer & Reps)
function updateWorkoutUI() {
    const ex = workoutQueue[currentIndex];
    const nameDisplay = document.getElementById('active-name');
    const setDisplay = document.getElementById('active-sets');
    const btn = document.getElementById('action-btn');
    const timerContainer = document.getElementById('timer-container');

    // Reset tombol ke kondisi default
    btn.disabled = false;
    btn.style.opacity = "1";

    if (!isResting) {
        // --- MODE LATIHAN ---
        nameDisplay.innerText = ex.name;
        setDisplay.innerText = `Set ${currentSet} dari ${ex.sets}`;
        timerContainer.classList.add('hidden'); // Sembunyikan timer dulu
        
        if (ex.type === 'time') {
            btn.innerText = `▶️ MULAI ${ex.unitValue}s TIMER`;
            btn.style.backgroundColor = "#4834d4";
        } else {
            btn.innerText = "✅ SELESAI SET";
            btn.style.backgroundColor = "#6ab04c";
        }
    } else {
        // --- MODE ISTIRAHAT ---
        nameDisplay.innerText = "☕ ISTIRAHAT";
        setDisplay.innerText = `Nafas dulu, Zero!`;
        btn.innerText = "⏩ SKIP ISTIRAHAT";
        btn.style.backgroundColor = "#eb4d4b";
        
        // Jalankan timer istirahat otomatis
        startTimer(ex.rest, () => {
            isResting = false;
            goToNextStep();
        });
    }
}

// 5. Fungsi Timer Countdown
function startTimer(seconds, callback) {
    const timerContainer = document.getElementById('timer-container');
    const timerDisplay = document.getElementById('timer-display');
    
    timerContainer.classList.remove('hidden'); // Tampilkan lingkaran timer
    let timeLeft = seconds;

    clearInterval(timerInterval);
    
    // Update tampilan pertama kali
    updateTimeText(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimeText(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            callback(); // Lanjut otomatis
        }
    }, 1000);
}

function updateTimeText(totalSeconds) {
    const timerDisplay = document.getElementById('timer-display');
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 6. Tombol Aksi (Next/Selesai/Skip)
function nextStep() {
    const ex = workoutQueue[currentIndex];
    const btn = document.getElementById('action-btn');

    // Jika sedang latihan durasi (Lari/Plank) dan timer belum jalan
    if (!isResting && ex.type === 'time') {
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer.classList.contains('hidden')) {
            btn.innerText = "⏳ SEMANGAT!!";
            btn.disabled = true;
            btn.style.opacity = "0.6";
            
            startTimer(ex.unitValue, () => {
                finishSet();
            });
            return;
        }
    }

    // Jika sedang istirahat atau latihan reps
    if (isResting) {
        clearInterval(timerInterval);
        isResting = false;
        goToNextStep();
    } else {
        finishSet();
    }
}

function finishSet() {
    const ex = workoutQueue[currentIndex];
    totalCalories += ex.calPerSet;
    document.getElementById('calories-display').innerText = totalCalories.toFixed(1);
    
    isResting = true;
    updateWorkoutUI();
}

function goToNextStep() {
    const ex = workoutQueue[currentIndex];
    if (currentSet < ex.sets) {
        currentSet++;
    } else {
        currentIndex++;
        currentSet = 1;
    }

    if (currentIndex < workoutQueue.length) {
        updateWorkoutUI();
    } else {
        alert(`GOKIL ZERO! 🎉\nLatihan selesai! Total: ${totalCalories.toFixed(1)} kcal terbakar! 🔥`);
        location.reload();
    }
}