import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardStudent } from "../api";

const Onboarding = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [formData, setFormData] = useState({
        google_id: user?.google_id || "",
        hostel_name: "Dhauladhar",
        room_no: "",
        floor_no: 0,
        phone_number: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await onboardStudent(formData);
            console.log(res.data);
            alert("Setup Complete!");
            navigate("/dashboard");
        } catch (error) {
            alert("Error updating profile");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Complete Your Profile</h2>
            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}
            >
                <select onChange={(e) => setFormData({ ...formData, hostel_name: e.target.value })}>
                    <option value="Dhauladhar">Dhauladhar (Boys)</option>
                    <option value="Shivalik">Shivalik (Boys)</option>
                    <option value="Yamuna">Yamuna (Girls)</option>
                </select>

                <input
                    placeholder="Room No (e.g., 304)"
                    required
                    onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                />

                <input
                    type="number"
                    placeholder="Floor (0-7)"
                    min="0"
                    max="7"
                    required
                    onChange={(e) => setFormData({ ...formData, floor_no: e.target.value })}
                />

                <input
                    placeholder="Phone Number"
                    required
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />

                <button type="submit">Save & Continue</button>
            </form>
        </div>
    );
};

export default Onboarding;
