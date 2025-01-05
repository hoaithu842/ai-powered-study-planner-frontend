import React, {createContext, useContext, useEffect, useState} from 'react';
import {auth} from "../config/firebase-config";
import firebase from "firebase/compat/app"; // Firebase configuration
import axios from "axios";

const AuthContext = createContext();

export function useAuthContext() {
    return useContext(AuthContext);
}

export default function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState(null);  // Store the authenticated user
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);  // Store any errors from login/signup
    const [token, setToken] = useState(null);  // Store the auth token
    const [userProfile, setUserProfile] = useState(null);

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        return auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                return user.getIdToken(); // Get the token after Google login
            })
            .catch((error) => {
                setError(error.message); // Set the error message for Google login failure
                throw error; // Re-throw error for further handling
            });
    }

    function logout() {
        return auth.signOut();
    }

    const updatePasswordForUser = async (currentPassword, newPassword) => {
        if (!currentUser) {
            throw new Error("User is not logged in");
        }

        try {
            // Reauthenticate user with current password
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
            await currentUser.reauthenticateWithCredential(credential);

            // Update password
            await currentUser.updatePassword(newPassword);
            return "Password updated successfully";
        } catch (error) {
            console.error("Error updating password:", error);
            throw new Error("Failed to update password");
        }
    };

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

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUserProfile(response.data); // Store user profile data
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };

        fetchProfile();
    }, [currentUser]);

    const value = {
        currentUser,  // Current authenticated user
        setCurrentUser,
        token,        // Auth token
        login,        // Login function
        signup,       // Signup function
        logout,       // Logout function
        error,        // Error state for handling any authentication errors
        setError,      // Function to set error state
        loginWithGoogle, // Login With Google function
        userProfile,
        updatePasswordForUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : <div>Loading...</div>} {/* Show loading state until Firebase auth is done */}
        </AuthContext.Provider>
    );
}
