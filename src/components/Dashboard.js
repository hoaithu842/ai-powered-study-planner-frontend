import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext'; // Ensure this import is correct
import axios from 'axios';
import { Button } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';  // For rendering markdown

export default function Dashboard() {
    const { token, logout } = useAuthContext(); // Destructure logout from context
    const [todos, setTodos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null); // State to store feedback

    useEffect(() => {
        if (token) {
            fetchData(token);
        }
    }, [token]);

    // Function to fetch todos from the API
    const fetchData = async (token) => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/todos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setTodos(res.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
            setError('Failed to fetch todos. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the analyze request
    const handleAnalyze = async () => {
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

    return (
        <div>
            {/* Analyze button */}
            <Button onClick={handleAnalyze} variant="primary" className="mb-3">
                Analyze
            </Button>

            {/* Display feedback as markdown */}
            {feedback && (
                <div>
                    <h2>Analysis Feedback</h2>
                    <ReactMarkdown>{feedback}</ReactMarkdown> {/* Render markdown feedback */}
                </div>
            )}
        </div>
    );
}
