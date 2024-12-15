import React, {useState, useEffect} from "react";
import {Button, Card, Container, Form, Alert} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useAuthContext} from "../contexts/AuthContext";  // Import axios for API calls

export default function Profile() {
    const {token, logout} = useAuthContext(); // Destructure logout from context
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchProfile(token);
        }
    }, [token])

    const fetchProfile = async (token) => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data)
            const userData = response.data;
            setUser(userData);
            setName(userData.name);
            setEmail(userData.email);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch profile");
            setLoading(false);
        }
    }

    // Handle the form submission to update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");  // Or any other way you store token
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/profile`,
                {name, email},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUser(response.data);  // Update the user state with the new data
            setLoading(false);
            alert("Profile updated successfully!");
        } catch (error) {
            setError("Failed to update profile");
            setLoading(false);
        }
    };

    // If the page is loading, show a loading indicator
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
                <h3>Loading...</h3>
            </Container>
        );
    }

    // If no user is found, show an error message
    if (!user) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
                <Alert variant="danger">User not found. Please log in again.</Alert>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
            <div style={{maxWidth: "500px", width: "100%"}}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Profile</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleUpdateProfile}>
                            <Form.Group id="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group id="email" className="mt-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button disabled={loading} className="w-100 mt-4" type="submit">
                                Update Profile
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                <div className="w-100 text-center mt-3">
                    <Button onClick={() => navigate('/')} className="w-100 mt-2" variant="outline-danger">
                        Cancel
                    </Button>
                </div>
            </div>
        </Container>
    );
}
