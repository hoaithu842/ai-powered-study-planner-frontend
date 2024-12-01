import React, {useRef, useEffect, useState} from "react";
import {Form, Button, Card, Container, Alert} from 'react-bootstrap';
import {GoogleLoginButton} from "react-social-login-buttons";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import {useAuthContext} from "../contexts/AuthContext";
import TodoList from "./TodoList";
import {Link} from "react-router";
import {useNavigate} from 'react-router-dom';

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const {login} = useAuthContext();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('')
            setLoading(true)
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch {
            setError('Failed to login')
        }
        setLoading(false)
    }

    const [auth, setAuth] = useState(window.localStorage.getItem("auth") === 'true');
    const [token, setToken] = useState('');

    useEffect(() => {
        firebase.auth().onAuthStateChanged((userCredential) => {
            console.log(userCredential);
            if (userCredential) {
                setAuth(true);
                window.localStorage.setItem('auth', 'true');
                userCredential.getIdToken().then(idToken => {
                    console.log(idToken);
                    setToken(idToken);
                });
            }
        });
    }, []); // Add empty dependency array to avoid endless loop

    const loginWithGoogle = () => {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then((userCredential) => {
                console.log(userCredential);
                if (userCredential) {
                    setAuth(true);
                    window.localStorage.setItem('auth', 'true');
                }
            });
    };

    const logout = () => {
        firebase.auth().signOut()
            .then(() => {
                console.log("User signed out");
                setAuth(false);
                window.localStorage.removeItem('auth');
                setToken('');
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            });
    };


    return (
        <>
            {auth ? (
                <>
                    <TodoList token={token}/>
                    <div className="w-100 text-center mt-3">
                        <Button onClick={logout} className="w-100">
                            Log In
                        </Button>
                    </div>
                </>
            ) : (
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
                                        <Form.Control type="password" placeholder="Enter Password" ref={passwordRef}
                                                      required/>
                                    </Form.Group>
                                    <Button disabled={loading} className="w-100" type="submit">Log In</Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="w-100 text-center mt-2">
                            Do not have an account? <Link to="/signup">Sign Up</Link>
                        </div>

                        <div className="w-100 text-center mt-3">
                            <GoogleLoginButton
                                onClick={loginWithGoogle}
                                style={{width: "100%"}}
                            />
                        </div>
                    </div>
                </Container>
            )}
        </>
    );
}