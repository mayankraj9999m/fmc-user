// src/layouts/RootLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function RootLayout() {
    const { loading } = useAuth();
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);

    // Enforce a minimum of 1.5 seconds for the splash screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Show Splash Screen if either the API is still loading OR 1.5s hasn't passed yet
    const showSplash = loading || !minTimeElapsed;

    if (showSplash) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "var(--bg-body)",
                animation: "fadeIn 0.5s ease-in-out"
            }}>
                <img 
                    src="/logo_final.png" /* Make sure this matches your best logo file */
                    alt="Fix My Campus" 
                    style={{ 
                        width: "120px", 
                        height: "120px", 
                        objectFit: "contain", 
                        marginBottom: "1.5rem",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        padding: "8px",
                        // boxShadow: "0 8px 16px var(--nav-shadow)"
                    }}
                />
                <h1 style={{ 
                    fontSize: "2rem", 
                    fontWeight: "800", 
                    color: "var(--text-title)", 
                    margin: 0,
                    letterSpacing: "-0.5px"
                }}>
                    Fix My Campus
                </h1>
                <p style={{ 
                    marginTop: "0.5rem", 
                    color: "var(--text-muted)", 
                    fontSize: "1rem",
                    animation: "pulse 1.5s ease-in-out infinite"
                }}>
                    Loading app....
                </p>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />
            <main className="main">
                <Outlet />
                <Footer />
            </main>
        </div>
    );
}