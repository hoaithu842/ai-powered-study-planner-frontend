import React, {useRef, useState, useEffect} from "react";
import {Form, Button, Card, Container, Alert} from 'react-bootstrap';
import {GoogleLoginButton} from "react-social-login-buttons";
import {useAuthContext} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import axios from 'axios';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();
    const {signup, currentUser, loginWithGoogle} = useAuthContext();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.emailVerified) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmationRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);

            await signup(emailRef.current.value, passwordRef.current.value);

            const user = firebase.auth().currentUser;
            if (user) {
                await user.sendEmailVerification();
            }

            await firebase.auth().signOut();
            alert("Sign-up successful! Please check your email to verify your account.");
            navigate('/login');
        } catch (error) {
            console.error("Signup failed:", error);
            setError('Failed to create an account');
        }
        setLoading(false);
    }

    const handleGoogleLogin = async () => {
        try {
            const token = await loginWithGoogle();
            console.log("Google login successful, token:", token);

            // Call API after successful Google login
            await handleApiCall(token);
        } catch (err) {
            setError("Failed to login with Google.");
            console.error("Google login error:", err);
        }
    };

    const handleApiCall = async (token) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            console.log("API response:", res.data);

            if (res.data && res.data.User) {
                const userData = res.data.User;
                console.log('User data:', userData);

                if (userData.should_update) {
                    navigate('/profile');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            setError("Failed to fetch user data from the API.");
            console.error("API call error:", error);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh"}}>
            <div className="w-100" style={{maxWidth: "400px"}}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Sign Up</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" placeholder="Enter Email" ref={emailRef} required/>
                            </Form.Group>
                            <Form.Group id="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Enter Password" ref={passwordRef} required/>
                            </Form.Group>
                            <Form.Group id="password_confirmation">
                                <Form.Label>Re-Enter Password</Form.Label>
                                <Form.Control type="password" placeholder="Re-Enter Password"
                                              ref={passwordConfirmationRef} required/>
                            </Form.Group>
                            <Button disabled={loading} className="w-100" type="submit">Sign Up</Button>
                        </Form>
                    </Card.Body>
                </Card>

                <div className="w-100 text-center mt-2">
                    Already have an account? <Link to="/login">Log In</Link>
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
