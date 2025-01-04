import React, { useEffect, useState } from 'react';
import { ProgressBar, Card, Row, Col } from 'react-bootstrap';
import { Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,   // ✅ Add this
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';

// ✅ Register ArcElement
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,    // ✅ Register here
    Title,
    Tooltip,
    Legend
);

const AnalyticsTotal = ({ token }) => {
    const [analyticsTotal, setAnalyticsTotal] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchAnalyticsTotal(token);
        }
        return () => {
            if (ChartJS.instances.length) {
                ChartJS.instances.forEach((chart) => chart.destroy());
            }
        };    
    }, [token]);

    // Fetch total analytics data
    const fetchAnalyticsTotal = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/total`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnalyticsTotal(response.data);
        } catch (err) {
            setError('Failed to fetch total analytics.');
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!analyticsTotal) {
        return <p>Loading...</p>;
    }

    // Prepare pie chart data
    const pieChartData = {
        labels: ['Todo', 'In Progress', 'Completed', 'Expired'],
        datasets: [
            {
                data: [
                    analyticsTotal.taskStatusCounts['Todo'] || 0,
                    analyticsTotal.taskStatusCounts['In Progress'] || 0,
                    analyticsTotal.taskStatusCounts['Completed'] || 0,
                    analyticsTotal.taskStatusCounts['Expired'] || 0,
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#AA66CC'],
            },
        ],
    };

    // Prepare line chart data for daily time spent
    const dailyTimeChartData = {
        labels: Object.keys(analyticsTotal.dailyTimeSpent || {}),
        datasets: [
            {
                label: 'Time Spent (Minutes)',
                data: Object.values(analyticsTotal.dailyTimeSpent || {}),
                borderColor: '#4BC0C0',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    // Calculate progress percentage
    const totalTimeSpent = analyticsTotal.totalTimeSpent || 0;
    const totalEstimatedTime = analyticsTotal.totalEstimatedTime || 1;
    const progressPercentage = Math.round((totalTimeSpent / (totalEstimatedTime * 60)) * 100);

    return (
        <div>
            {/* Progress Bar */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Total Time Spent / Estimated Time</Card.Title>
                    <ProgressBar now={progressPercentage} label={`${progressPercentage}%`} />
                </Card.Body>
            </Card>

            {/* Pie Chart */}
            <Row className="mb-3">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Task Status Distribution</Card.Title>
                            <Pie data={pieChartData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Line Chart */}
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Daily Time Spent</Card.Title>
                            <Line data={dailyTimeChartData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsTotal;
