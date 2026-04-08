// src/context/AuthProvider.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserProfile } from "../api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // useCallback prevents this function from being recreated on every render
    const fetchProfile = useCallback(async () => {
        try {
            const response = await getUserProfile();
            setUser(response.data.user);
            setRole(response.data.role);
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message);
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); // Reliable dependency thanks to useCallback

    const logout = useCallback(() => {
        setUser(null);
        setRole(null);
    }, []);

    // useMemo prevents consumers from re-rendering unless these specific values change
    const contextValue = useMemo(
        () => ({
            user,
            role,
            error,
            loading,
            setUser,
            setRole,
            logout,
            refreshProfile: fetchProfile,
        }),
        [user, role, error, loading, fetchProfile, logout],
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
