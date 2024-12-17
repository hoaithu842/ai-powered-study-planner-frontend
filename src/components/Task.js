import React, { useState, useEffect } from "react";
import { Button, Card, Container, Alert, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";

export default function Task() {
    const { token } = useAuthContext(); // Get token from context
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setNewTask({ title: "", priority: "", status: "" });
    }
    const [newTask, setNewTask] = useState({
        title: "",
        priority: "",
        status: "",
    });
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [taskToDelete, setTaskToDelete] = useState(null);

    const navigate = useNavigate();

    // Fetch all tasks from the API
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
            setTasks(response.data); // Store tasks in state
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch tasks");
            setLoading(false);
        }
    };

    // Handle change in task input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTask({
            ...newTask,
            [name]: value,
        });
    };
    const handleDateChange = (date) => {
        setNewTask((prevState) => ({
            ...prevState,
            startDate: date,
            endDate: date,
        }));
    };

    // Handle task creation
    const handleCreateTask = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/tasks`,
                newTask,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTasks([...tasks, response.data]); // Add new task to the list
            setShowModal(false); // Close modal
            setNewTask({ title: "", priority: "", status: "" }); // Reset form
        } catch (err) {
            setError("Failed to create task");
        }
    };

    // Handle edit task
    const handleEditTask = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/tasks/${editingTask._id}`,
                editingTask,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            setTasks(tasks.map((task) => (task._id === editingTask._id ? response.data : task)));
            setShowModal(false);
            setEditingTask(null);
        } catch (err) {
            setError("Failed to edit task");
        }
    };
    const openEditModal = (task) => {
        setEditingTask(task); // Load existing task data
        setShowModal(true);
    };

    // Handle delete task
    const handleDeleteTask = async () => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/tasks/${taskToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTasks(tasks.filter((task) => task._id !== taskToDelete));

            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            setError("Failed to delete task");
        }
    };
    
    const openDeleteModal = (taskId) => {
        setTaskToDelete(taskId);
        setShowDeleteModal(true);
    };
    

    // If loading, show a loading message
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <h3>Loading...</h3>
            </Container>
        );
    }

    // If there was an error fetching tasks
    if (error) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // If no tasks are found
    if (tasks.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <h4>No tasks found</h4>
            </Container>
        );
    }

    return (
        <Container style={{ minHeight: '100vh' }} className="justify-content-center mt-4">
            <Row style={{padding: "20px"}}>
                {tasks.map((task) => (
                    <Col xs={12} sm={12} md={12} lg={12} key={task._id} className="mb-4 d-flex justify-content-center">
                        <Card style={{ width: "30rem" }}>
                            <Card.Body>
                                <Card.Title>{task.title}</Card.Title>
                                {/* <Card.Subtitle className="mb-2 text-muted">{task.estimated}</Card.Subtitle> */}
                                {/*<Card.Text>{task.description}</Card.Text> */}
                                <div>
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

                                <Badge
                                    bg={
                                    task.status === 'Todo'
                                        ? 'warning' 
                                        : task.status === 'In progress'
                                        ? 'primary' 
                                        : task.status === 'Done'
                                        ? 'success' 
                                        : 'secondary'
                                    }
                                >
                                    {task.status}
                                </Badge>
                                </div>

                                {/* Edit and Delete Buttons */}
                                <div className="d-flex justify-content-end">
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => openEditModal(task)}
                                        className="border-0 me-2"
                                    >
                                        <FaEdit className="icon-button"/>
                                    </Button>
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => openDeleteModal(task._id)}
                                        className="border-0 text-danger"
                                    >
                                        <FaTrashAlt className="icon-button" />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Add Task Button */}
            <Button
                variant="success"
                onClick={() => setShowModal(true)}
                className="position-fixed"
                style={{
                    bottom: "20px",
                    right: "20px",
                    width: "120px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                + Add Task
            </Button>
            {/* Modal for creating a new / edit task */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingTask ? "Edit Task" : "Create New Task"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task title"
                                name="title"
                                value={editingTask ? editingTask.title : newTask.title}
                                onChange={(e) =>
                                    editingTask
                                        ? setEditingTask({ ...editingTask, title: e.target.value })
                                        : handleChange(e)
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="taskPriority" className="mt-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Control
                                as="select"
                                name="priority"
                                value={editingTask ? editingTask.priority : newTask.priority}
                                onChange={(e) =>
                                    editingTask
                                        ? setEditingTask({ ...editingTask, priority: e.target.value })
                                        : handleChange(e)
                                }
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="taskStatus" className="mt-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task status"
                                name="status"
                                value={editingTask ? editingTask.status : newTask.status}
                                onChange={(e) =>
                                    editingTask
                                        ? setEditingTask({ ...editingTask, status: e.target.value })
                                        : handleChange(e)
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="taskStartDate" className="mt-3">
                            <Form.Label>Start Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={editingTask ? editingTask.startDate : newTask.startDate}
                                    onChange={(date) =>
                                        editingTask
                                            ? setEditingTask({ ...editingTask, startDate: date })
                                            : handleDateChange(date)
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="taskEndDate" className="mt-3">
                            <Form.Label>End Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={editingTask ? editingTask.endDate : newTask.endDate}
                                    onChange={(date) =>
                                        editingTask
                                            ? setEditingTask({ ...editingTask, endDate: date })
                                            : handleDateChange(date)
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={editingTask ? handleEditTask : handleCreateTask}
                    >
                        {editingTask ? "Save Changes" : "Create Task"}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Modal for delete task */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDeleteTask}>
                        Confirm Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
