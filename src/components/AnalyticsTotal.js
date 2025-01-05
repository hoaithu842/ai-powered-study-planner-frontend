import React, { useEffect, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
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
        return (
            <div>
            {/* Pie Chart */}
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>Task Status Distribution</Card.Title>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                </Card.Body>
            </Card>
            {/* Progress Bar */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Total Time Spent / Estimated Time</Card.Title>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                </Card.Body>
            </Card>
        </div>
        );
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

    // Calculate progress percentage
    const totalTimeSpent = analyticsTotal.totalTimeSpent || 0;
    const totalEstimatedTime = analyticsTotal.totalEstimatedTime || 1;
    const progressPercentage = Math.round((totalTimeSpent / (totalEstimatedTime * 60)) * 100);

    return (
        <div style={{height: "100%"}}>
            {/* Pie Chart */}
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>Task Status Distribution</Card.Title>
                        <Pie data={pieChartData} />
                </Card.Body>
            </Card>
            {/* Progress Bar */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Total Time Spent / Estimated Time</Card.Title>
                    <div style={{ padding: '20px' }}>
                        <CircularProgressbar
                            value={progressPercentage}
                            text={`${progressPercentage}%`}
                            styles={buildStyles({
                                textColor: '#4e73df',
                                pathColor: progressPercentage > 50 ? '#28a745' : '#dc3545',
                                trailColor: '#d6d6d6',
                            })}
                        />
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AnalyticsTotal;
