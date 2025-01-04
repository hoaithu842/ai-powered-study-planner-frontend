import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import { Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuthContext } from "../contexts/AuthContext";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
    const { token, logout } = useAuthContext();
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            console.log(token)
            fetchAnalytics(token);
        }
    }, [token]);

    // Fetch analytics data from the API
    const fetchAnalytics = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/focus`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics.');
        } finally {
            setLoading(false);
        }
    };


    // Chart data for daily focus time
    const dailyFocusChartData = {
        labels: Object.keys(analytics?.dailyFocusTime || {}),
        datasets: [
            {
                label: 'Daily Focus Time (minutes)',
                data: Object.values(analytics?.dailyFocusTime || {}),
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                fill: true,
                tension: 0.3,
            },
        ],
    };

    // Chart data for weekly focus time
    const weeklyFocusChartData = {
        labels: Object.keys(analytics?.weeklyFocusTime || {}),
        datasets: [
            {
                label: 'Weekly Focus Time (minutes)',
                data: Object.values(analytics?.weeklyFocusTime || {}),
                borderColor: '#1cc88a',
                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                fill: true,
                tension: 0.3,
            },
        ],
    };

    // Handle loading state
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <h3>Loading...</h3>
            </Container>
        );
    }

    // Handle error state
    if (error) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="my-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Daily Focus Time</Card.Title>
                            <Line data={dailyFocusChartData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Task Progress</Card.Title>
                            {analytics?.taskProgress?.map((task, index) => (
                                <Card key={task.taskId} className="mb-3">
                                    <Card.Body>
                                        <Card.Title>{task.taskTitle}</Card.Title>
                                        <Card.Text>
                                            <p><strong>Focus Time:</strong> {task.focusTime} minutes</p>
                                            <p><strong>Estimated Time:</strong> {task.estimatedTime} hours</p>
                                            <p><strong>Progress:</strong> {task.progress}%</p>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}