import React, {useRef, useState, useEffect} from "react";
import {Form, Button, Card, Container, Alert} from 'react-bootstrap';
import {GoogleLoginButton} from "react-social-login-buttons";
import {useAuthContext} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import axios from 'axios';
import toast from "bootstrap/js/src/toast";
import * as user from "@firebase/auth";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();
    const {signup, currentUser} = useAuthContext();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
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

            await user.sendEmailVerification();
            // Show success notification
            toast.success('Sign-up successful! Please check your email to verify your account.', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 5000, // Auto-close after 5 seconds
            });

            await firebase.auth().signOut();
            navigate('/login');
        } catch {
            setError('Failed to create an account');
        }
        setLoading(false);
    }

    const loginWithGoogle = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then( async (userCredential) => {
                // Get the token after Google login
                const token = await userCredential.getIdToken();

                // Call your API after the Google login is successful
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth`, {
                    headers: {
                        Authorization: `Bearer ${token}`  // Include the token in the Authorization header
                    },
                });

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
            })
            .catch((error) => {
                console.error("Error with Google signup: ", error);
            });
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
                        onClick={loginWithGoogle}
                        style={{width: "100%"}}
                    />
                </div>
            </div>
        </Container>
    );
}
