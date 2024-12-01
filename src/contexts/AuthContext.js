import React, {createContext, useContext, useEffect, useState} from 'react';
import {auth} from "../config/firebase-config";
import firebase from "firebase/compat/app"; // Firebase configuration

const AuthContext = createContext();

export function useAuthContext() {
    return useContext(AuthContext);
}

export default function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState(null);  // Store the authenticated user
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);  // Store any errors from login/signup
    const [token, setToken] = useState(null);  // Store the auth token

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logout() {
        return auth.signOut();
    }

    useEffect(() => {
        return firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                user.getIdToken().then((idToken) => {
                    setToken(idToken);
                });
            } else {
                setCurrentUser(null);
                setToken(null);
            }
            setLoading(false);
        });
    }, []);

    const value = {
        currentUser,  // Current authenticated user
        token,        // Auth token
        login,        // Login function
        signup,       // Signup function
        logout,       // Logout function
        error,        // Error state for handling any authentication errors
        setError      // Function to set error state
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : <div>Loading...</div>} {/* Show loading state until Firebase auth is done */}
        </AuthContext.Provider>
    );
}
