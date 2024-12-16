import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function NavigationBar() {
    const { currentUser, logout } = useAuthContext();

    return (
        currentUser && (
            <Navbar bg="light" data-bs-theme="light" sticky='top' expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/tasks">Study Planner</Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
                        <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                        <Nav.Link onClick={logout}>Logout</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        )
    );
}

export default NavigationBar;
