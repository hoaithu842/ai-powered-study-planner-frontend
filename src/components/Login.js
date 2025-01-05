import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, Container, Form} from 'react-bootstrap';
import {GoogleLoginButton} from "react-social-login-buttons";
import {useAuthContext} from "../contexts/AuthContext";
import {useNavigate} from 'react-router-dom';
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import {Link} from "react-router";
import axios from 'axios';  // Import axios for API calls
import logo from "../assets/logo64.png"

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const {login, currentUser, loginWithGoogle} = useAuthContext();  // Access currentUser from AuthContext
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.emailVerified) {
            navigate('/');  // Redirect to homepage if logged in
        }
    }, [currentUser, navigate]);

    function resetPassword(email) {
        return firebase.auth().sendPasswordResetEmail(email);
    }

    const handleForgotPassword = async () => {
        const email = emailRef.current.value;
        if (!email) {
            setError("Please enter your email address to reset your password.");
            return;
        }
        try {
            setError('');
            await resetPassword(email);
            alert("Password reset email sent. Check your inbox.");
        } catch {
            setError("Failed to send password reset email.");
        }
    };

    const handleApiCall = async (token) => {
        try {
            // Call your API after the login is successful
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth`, {
                headers: {
                    Authorization: `Bearer ${token}` // Include the token in the Authorization header
                },
            });

            console.log("API response:", res.data); // Log the API response for debugging

            // Handle the response (user data) here
            if (res.data && res.data.User) {
                const userData = res.data.User;
                console.log('User data:', userData);

                // Check if 'should_update' is true
                if (userData.should_update) {
                    // If the user needs to update their profile, navigate to profile page
                    navigate('/profile');
                } else {
                    // If the user is all set, navigate to the homepage
                    navigate('/');
                }
            }
        } catch (error) {
            setError("Failed to fetch user data from the API.");
            console.error("API call error:", error);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            const user = await firebase.auth().currentUser;

            if (!user.emailVerified) {
                setError('Please verify your email before logging in.');
                await firebase.auth().signOut(); // Sign out the user if not verified
                setLoading(false);
            } else {
                const token = await user.getIdToken(); // Get the Firebase token
                console.log("Token:", token); // Log token for debugging

                await handleApiCall(token);
            }
        } catch (error) {
            setError('Failed to login');
            console.error("Login error:", error); // Log the error for debugging
        }
        setLoading(false);
    }

    const handleGoogleLogin = async () => {
        try {
            const token = await loginWithGoogle();
            console.log("Google login successful, token:", token);

            // Make the API call using the token
            await handleApiCall(token);
        } catch (err) {
            setError("Failed to login with Google.");
            console.error("Google login error:", err);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center auth">
            <div className="auth-card">
                <Card style={{backgroundColor: "transparent", border: "none"}}>
                    <Card.Body>
                        <div className="text-center mb-3">
                            <img src={logo}></img>
                            <h2 className>Welcome back!</h2>
                        </div>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" placeholder="Enter Email" ref={emailRef} required/>
                            </Form.Group>
                            <Form.Group id="password" className="mt-2">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Enter Password" ref={passwordRef} required/>
                            </Form.Group>
                            <Button disabled={loading} className="w-100 mt-3 fw-bold" type="submit">Login</Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            <Button variant="link" onClick={handleForgotPassword}>
                                Forgot Password?
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                <div className="w-100 text-center mt-2">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
                <div className="w-100 text-center mt-2 text-muted">
                    — or —
                </div>
                <div className="w-100 text-center mt-3">
                    <GoogleLoginButton
                        onClick={handleGoogleLogin}
                        style={{width: "100%"}}
                    />
                </div>
            </div>
        </Container>
    );
}
