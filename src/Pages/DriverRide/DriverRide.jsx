import React from "react";
import "./DriverRide.css";

const DriverRide = () => {
    // Dummy user details
    const userName = "Alice Johnson";
    const estimatedEarning = 150;
    const userRating = 4.5;
    const userPhone = "9123456789";

    const handleSupport = () => {
        alert("Support has been triggered for this ride!");
    };

    const handleEndRide = () => {
        alert("Driver ended the ride. Waiting for user to also end the ride.");
    };

    return (
        <div className="mainbg">
            <div className="phoneview driverride-container">
                <div className="map-area">
                    <p>Map with live path will be shown here</p>
                </div>

                <div className="ride-panel">
                    <h2 className="ride-title">Ride Details</h2>
                    <div className="user-info">
                        <p className="info-text">User Name: {userName}</p>
                        <p className="info-text">
                            Estimated Earning: ₹ {estimatedEarning}
                        </p>
                        <p className="info-text">User Rating: {userRating} ★</p>
                        <p className="info-text">Phone: {userPhone}</p>
                    </div>

                    <div className="ride-actions">
                        <button className="support-btn" onClick={handleSupport}>
                            Support
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

export default DriverRide;
