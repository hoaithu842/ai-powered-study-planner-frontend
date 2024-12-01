import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function TodoList({token}) {
    const [todos, setTodos] = useState(null); // Set initial state to null

    useEffect(() => {
        if (token) {
            fetchData(token);
        }
    }, [token]);

    const fetchData = async (token) => {
        try {
            const res = await axios.get("http://localhost:5000/api/todos", {
                headers: {
                    Authorization: `Bearer ${token}` // Pass token in Authorization header
                },
            });
            console.log(res.data);  // Logging the response data for debugging

            setTodos(res.data); // Set the fetched data into state
        } catch (error) {
            console.error('Error fetching todos:', error);
            setTodos(error)
        }
    };

    return (
        <div>
            <h1>List of Todos</h1>
            {/* Display the raw JSON if todos are fetched */}
            {todos ? (
                <pre>{JSON.stringify(todos, null, 0)}</pre> // Render raw JSON data
            ) : (
                <p>Loading...</p> // Show loading text until data is available
            )}
        </div>
    )
}