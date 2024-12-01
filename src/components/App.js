import {Container} from "react-bootstrap";
import Signup from "./Signup";
import './App.css';
import AuthProvider from "../contexts/AuthContext";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{minHeight: "100vh"}}>
            <div className="w-100" style={{maxWidth: "400px"}}>
                <Router>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<Dashboard/>}/>
                            <Route path="/signup" element={<Signup/>}/>
                            <Route path="/login" element={<Login/>}/>
                        </Routes>
                    </AuthProvider>
                </Router>
            </div>
        </Container>
    );
}

export default App;
