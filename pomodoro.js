let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let time = workDuration;
let timerInterval = null;
let running = false;
let isWorkSession = true;

// Update the timer display
function updateDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById("timer").innerText =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Set custom times
document.getElementById("setTimeBtn").onclick = () => {
    const work = parseInt(document.getElementById("workTime").value);
    const brk = parseInt(document.getElementById("breakTime").value);

    if (work > 0 && brk > 0) {
        workDuration = work * 60;
        breakDuration = brk * 60;
        time = workDuration;
        isWorkSession = true;
        updateDisplay();
    } else {
        alert("Enter valid numbers!");
    }
};

// Start button
document.getElementById("startBtn").onclick = () => {
    if (!running) {
        running = true;

        timerInterval = setInterval(() => {
            time--;
            updateDisplay();

            if (time <= 0) {
                clearInterval(timerInterval);

                if (isWorkSession) {
                    alert("Work session complete! Break time!");
                    time = breakDuration;
                } else {
                    alert("Break finished! Back to work!");
                    time = workDuration;
                }

                isWorkSession = !isWorkSession;
                updateDisplay();
                running = false;
            }
        }, 1000);
    }
};

// Pause button
document.getElementById("pauseBtn").onclick = () => {
    running = false;
    clearInterval(timerInterval);
};

// Reset button
document.getElementById("resetBtn").onclick = () => {
    running = false;
    clearInterval(timerInterval);
    time = workDuration;
    isWorkSession = true;
    updateDisplay();
};

// Initial display
updateDisplay();
