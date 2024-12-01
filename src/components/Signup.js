import React, { useRef, useEffect, useState } from "react";
import { Form, Button, Card, Container } from 'react-bootstrap';
import { GoogleLoginButton } from "react-social-login-buttons";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import TodoList from "./TodoList";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();

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
                    <TodoList token={token} />
                    <div className="w-100 text-center mt-3">
                        <Button onClick={logout} className="w-100">
                            Log Out
                        </Button>
                    </div>
                </>
            ) : (
                <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                    <div className="w-100" style={{ maxWidth: "400px" }}>
                        <Card>
                            <Card.Body>
                                <h2 className="text-center mb-4">Sign Up</h2>
                                <Form>
                                    <Form.Group id="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" placeholder="Enter Email" ref={emailRef} required />
                                    </Form.Group>
                                    <Form.Group id="password">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Enter Password" ref={passwordRef} required />
                                    </Form.Group>
                                    <Form.Group id="password_confirmation">
                                        <Form.Label>Re-Enter Password</Form.Label>
                                        <Form.Control type="password" placeholder="Re-Enter Password" ref={passwordConfirmationRef} required />
                                    </Form.Group>
                                    <Button className="w-100" type="submit">Sign Up</Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="w-100 text-center mt-2">
                            Already have an account? Log In
                        </div>

                        <div className="w-100 text-center mt-3">
                            <GoogleLoginButton
                                onClick={loginWithGoogle}
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>
                </Container>
            )}
        </>
    );
}