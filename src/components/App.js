import {Container} from "react-bootstrap";
import Signup from "./Signup";
import './App.css';
import AuthProvider, {useAuthContext} from "../contexts/AuthContext";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Homepage from "./Homepage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Task from "./Task";
import NavigationBar from './NavigationBar';
import Schedule from "./Schedule";

function App() {
    return (
        
                <Router>
                    <AuthProvider>
                        <NavigationBar />
                        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh"}}>
                        <Routes>
                            <Route path="/" element={<PrivateRoute/>}/>
                            <Route path="/signup" element={<Signup/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/tasks" element={<Task/>}/>
                            <Route path="/schedule" element={<Schedule/>}/>
                        </Routes>
                        </Container>
                    </AuthProvider>
                </Router>
    );
}

// PrivateRoute Component to handle the conditional rendering based on user auth status
function PrivateRoute() {
    const {currentUser} = useAuthContext(); // Use the AuthContext to get the current user

    if (currentUser) {
        return <Dashboard/>;
    } else {
        return <Homepage/>;
    }
}

export default App;
