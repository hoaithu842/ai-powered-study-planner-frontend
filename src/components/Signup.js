import React, { useRef } from "react";
import { Form, Button, Card } from 'react-bootstrap';
import { GoogleLoginButton } from "react-social-login-buttons";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Sign Up</h2>
                    <Form>
                        <Form.Group id="email">
                            <Form.Label column="lg">Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter Email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label column="lg">Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter Password" ref={passwordRef} required />
                        </Form.Group>
                        <Form.Group id="password_confirmation">
                            <Form.Label column="lg">Re-Enter Password</Form.Label>
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
                    onClick={() => console.log("Google login clicked!")}
                    style={{ width: "100%" }}
                />
            </div>
        </>
    );
}
