import React, {useState, useEffect} from "react";
import {Button, Card, Container, Alert, Modal, Form, Row, Col, Badge, DropdownButton, Dropdown} from "react-bootstrap";
import {FaEdit, FaTrashAlt} from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useAuthContext} from "../contexts/AuthContext";
import ReactMarkdown from 'react-markdown';

export default function Task() {
    const {token} = useAuthContext(); // Get token from context
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [feedback, setFeedback] = useState("");
    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
    };
    const sortTasksByPriority = () => {
        const sortedTasks = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        setTasks(sortedTasks);
    };

    const statusOrder = {
        Todo: 1,
        "In Progress": 2,
        Completed: 3,
        Expired: 4,
    };
    const sortTasksByStatus = () => {
        const sortedTasks = [...tasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        setTasks(sortedTasks);
    };

    const [priorityFilter, setPriorityFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

    useEffect(() => {
        const fetchFilteredTasks = async () => {
            try {
                setLoading(true); // Show loading indicator

                // Construct query parameters based on filters
                const params = new URLSearchParams();
                if (priorityFilter && priorityFilter !== "All Priority") {
                    params.append("priority", priorityFilter);
                }
                if (statusFilter && statusFilter !== "All Status") {
                    params.append("status", statusFilter);
                }

                console.log(`Calling API with query: ${params.toString()}`);
                // Call the API with the constructed query
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(`Received data: ${response.data}`);

                setTasks(response.data);
            } catch (error) {
                console.error("Error fetching filtered tasks:", error);
                setError("Failed to fetch filtered tasks. Please try again later.");
            } finally {
                setLoading(false); // Hide loading indicator
            }
        };

        if (priorityFilter !== null || statusFilter !== null) {
            fetchFilteredTasks();
        }
    }, [priorityFilter, statusFilter, token]); // Include dependencies

    const handlePriorityFilterChange = (priority) => {
        setPriorityFilter(priority);
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
    };

    const fetchFeedback = async () => {
        try {
            setLoading(true); // Show loading indicator
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/analyze-schedule`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setFeedback(res.data.feedback); // Set feedback from the response
        } catch (error) {
            console.error('Error fetching analysis:', error);
            setError('Failed to analyze schedule. Please try again later.');
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewTask({
            title: "",
            description: "",
            priority: "",
            status: "",
            estimatedTime: 0,
            startTime: new Date(),
            endTime: new Date()
        });
    }
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Todo",
        estimatedTime: 0,
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
        const {name, value} = e.target;
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
    const [errors, setErrors] = useState({
        title: "",
        estimatedTime: 0,
    });
    const validateForm = () => {
        let valid = true;
        const newErrors = {title: "", estimatedTime: 0};

        // Validate Title
        if (!newTask.title.trim()) {
            newErrors.title = "Title is required.";
            valid = false;
        }

        // Validate Estimate Hour
        const estimatedTime = parseFloat(newTask.estimatedTime);
        if (!newTask.estimatedTime.trim() || isNaN(estimatedTime) || estimatedTime <= 0) {
            newErrors.estimatedTime = "Estimate hour must be a positive number.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };
    const handleSubmit = () => {
        if (validateForm()) {
            handleCreateTask(newTask);
        }
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
            setNewTask({
                title: "",
                description: "",
                priority: "",
                status: "",
                estimatedTime: 0,
                startTime: new Date(),
                endTime: new Date()
            }); // Reset form
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
        setEditingTask({...task, startTime: startTime, endTime: endTime});
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
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
                <h3>Loading...</h3>
            </Container>
        );
    }

    // If there was an error fetching tasks
    if (error) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container style={{minHeight: '100vh'}} className="justify-content-center mt-4">
            <Row style={{padding: "20px"}}>

                <Col xs={12} sm={12} md={6} lg={6} className="mb-4">
                    <div className="d-flex flex-column align-items-center">
                        {/* Add Task & Analyze with AI Buttons */}
                        <Row className="mb-3 w-100">
                            <Col xs={6}>
                                <Button
                                    variant="success"
                                    onClick={() => setShowCreateModal(true)}
                                    style={{width: "100%"}}
                                >
                                    + Add Task
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    variant="info"
                                    onClick={() => fetchFeedback()}
                                    style={{width: "100%"}}
                                >
                                    Analyze with AI
                                </Button>
                            </Col>
                        </Row>
                        {/* Filters */}
                        <Row className="mb-3 w-100">
                            <Col xs={6}>
                                <DropdownButton
                                    variant="outline-secondary"
                                    title={priorityFilter ? `Priority: ${priorityFilter}` : "Priority (Filter)"}
                                    style={{width: "100%"}}
                                    onSelect={handlePriorityFilterChange}
                                >
                                    <Dropdown.Item eventKey="All Priority">All Priority</Dropdown.Item>
                                    <Dropdown.Item eventKey="High">High</Dropdown.Item>
                                    <Dropdown.Item eventKey="Medium">Medium</Dropdown.Item>
                                    <Dropdown.Item eventKey="Low">Low</Dropdown.Item>
                                </DropdownButton>
                            </Col>
                            <Col xs={6}>
                                <DropdownButton
                                    variant="outline-secondary"
                                    title={statusFilter ? `Status: ${statusFilter}` : "Status (Filter)"}
                                    style={{width: "100%"}}
                                    onSelect={handleStatusFilterChange}
                                >
                                    <Dropdown.Item eventKey="All Status">All Status</Dropdown.Item>
                                    <Dropdown.Item eventKey="Todo">Todo</Dropdown.Item>
                                    <Dropdown.Item eventKey="In Progress">In Progress</Dropdown.Item>
                                    <Dropdown.Item eventKey="Completed">Completed</Dropdown.Item>
                                    <Dropdown.Item eventKey="Completed">Expired</Dropdown.Item>
                                </DropdownButton>
                            </Col>
                        </Row>
                        {/* Sorting Buttons  */}
                        <Row className="mb-3 w-100">
                            <Col xs={6}>
                                <Button variant="outline-secondary" style={{width: "100%"}}
                                        onClick={sortTasksByPriority}>
                                    Sort By Priority
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="outline-secondary" style={{width: "100%"}} onClick={sortTasksByStatus}>
                                    By Status
                                </Button>
                            </Col>
                        </Row>

                        {/* Feedback Display */}
                        {feedback && (
                            <Row className="mb-3">
                                <Col xs={12}>
                                    <div className="alert alert-info">
                                        <ReactMarkdown>{feedback}</ReactMarkdown>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>

                </Col>
                <Col xs={12} sm={12} md={6} lg={6} className="mb-4 tasks-list">
                    <Row>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    key={task._id}
                                    className="mb-4 d-flex justify-content-center"
                                >
                                    <Card style={{width: "100%"}}>
                                        <Card.Body>
                                            <Card.Title className="d-flex justify-content-between align-items-center">
                                                <span>{task.title}</span>
                                                <div>
                                                    <Badge
                                                        bg={
                                                            task.priority === "High"
                                                                ? "danger"
                                                                : task.priority === "Medium"
                                                                    ? "warning"
                                                                    : "secondary"
                                                        }
                                                        className="me-2"
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge
                                                        bg={
                                                            task.status === "Todo"
                                                                ? "warning"
                                                                : task.status === "In Progress"
                                                                    ? "primary"
                                                                    : task.status === "Completed"
                                                                        ? "success"
                                                                        : "secondary"
                                                        }
                                                    >
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </Card.Title>
                                            <Card.Subtitle className="text-muted">{task.description}</Card.Subtitle>
                                            <Card.Text className="mb-0 fs-6 fw-lighter">
                                                {formatDate(task.startTime)} - {formatDate(task.endTime)}
                                            </Card.Text>
                                            <Card.Text className="d-flex justify-content-between align-items-center">
                                                <span>
                                                Estimate Hours: {task.estimatedTime}
                                                </span>
                                                {/* Edit and Delete Buttons */}
                                                <div>
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
                                                        <FaTrashAlt className="icon-button"/>
                                                    </Button>
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12} className="d-flex justify-content-center">
                                <p className="text-muted fs-5">No tasks found</p>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
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
                                isInvalid={!!errors.title}
                            />
                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="taskDescription" className="mt-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea" rows={2}
                                placeholder="Enter task description"
                                name="description"
                                value={newTask.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskPriority" className="mt-2">
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
                        <Form.Group controlId="taskEstimatedTime" className="mt-2">
                            <Form.Label>Estimate Hour</Form.Label>
                            <Form.Control
                                type="number"
                                name="estimatedTime"
                                placeholder="Enter estimated hours"
                                value={newTask.estimatedTime}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                isInvalid={!!errors.estimatedTime}
                            />
                            <Form.Control.Feedback type="invalid">{errors.estimatedTime}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="taskStartTime" className="mt-2">
                            <Form.Label>Start Date & Time</Form.Label>
                            <DatePicker
                                selected={newTask.startTime}
                                onChange={handleStartDateChange}
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control ms-2"
                            />
                        </Form.Group>
                        <Form.Group controlId="taskEndTime" className="mt-2">
                            <Form.Label>End Date & Time</Form.Label>
                            <DatePicker
                                selected={newTask.endTime}
                                onChange={handleEndDateChange}
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control ms-3"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSubmit}>
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
                                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea" rows={2}
                                placeholder="Enter task description"
                                name="description"
                                value={editingTask ? editingTask.description : ""}
                                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group controlId="taskPriority" className="mt-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Control
                                as="select"
                                name="priority"
                                value={editingTask ? editingTask.priority : ""}
                                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
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
                                onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
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
                                    onChange={(date) => setEditingTask({...editingTask, startTime: date})}
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
                                    onChange={(date) => setEditingTask({...editingTask, endTime: date})}
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
