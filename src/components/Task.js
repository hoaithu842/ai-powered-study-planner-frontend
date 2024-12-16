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
        <Container style={{ minHeight: '100vh' }} className="d-flex justify-content-center align-items-center mt-4">
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
                                <div className="d-flex justify-content-end mt-3">
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => console.log(`Edit Task ${task._id}`)}
                                        style={{

                                            justifyContent: 'center', // Center the icon horizontally
                                            alignItems: 'center', // Center the icon vertically
                                            marginRight: '10px', // Space between the buttons
                                          }}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => console.log(`Delete Task ${task._id}`)}
                                        style={{ color: "red" }}
                                    >
                                        <FaTrashAlt />
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
                                as="select"
                                name="priority"
                                value={newTask.priority}
                                onChange={handleChange}
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
                                value={newTask.status}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskStartDate" className="mt-3">
                            <Form.Label>Start Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={newTask.startDate}
                                    onChange={handleDateChange}
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
                                    selected={newTask.endDate}
                                    onChange={handleDateChange}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCreateTask}>
                        Create Task
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
