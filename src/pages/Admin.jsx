import React, { useState } from "react";
import { addWorker, createAdmin } from "../api";

const Admin = () => {
    const [worker, setWorker] = useState({
        name: "",
        phone_no: "",
        hostel_name: "Dhauladhar",
        department: "Electrical",
    });

    const handleWorkerSubmit = async () => {
        try {
            await addWorker(worker);
            alert("Worker Added!");
        } catch (err) {
            alert("Error");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin Panel (Test)</h2>

            <h3>Add Worker</h3>
            <div style={{ display: "flex", gap: "10px", flexDirection: "column", maxWidth: "300px" }}>
                <input placeholder="Name" onChange={(e) => setWorker({ ...worker, name: e.target.value })} />
                <input placeholder="Phone" onChange={(e) => setWorker({ ...worker, phone_no: e.target.value })} />
                <select onChange={(e) => setWorker({ ...worker, hostel_name: e.target.value })}>
                    <option value="Dhauladhar">Dhauladhar</option>
                    <option value="Shivalik">Shivalik</option>
                    <option value="Yamuna">Yamuna</option>
                </select>
                <button onClick={handleWorkerSubmit}>Add Worker</button>
            </div>
        </div>
    );
};

export default Admin;
