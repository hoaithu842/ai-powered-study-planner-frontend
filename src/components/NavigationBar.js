import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import logo from '../assets/logo64.png';


function NavigationBar() {
    const { currentUser, userProfile } = useAuthContext();
    console.log(userProfile);
    const location = useLocation();
    const navigate = useNavigate();
    return (
        currentUser && (
            <Navbar bg="light" data-bs-theme="light" sticky='top' expand='md'>
                <Container>
                    <Navbar.Brand as={Link} to="/" className='navbar-brand'><img src={logo} />AI-Powered Study Planner</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ width: "auto" }} />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Link as={Link} to="/tasks" className={location.pathname === "/tasks" ? "nav-link active" : "nav-link"}>
                                Task
                            </Nav.Link>
                            <Nav.Link as={Link} to="/schedule" className={location.pathname === "/schedule" ? "nav-link active" : "nav-link"}>
                                Schedule
                            </Nav.Link>
                            <Nav.Link as={Link} to="/analytics" className={location.pathname === "/analytics" ? "nav-link active" : "nav-link"}>
                                Analytics
                            </Nav.Link>
                            <Nav.Link as={Link} to="/profile" className={location.pathname === "/profile" ? "nav-link active me-2" : "nav-link me-2"}>
                                <Image
                                    src={userProfile?.avatar? userProfile.avatar : "https://via.placeholder.com/150"}
                                    alt="User Avatar"
                                    roundedCircle
                                    style={{ width: "30px", height: "30px" }}
                                />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    );
}

export default NavigationBar;
