import {Container} from "react-bootstrap";
import Signup from "./Signup";
import './App.css';
import AuthProvider, {useAuthContext} from "../contexts/AuthContext";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Homepage from "./Homepage";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh"}}>
            <div className="w-100" style={{maxWidth: "400px"}}>
                <Router>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<PrivateRoute/>}/>
                            <Route path="/signup" element={<Signup/>}/>
                            <Route path="/login" element={<Login/>}/>
                        </Routes>
                    </AuthProvider>
                </Router>
            </div>
        </Container>
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
