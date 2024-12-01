import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext'; // Ensure this import is correct
import axios from 'axios';
import { Button } from "react-bootstrap";

export default function Dashboard() {
    const { token, logout } = useAuthContext(); // Destructure logout from context
    const [todos, setTodos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';  // Redirect to the homepage
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div>
            <h1>List of Todos</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {todos && !loading && !error && (
                <pre>{JSON.stringify(todos, null, 2)}</pre>  // JSON view of todos
            )}

            <Button onClick={handleLogout} variant="danger" className="mb-3">
                Logout
            </Button>
        </div>
    );
}
