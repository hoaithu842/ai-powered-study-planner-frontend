import React, {useState, useEffect} from "react";
import {Line} from 'react-chartjs-2';
import {Card, Container, Row, Col, Alert, ProgressBar, Badge, Spinner} from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {useAuthContext} from "../contexts/AuthContext";
import axios from "axios";
import AnalyticsTotal from "./AnalyticsTotal.js";
import AnalyticsFeedback from "./AnalyticsFeedback.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
    const {token} = useAuthContext();
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

    if (error) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="w-100 mt-4">
            <Row className="mb-3">
                <Col xs={12} md={12} lg={7} className="mb-3" style={{height: "50vh"}}>
                    <Card style={{height: "100%"}}>
                        <Card.Body>
                            <Card.Title className="fw-bold">Daily Focus Time</Card.Title>
                            <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}>
                                {loading ? (
                                        <Spinner animation="border" variant="primary"/>
                                    ) :
                                    <Line className="text-center"
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
                                }
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={12} lg={5} className="mb-3" style={{height: "50vh"}}>
                    <Card style={{height: "100%"}}>
                        <Card.Body>
                            <Card.Title className="fw-bold">Task Progress</Card.Title>
                            <div style={{overflowY: "auto", maxHeight: "calc(50vh - 60px)"}}>
                                {loading ? (
                                    <Spinner animation="border" variant="primary"/>
                                ) : (
                                    analytics?.taskProgress?.map((task) => (
                                        <Card key={task.taskId} className="mb-3">
                                            <Card.Body>
                                                <Card.Title className="d-flex justify-content-between">
                                                    <span> {task.taskTitle}</span>
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
                                                <Card.Text><strong>Focus Time:</strong> {task.focusTime} mins<strong>Estimated
                                                    Time:</strong> {task.estimatedTime} hours</Card.Text>
                                                <Card.Text><ProgressBar now={task.progress}
                                                                        label={`${task.progress}%`}></ProgressBar></Card.Text>
                                            </Card.Body>
                                        </Card>
                                    ))
                                )
                                }
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12} md={12} lg={3} className="mb-3">
                    <AnalyticsTotal token={token}/>
                </Col>
                <Col xs={12} md={12} lg={9} className="mb-3">
                    <AnalyticsFeedback token={token}/>
                </Col>
            </Row>
        </Container>
    );
}
