import React, { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import { Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuthContext } from "../contexts/AuthContext";
import axios from "axios";
import AnalyticsTotal from "../components/AnalyticsTotal";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
    const { token, logout } = useAuthContext();
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchAnalytics(token);
        }
    }, [token]);

    // Fetch focus analytics
    const fetchAnalytics = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/focus`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <h3>Loading...</h3>
            </Container>
        );
    }

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
                            <Line
                                data={{
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
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Task Progress</Card.Title>
                            {analytics?.taskProgress?.map((task) => (
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

            {/* Render the new AnalyticsTotal component */}
            <AnalyticsTotal token={token} />
        </Container>
    );
}
