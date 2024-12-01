import React from "react";
import {useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Homepage() {
    const navigate = useNavigate();

    return (
        <div className="container-fluid position-relative" style={{height: "100vh"}}>
            <div className="position-absolute top-0 start-0 m-3 fs-4 fw-bold">
                Homepage
            </div>

            <div className="d-flex justify-content-center align-items-center h-100">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>
            </div>
        </div>
    );
}
