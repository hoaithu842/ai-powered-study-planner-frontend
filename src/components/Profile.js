import React, {useState, useEffect} from "react";
import {Button, Card, Container, Form, Alert, Modal} from 'react-bootstrap';
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
    const [avatar, setAvatar] = useState(""); // Add state for avatar
    const [newAvatar, setNewAvatar] = useState(""); // Temporarily store new avatar
    const [showModal, setShowModal] = useState(false); // Control modal visibility
    const [shouldUpdateAvatar, setShouldUpdateAvatar] = useState(false); // Flag to check if avatar should be updated

    useEffect(() => {
        if (token) {
            fetchProfile(token);
        }
    }, [token])

    const handleAvatarClick = () => {
        setShowModal(true); // Open the modal
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatar(reader.result); // Set the avatar as Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchProfile = async (token) => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userData = response.data;
            setUser(userData);
            setName(userData.name);
            setEmail(userData.email);
            setAvatar(userData.avatar);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch profile");
            setLoading(false);
        }
    }

    // Handle the form submission to update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            setLoading(true); // Start the loading state

            const payload = {
                name,
                email,
                avatar: shouldUpdateAvatar ? newAvatar : avatar, // Use new avatar if updated, otherwise retain the old one
            };

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/profile`,
                payload, // Data sent in the body
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach the token for authentication
                        "Content-Type": "application/json", // Explicitly set the content type
                    },
                }
            );

            setUser(response.data); // Update the user state with the new response data
            setAvatar(response.data.avatar); // Update the avatar state
            setLoading(false); // End the loading state
            alert("Profile updated successfully!"); // Notify the user of success
        } catch (error) {
            setError("Failed to update profile"); // Display an error message
            setLoading(false); // End the loading state
            console.error('Error details:', error.response ? error.response.data : error.message);
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

    const handleModalClose = () => {
        setShowModal(false);
        setNewAvatar("");  // Reset the avatar preview if modal is closed
    };

    const handleAcceptAvatar = () => {
        setShouldUpdateAvatar(true); // Set to true to update the avatar
        setShowModal(false); // Close the modal
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "100vh"}}>
            <div style={{maxWidth: "500px", width: "100%"}}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Profile</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {/* Avatar Section */}
                        <div className="text-center mb-4" style={{
                            display: "flex",            // Enable Flexbox
                            justifyContent: "center",   // Center horizontally
                            alignItems: "center"        // Center vertically
                        }}>
                            <img
                                src={newAvatar || avatar || "https://via.placeholder.com/150"}
                                alt="User Avatar"
                                style={{
                                    width: "150px",               // Fixed size for square avatar
                                    height: "150px",              // Fixed size for square avatar
                                    borderRadius: "50%",          // Circular shape
                                    cursor: "pointer",           // Pointer cursor for click interaction
                                    objectFit: "cover",          // Ensure image covers the container
                                    objectPosition: "center",    // Center the image within the circle
                                }}
                                onClick={handleAvatarClick} // Open modal on click
                            />
                        </div>
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
                                    readOnly
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
            {/* Modal for Avatar Upload */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Set Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Upload New Avatar</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleAvatarChange}/>
                    </Form.Group>
                    {newAvatar && (
                        <div
                            className="text-center mt-3"
                            style={{
                                width: "150px",
                                height: "150px",
                                overflow: "hidden",
                                borderRadius: "50%",
                                display: "flex",            // Flexbox to center the content
                                justifyContent: "center",   // Center horizontally
                                alignItems: "center",       // Center vertically
                                margin: "0 auto"            // Center container itself horizontally
                            }}
                        >
                            <img
                                src={newAvatar}
                                alt="New Avatar"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",    // Ensures the image covers the square container
                                    objectPosition: "center", // Ensures the center of the image is visible
                                }}
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAcceptAvatar}>
                        Accept
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
