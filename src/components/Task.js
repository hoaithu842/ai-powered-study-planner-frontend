import React, { useState, useEffect } from "react";
import { Button, Card, Container, ListGroup, Alert, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";

export default function Task() {
    const { token } = useAuthContext(); // Get token from context
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [newTask, setNewTask] = useState({
        title: "",
        priority: "",
        status: "",
    });
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
        <Container className="d-flex flex-column align-items-center" style={{ minHeight: "100vh", paddingTop: "20px" }}>
            <h2 className="mb-4">Tasks</h2>
            <Button variant="success" onClick={() => setShowModal(true)} className="mb-4">
                Create New Task
            </Button>
            <Card style={{ width: "100%", maxWidth: "600px" }}>
                <Card.Body>
                    <ListGroup variant="flush">
                        {tasks.map((task) => (
                            <ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>{task.title}</h5>
                                    <p className="mb-1 text-muted">Priority: {task.priority}</p>
                                    <p className="mb-0">Status: {task.status}</p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/tasks/${task._id}`)}
                                >
                                    View
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>

            {/* Modal for creating a new task */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task title"
                                name="title"
                                value={newTask.title}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskPriority" className="mt-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task priority"
                                name="priority"
                                value={newTask.priority}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskStatus" className="mt-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task status"
                                name="status"
                                value={newTask.status}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreateTask}>
                        Create Task
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
