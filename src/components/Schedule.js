import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";

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
      }));

      setTasks(fetchedTasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
      setLoading(false);
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
    try {
        const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        {
            startTime: start,
            endTime: end,
            status: newStatus,
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
        );
        console.log("Task successfully updated:", response.data);
    } catch (err) {
        console.error("Error updating task:", err.response?.data || err.message);

        // Revert the changes to the task if the API call fails
        setTasks((prevTasks) =>
        prevTasks.map((task) =>
            task._id === taskId ? { ...task, } : task
        )
        );
    }
    };

  // Calendar Event Styling
  const eventStyleGetter = (event) => {
    const backgroundColor = event.status === "Expired" ? "#f76c6c" : "#6c9ff7";
    return { style: { backgroundColor, color: "white" } };
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 150px)"}}>
      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DnDCalendar
        localizer={localizer}
        events={tasks}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        draggableAccessor={() => true}
        onEventDrop={handleEventDrop}
        resizable={false}
        style={{ height: "100%", width: "100%" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default Schedule;
