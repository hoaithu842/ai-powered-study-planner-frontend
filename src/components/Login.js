import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, Container, Form} from 'react-bootstrap';
import {GoogleLoginButton} from "react-social-login-buttons";
import {useAuthContext} from "../contexts/AuthContext";
import {useNavigate} from 'react-router-dom';
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import {Link} from "react-router";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const {login, currentUser} = useAuthContext();  // Access currentUser from AuthContext
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');  // Redirect to homepage if logged in
        }
    }, [currentUser, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            // On successful login, navigate to the homepage
            navigate('/');
        } catch {
            setError('Failed to login');
        }
        setLoading(false);
    }

    const loginWithGoogle = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then((userCredential) => {
                if (userCredential) {
                    navigate('/');
                }
            })
            .catch((error) => {
                console.error("Error with Google login: ", error);
            });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh"}}>
            <div className="w-100" style={{maxWidth: "400px"}}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Log In</h2>
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
                            <Button disabled={loading} className="w-100" type="submit">Log In</Button>
                        </Form>
                    </Card.Body>
                </Card>

                <div className="w-100 text-center mt-2">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
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
