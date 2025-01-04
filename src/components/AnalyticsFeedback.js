import React, { useState, useEffect } from 'react';
import { Card, Container } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const AnalyticsFeedback = ({ token }) => {
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchFeedback(token);
        }
    }, [token]);

    // Fetch feedback data
    const fetchFeedback = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/feedback`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFeedback(response.data);
        } catch (err) {
            setError('Failed to fetch feedback.');
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!feedback) {
        return <p>Loading...</p>;
    }

    return (
        <Container>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Feedback Summary</Card.Title>
                    <ReactMarkdown>{feedback.message}</ReactMarkdown>
                    <hr />
                    <ReactMarkdown>{feedback.feedback}</ReactMarkdown>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AnalyticsFeedback;
