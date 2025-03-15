import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User.css";

const User = () => {
    const navigate = useNavigate();

    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");

    // Dummy data for cost/distance
    const [distance] = useState(5.2);
    const [cost] = useState(125);

    const handleBookNow = () => {
        // On successful booking, redirect to /userride
        navigate("/userride");
    };

    return (
        <div className="mainbg">
            <div className="phoneview user-container">
                {/* Large map placeholder area */}
                <div className="map-area">
                    <p>Map will be displayed here</p>
                </div>

                {/* Bottom panel with location inputs, cost, distance, and Book button */}
                <div className="booking-panel">
                    <h2 className="booking-title">Plan Your Ride</h2>

                    <div className="location-inputs">
                        <div className="input-wrapper">
                            <label htmlFor="pickup">Pickup Location</label>
                            <input
                                id="pickup"
                                type="text"
                                placeholder="Enter pickup location"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                            />
                        </div>

                        <div className="input-wrapper">
                            <label htmlFor="drop">Drop Location</label>
                            <input
                                id="drop"
                                type="text"
                                placeholder="Enter drop location"
                                value={drop}
                                onChange={(e) => setDrop(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="estimates-row">
                        <p className="estimate-text">Distance: {distance} km</p>
                        <p className="estimate-text">Estimated Cost: ₹{cost}</p>
                    </div>

                    <button className="book-btn" onClick={handleBookNow}>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User;
