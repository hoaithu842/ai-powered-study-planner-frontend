import React from 'react';
import { Navbar, Nav, Container, Button, Row, Col } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function NavigationBar() {
    const { currentUser, logout } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/');
    }
    return (
        currentUser && (
            <Navbar bg="light" data-bs-theme="light" sticky='top' expand='md'>
                <Container>
                    <Navbar.Brand as={Link} to="/" className='me-auto'>Study Planner</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ width: "auto" }}/>
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Link as={Link} to="/tasks" className={location.pathname === "/tasks" ? "nav-link active" : "nav-link" }>
                                Task
                            </Nav.Link>
                            <Nav.Link as={Link} to="/schedule" className={location.pathname === "/schedule" ? "nav-link active" : "nav-link"  }>
                                Schedule
                            </Nav.Link>
                            <Nav.Link as={Link} to="/profile" className={location.pathname === "/profile" ? "nav-link active me-2" : "nav-link me-2" }>
                            Profile
                            </Nav.Link>
                            <Button
                                variant="dark"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    );
}

export default NavigationBar;
