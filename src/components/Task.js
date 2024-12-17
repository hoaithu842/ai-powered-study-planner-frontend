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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewTask({ title: "", description: "", priority: "", status: "", startTime: new Date(), endTime: new Date() });
    }
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Todo",
        startTime: new Date(),
        endTime: new Date(),
    });
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
    const handleStartDateChange = (date) => {
        setNewTask((prevState) => ({
            ...prevState,
            startTime: date,
        }));
    };
    const handleEndDateChange = (date) => {
        setNewTask((prevState) => ({
            ...prevState,
            endTime: date,
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
            setShowCreateModal(false); // Close modal
            setNewTask({ title: "", description: "", priority: "", status: "", startTime: new Date(), endTime: new Date() }); // Reset form
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
            setShowEditModal(false);
            setEditingTask(null);
        } catch (err) {
            setError("Failed to edit task");
        }
    };
    const openEditModal = (task) => {
        setEditingTask(task);
        const startTime = new Date(task.startTime);
        const endTime = new Date(task.endTime);
        setEditingTask({ ...task, startTime: startTime, endTime: endTime });
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingTask(null);
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
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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
                {/* Add Task Button */}
                <Button
                    variant="success"
                    onClick={() => setShowCreateModal(true)}
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
                <Modal show={showCreateModal} onHide={handleCloseCreateModal} backdrop="static">
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
                            <Form.Group controlId="taskDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea" rows={2}
                                    placeholder="Enter task description"
                                    name="description"
                                    value={newTask.description}
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
                                    as="select"
                                    name="status"
                                    value={newTask.status}
                                    onChange={handleChange}
                                >
                                    <option value="Todo">To do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="taskStartTime" className="mt-3">
                                <Form.Label>Start Date & Time</Form.Label>
                                <div className="d-block">
                                    <DatePicker
                                        selected={newTask.startTime}
                                        onChange={handleStartDateChange}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="form-control"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group controlId="taskEndTime" className="mt-3">
                                <Form.Label>End Date & Time</Form.Label>
                                <div className="d-block">
                                    <DatePicker
                                        selected={newTask.endTime}
                                        onChange={handleEndDateChange}
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

    return (
        <Container style={{ minHeight: '100vh' }} className="justify-content-center mt-4">
            <Row style={{padding: "20px"}}>
                {tasks.map((task) => (
                    <Col xs={12} sm={12} md={12} lg={12} key={task._id} className="mb-4 d-flex justify-content-center">
                        <Card style={{ width: "30rem" }}>
                            <Card.Body>
                                <Card.Title>{task.title}</Card.Title>
                                <Card.Subtitle className="text-muted">{task.description}</Card.Subtitle>
                                <Card.Text className="mb-0 fs-6 fw-lighter">{formatDate(task.startTime)} - {formatDate(task.endTime)}
                                </Card.Text>
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
                                        : task.status === 'In Progress'
                                        ? 'primary' 
                                        : task.status === 'Completed'
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
                onClick={() => setShowCreateModal(true)}
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
            <Modal show={showCreateModal} onHide={handleCloseCreateModal} backdrop="static">
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
                        <Form.Group controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea" rows={2}
                                placeholder="Enter task description"
                                name="description"
                                value={newTask.description}
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
                                as="select"
                                name="status"
                                value={newTask.status}
                                onChange={handleChange}
                            >
                                <option value="Todo">To do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="taskStartTime" className="mt-3">
                            <Form.Label>Start Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={newTask.startTime}
                                    onChange={handleStartDateChange}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="taskEndTime" className="mt-3">
                            <Form.Label>End Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={newTask.endTime}
                                    onChange={handleEndDateChange}
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

            {/* Modal for editing an existing task */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task title"
                                name="title"
                                value={editingTask ? editingTask.title : ""}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea" rows={2}
                                placeholder="Enter task description"
                                name="description"
                                value={editingTask ? editingTask.description : ""}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskPriority" className="mt-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Control
                                as="select"
                                name="priority"
                                value={editingTask ? editingTask.priority : ""}
                                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="taskStatus" className="mt-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                as="select"
                                name="status"
                                value={editingTask ? editingTask.status : ""}
                                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                            >
                                <option value="Todo">To do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="taskStartTime" className="mt-3">
                            <Form.Label>Start Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={editingTask ? editingTask.startTime : new Date()}
                                    onChange={(date) => setEditingTask({ ...editingTask, startTime: date })}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="taskEndTime" className="mt-3">
                            <Form.Label>End Date & Time</Form.Label>
                            <div className="d-block">
                                <DatePicker
                                    selected={editingTask ? editingTask.endTime : new Date()}
                                    onChange={(date) => setEditingTask({ ...editingTask, endTime: date })}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleEditTask}>
                        Save Changes
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
