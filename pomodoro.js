document.addEventListener("DOMContentLoaded", () => {
  const timerEl = document.getElementById("timer");
  const workEl = document.getElementById("workTime");
  const breakEl = document.getElementById("breakTime");
  const setBtn = document.getElementById("setTimeBtn");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  if (!timerEl || !workEl || !breakEl || !setBtn || !startBtn || !pauseBtn || !resetBtn) return;

  let workDuration = (parseInt(workEl.value)||25) * 60;
  let breakDuration = (parseInt(breakEl.value)||5) * 60;
  let time = workDuration;
  let timerInterval = null;
  let running = false;
  let isWorkSession = true;

  function updateDisplay(){
    const m = Math.floor(time/60), s=time%60;
    timerEl.textContent = `${m}:${s<10?"0":""}${s}`;
  }
  function stopTimer(){ running=false; clearInterval(timerInterval); timerInterval=null; }

  setBtn.onclick = () => {
    const w = parseInt(workEl.value)||25;
    const b = parseInt(breakEl.value)||5;
    workDuration = w*60; breakDuration=b*60; time = workDuration; isWorkSession=true; updateDisplay();
  };
  startBtn.onclick = () => {
    if (running) return;
    running=true;
    timerInterval = setInterval(()=>{
      time--; updateDisplay();
      if (time<=0){
        stopTimer();
        if (isWorkSession){ time=breakDuration; alert("Work complete! Break time."); }
        else { time=workDuration; alert("Break finished! Back to work!"); }
        isWorkSession=!isWorkSession;
        updateDisplay();
      }
    },1000);
  };
  pauseBtn.onclick = stopTimer;
  resetBtn.onclick = () => { stopTimer(); time = workDuration; isWorkSession=true; updateDisplay(); };

  updateDisplay();
});
