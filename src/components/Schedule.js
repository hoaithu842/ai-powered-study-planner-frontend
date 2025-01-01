import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";
import Timer from "./Timer";
import Modal from 'react-bootstrap/Modal';

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop(Calendar);

const Schedule = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const { token } = useAuthContext();
  
  useEffect(() => {
    if (token) {
      fetchTasks(token);
    }
  }, [token]);

  const fetchTasks = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedTasks = response.data.map((task) => ({
        id: task._id,
        title: task.title,
        start: new Date(task.startTime),
        end: new Date(task.endTime),
        status: task.status || "Todo",
        priority: task.priority,
      }));

      setTasks(fetchedTasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  // Handle task selection
  const handleSelectEvent = (task) => {
    if (task.status === "In Progress") {
      setSelectedTask(task);
      setShowModal(true); // Show modal when task is "In Progress"
    } else {
      setSelectedTask(null);
      setShowModal(false); // Hide modal if task is not "In Progress"
    }
  };

  // Handle drag-and-drop event
  const handleEventDrop = useCallback(
    ({ event, start, end }) => {
      const newStatus = end < new Date() ? "Expired" : event.status;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === event.id ? { ...event, start, end, status: newStatus } : task
        )
      );
      updateTaskOnServer(event.id, start, end, newStatus);
    },
    [setTasks]
  );

  const updateTaskOnServer = async (taskId, start, end, newStatus) => {
    const originalTask = tasks.find((task) => task.id === taskId);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        { startTime: start, endTime: end, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Task successfully updated:", response.data);
    } catch (err) {
      console.error("Error updating task:", err.response?.data || err.message);

      // Revert changes locally
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? originalTask : task
        )
      );
    }
  };

  // Calendar Event Styling
  const eventStyleGetter = (event) => {
    let backgroundColor;
    if (event.status === "Expired") {
      backgroundColor = "#f76c6c";
    } else if (event.status === "In Progress") {
      backgroundColor = "#6c9ff7";
    } else {
      backgroundColor = "#6cf76c";
    }
    return { style: { backgroundColor, color: "white", borderRadius: "5px" } };
  };
  const draggableAccessor = (event) => event.status !== "Completed" && event.status !== "Expired";

  const handleCloseModal = () => {
    setShowModal(false); // Hide modal when closed
    setSelectedTask(null); // Clear selected task when modal is closed
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 150px)" }}>
      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DnDCalendar
        localizer={localizer}
        events={tasks}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        draggableAccessor={draggableAccessor}
        onEventDrop={handleEventDrop}
        onSelectEvent={handleSelectEvent}
        resizable={false}
        style={{ height: "100%", width: "100%" }}
        eventPropGetter={eventStyleGetter}
      />
      
      {/* Modal to display the Timer when a task is selected */}
      {selectedTask && showModal && (
        <Modal show={showModal} onHide={handleCloseModal} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Body>
              <Timer
                task={selectedTask}
                onSessionEnd={() => {
                  setShowModal(false); // Close modal when session ends
                  alert("Session completed!");
                }}
              />
            </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Schedule;
