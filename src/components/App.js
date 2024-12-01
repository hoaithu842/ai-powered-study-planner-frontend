import {Container} from "react-bootstrap";
import Signup from "./Signup";
import './App.css';

function App() {
    return (
        <div className="App">

            <Container
                className="d-flex align-items-center justify-content-center"
                style={{minHeight: "100vh"}}>
                <div className="w-100" style={{maxWidth: "400px"}}>
                    <Signup/>
                </div>
            </Container>
        </div>
    )
}

export default App;
