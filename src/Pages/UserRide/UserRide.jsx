import React, { useState } from "react";
import "./UserRide.css";

const UserRide = () => {
    // Dummy driver details
    const driverName = "Rahul Sharma";
    const carNumber = "KA05AB9999";
    const phoneNumber = "9876543210";
    const rating = 4.7;

    // Example handlers
    const handleSafety = () => {
        alert("Safety assistance triggered! (Demo)");
    };

    const handleEndRide = () => {
        alert(
            "User ended the ride. Waiting for driver to also end the ride. (Demo)"
        );
        // In a real app, you'd set userHasEndedRide = true,
        // and wait for the driver to do the same before finalizing.
    };

    return (
        <div className="mainbg">
            <div className="phoneview userride-container">
                {/* Large map placeholder area */}
                <div className="map-area">
                    <p>Map with live path and time will be displayed here</p>
                </div>

                {/* Bottom panel with driver details */}
                <div className="driver-panel">
                    <h2 className="ride-title">Your Ride</h2>
                    <div className="driver-info">
                        <p className="info-text">Driver: {driverName}</p>
                        <p className="info-text">Car Number: {carNumber}</p>
                        <p className="info-text">Phone: {phoneNumber}</p>
                        <p className="info-text">Rating: {rating} ★</p>
                    </div>

                    {/* Action buttons for the user */}
                    <div className="ride-actions">
                        <button className="safety-btn" onClick={handleSafety}>
                            Safety
                        </button>
                        <button className="endride-btn" onClick={handleEndRide}>
                            End Ride
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRide;
