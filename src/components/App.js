import { Container } from "react-bootstrap";
import Signup from "./Signup";
import './App.css';
import AuthProvider, { useAuthContext } from "../contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./Homepage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Task from "./Task";
import Analytics from "./Analytics";
import NavigationBar from './NavigationBar';
import Schedule from "./Schedule";
import { Navigate } from "react-router";

function App() {
    return (
        <Router>
            <AuthProvider>
                <NavigationBar />
                <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                    <Routes>
                        <Route path="/" element={<PrivateRoute><Schedule /></PrivateRoute>} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/tasks" element={<PrivateRoute><Task /></PrivateRoute>} />
                        <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
                        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    </Routes>
                </Container>
            </AuthProvider>
        </Router>
    );
}

function PrivateRoute({ children }) {
    const { currentUser } = useAuthContext(); // Use the AuthContext to get the current user

    if (currentUser && currentUser.emailVerified) {
        return children;
    }

    return <Navigate to="/login" replace />;
}

export default App;
