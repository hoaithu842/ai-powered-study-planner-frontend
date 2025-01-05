import React, {useState, useEffect} from "react";
import {Button, Card, Container, Form, Alert, Modal, Col, Row} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useAuthContext} from "../contexts/AuthContext";  // Import axios for API calls

export default function Profile() {
    const {token, logout, userProfile, updatePasswordForUser} = useAuthContext(); // Destructure logout from context
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(""); // Add state for avatar
    const [newAvatar, setNewAvatar] = useState(""); // Temporarily store new avatar
    const [showModal, setShowModal] = useState(false); // Control modal visibility
    const [shouldUpdateAvatar, setShouldUpdateAvatar] = useState(false); // Flag to check if avatar should be updated
    const [showChangePwModal, setShowChangePwModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwerror, setPwError] = useState("");

    const handleChangePassword = () => {
        setShowChangePwModal(true);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (newPassword !== confirmPassword) {
            setPwError("New password and confirm password do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setPwError("Password must be at least 6 characters long.");
            return;
        }

        setPwError(""); // Clear previous errors
        setLoading(true);

        try {
            // Call the updatePassword function from context
            const message = await updatePasswordForUser(currentPassword, newPassword);
            setSuccess(message);
            setTimeout(() => setSuccess(""), 3000);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowChangePwModal(false);
        } catch (err) {
            setPwError(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile) {
            setUser(userProfile);
            setName(userProfile.name);
            setEmail(userProfile.email);
            setAvatar(userProfile.avatar);
            setLoading(false);
        }
    }, [userProfile]); // Add dependencies to run only when userProfile changes    

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

    const handleLogout = () => {
        logout();
        console.log("logout");
        navigate('/');
    }



    // Handle the form submission to update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            setLoading(true); // Start the loading state

            const payload = {
                name: name ? name : userProfile.name,
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
            //alert("Profile updated successfully!"); // Notify the user of success
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
        <Container style={{minHeight: "100vh"}}>
            <h2 className="text-center mb-4 mt-4">Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Row className="d-flex">
                <Col xs={12} lg={4}>
                {/* Avatar Section */}
                <div className="text-center mb-4" style={{
                    display: "flex",            // Enable Flexbox
                    justifyContent: "center",   // Center horizontally
                    alignItems: "center"        // Center vertically
                }}>
                    <img
                        src={newAvatar || avatar || "https://via.placeholder.com/200"}
                        alt="User Avatar"
                        style={{
                            width: "200px",               // Fixed size for square avatar
                            height: "200px",              // Fixed size for square avatar
                            borderRadius: "50%",          // Circular shape
                            cursor: "pointer",           // Pointer cursor for click interaction
                            objectFit: "cover",          // Ensure image covers the container
                            objectPosition: "center",    // Center the image within the circle
                        }}
                        onClick={handleAvatarClick} // Open modal on click
                    />
                </div>
                </Col>
                <Col xs={12} lg={6}>
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
                            value={email}
                            disabled
                            readOnly
                        />
                    </Form.Group>

                    <Button disabled={loading} className="w-100 mt-4" type="submit">
                        Update Profile
                    </Button>
                </Form>
                <div className="d-flex justify-content-end mt-5">
                <Button variant="warning" className="me-3" onClick={handleChangePassword}>Change Password</Button>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
                </div>
                </Col>
            </Row>
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
            {/* Modal change password*/}
            <Modal show={showChangePwModal}>
                <Modal.Header closeButton onHide={() => setShowChangePwModal(false)}>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pwerror && <Alert variant="danger">{pwerror}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Change Password
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
