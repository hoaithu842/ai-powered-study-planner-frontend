import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./Timer.css";
import { Button, Form, Badge } from "react-bootstrap";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";

const Timer = ({ task, onSessionEnd, onTaskUpdate }) => {
  const [duration, setDuration] = useState(25); // Focus duration in minutes
  const [breakDuration, setBreakDuration] = useState(5); // Break duration in minutes
  const [timeLeft, setTimeLeft] = useState(null); // Time remaining in seconds
  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusTime, setIsFocusTime] = useState(true); // Toggle between focus and break time
  const { token } = useAuthContext();
  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      handleSessionEnd();
    }

    // Check if the task deadline is reached
    const now = new Date();
    if (isRunning && task.end && now >= new Date(task.end)) {
      clearInterval(timer);
      toast.error("Task deadline reached. Timer stopped.");
      setIsRunning(false);
      setTimeLeft(null);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, task.end]);

  const startTimer = () => {
    if (task.status !== "In Progress") {
      toast.error("Only tasks 'In Progress' can be timed!");
      return;
    }
    const now = Date.now();
    setStartTime(now);
    const taskEndTime = new Date(task.end).getTime();
    const timerEnd = now + duration * 60 * 1000;
    if (timerEnd > taskEndTime) {
      toast.error("Timer duration exceeds the task's end time.");
      return;
    }

    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsFocusTime(true);
  };

  const endTimerEarly = () => {
    setIsRunning(false);
    setTimeLeft(null); 
    handleSessionEnd();
    toast.info("Timer ended early.");
  };

  const handleSessionEnd = async () => {
    const endTime = new Date();
    const sessionDuration = ((duration*60 - timeLeft) / 60).toFixed(1);

    const sessionData = {
      task: task.id,
      startTime: startTime,
      endTime,
      duration: parseFloat(sessionDuration),
    };
  
    try {
      await saveTimerSession(sessionData);
      if (isFocusTime) {
        toast.success("Focus session completed! Starting break time.");
        setStartTime(null);
        setTimeLeft(breakDuration * 60); // Switch to break time
        setIsFocusTime(false);
      } else {
        toast.success("Break session completed! Starting focus time.");
        setTimeLeft(duration * 60); // Switch to focus time
        setIsFocusTime(true);
      }
    } catch (error) {
      toast.error("Error saving timer session: " + error.message);
    }
  };
  
  const saveTimerSession = async (sessionData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/timer`,
        sessionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Timer session saved:", response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };
  
  const markTaskAsDone = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${task.id}`,
        { status: "Completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTaskUpdate(task.id, "Completed");
      setIsRunning(false);
      setTimeLeft(null);
      handleSessionEnd();
      onSessionEnd();
    } catch (error) {
      toast.error("Error updating task status: " + error.message);
    }
  };  

  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h2 className="timer-title">{task.title}</h2>
      </div>
      <p className="timer-dates">
        From {new Date(task.start).toLocaleString()} <br />
        To {new Date(task.end).toLocaleString()}
      </p>
      <div className="timer-badge">
        <Badge
            bg={
            task.priority === 'High'
                ? 'danger'
                : task.priority === 'Medium'
                ? 'warning'
                : 'secondary'
            }
            className="me-2"
        >
            {task.priority}
        </Badge>
      </div>
      <div className="timer-settings">
        <Form.Group>
          <Form.Label>Focus Duration (minutes):</Form.Label>
          <Form.Control
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Break Duration (minutes):</Form.Label>
          <Form.Control
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            min="1"
          />
        </Form.Group>
      </div>
      <div className="timer-controls">
        <Button variant="success" onClick={startTimer} disabled={isRunning}>
          Start
        </Button>
        <Button variant="danger" onClick={endTimerEarly} disabled={!isRunning}>
          Reset
        </Button>
        <Button variant="outline-success" onClick={markTaskAsDone}>
          Mark as Completed
        </Button>
      </div>
      <div className="timer-clock">
        {timeLeft !== null && (
          <>
            <h3 className="time-label">{isFocusTime ? "Work Time" : "Break Time"}</h3>
            <h3>{formatTime(timeLeft)}</h3>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
