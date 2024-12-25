import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./Timer.css";

const Timer = ({ task, onSessionEnd }) => {
  const [duration, setDuration] = useState(25); // Focus duration in minutes
  const [breakDuration, setBreakDuration] = useState(5); // Break duration in minutes
  const [timeLeft, setTimeLeft] = useState(null); // Time remaining in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      handleSessionEnd();
    }
    return () => clearInterval(timer); // Cleanup interval when component unmounts or dependencies change
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (task.status !== "In Progress") {
      toast.error("Only tasks 'In Progress' can be timed!");
      return;
    }

    const now = Date.now();
    const taskEndTime = new Date(task.end).getTime();
    const timerEnd = now + duration * 60 * 1000;
    if (timerEnd > taskEndTime) {
      toast.error("Timer duration exceeds the task's end time.");
      return;
    }

    setTimeLeft(duration * 60); // Convert duration from minutes to seconds
    setIsRunning(true); // Start the timer
  };

  const endTimerEarly = () => {
    setIsRunning(false); // Stop the timer
    setTimeLeft(null); // Reset the time
    toast.info("Timer ended early.");
  };

  const handleSessionEnd = () => {
    toast.success("Focus session completed!");
    onSessionEnd(); // Trigger callback for session end actions
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="timer-container">
      <h2 className="timer-title">Task: {task.title}</h2>
      <div className="timer-settings">
        <label>
          Focus Duration (minutes):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
          />
        </label>
        <label>
          Break Duration (minutes):
          <input
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            min="0"
          />
        </label>
      </div>
      <div className="timer-controls">
        <button onClick={startTimer} disabled={isRunning} className="start-btn">
          Start Timer
        </button>
        <button onClick={endTimerEarly} disabled={!isRunning} className="end-btn">
          End Timer
        </button>
      </div>
      <div className="timer-clock">
        {timeLeft !== null && (
          <>
            <h3>{formatTime(timeLeft)}</h3>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
