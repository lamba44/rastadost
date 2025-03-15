import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Driver.css";

const Driver = () => {
    const navigate = useNavigate();

    const [onDuty, setOnDuty] = useState(false);

    const [showRequestPopup, setShowRequestPopup] = useState(false);

    const [countdown, setCountdown] = useState(0);

    const [popupInterval, setPopupInterval] = useState(null);

    // Dummy stats
    const totalTripsThisMonth = 12;
    const totalEarningsThisMonth = 3400;
    const overallTotalTrips = 145;
    const totalPoints = 87;

    // Driver info (dummy data)
    const driverName = "John Doe";
    const vehicleNumber = "KA01AB1234";
    const licenseNumber = "9876543210";

    const handleDutyToggle = () => {
        setOnDuty((prev) => !prev);
    };

    const handleSimulateRequest = () => {
        if (!onDuty) {
            alert("You must be ON DUTY to receive ride requests!");
            return;
        }

        setShowRequestPopup(true);
        setCountdown(10);

        const intervalId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    setShowRequestPopup(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setPopupInterval(intervalId);
    };

    const handleAcceptRide = () => {
        if (popupInterval) {
            clearInterval(popupInterval);
        }
        navigate("/driverride");
    };

    return (
        <div className="mainbg">
            <div className="phoneview driver-container">
                <h2 className="driver-page-title">Driver Dashboard</h2>

                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="stat-title">Trips (This Month)</p>
                        <p className="stat-value">{totalTripsThisMonth}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-title">Earnings (This Month)</p>
                        <p className="stat-value">₹ {totalEarningsThisMonth}</p>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => navigate("/overalltrips")}
                    >
                        <p className="stat-title">Overall Trips</p>
                        <p className="stat-value">{overallTotalTrips}</p>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => navigate("/points")}
                    >
                        <p className="stat-title">Total Points</p>
                        <p className="stat-value">{totalPoints}</p>
                    </div>
                </div>

                <div className="driver-info">
                    <p>Driver Name: {driverName}</p>
                    <p>Vehicle Number: {vehicleNumber}</p>
                    <p>License Number: {licenseNumber}</p>
                </div>

                <button
                    className={`duty-toggle-btn ${
                        onDuty ? "on-duty" : "off-duty"
                    }`}
                    onClick={handleDutyToggle}
                >
                    {onDuty ? "ON DUTY" : "OFF DUTY"}
                </button>

                <p className="simulate-text" onClick={handleSimulateRequest}>
                    Click here to simulate a ride request
                </p>

                {showRequestPopup && (
                    <div className="request-popup">
                        <h3>
                            Incoming Ride Request <span>({countdown}s)</span>
                        </h3>
                        <p>User Name: Jane Smith</p>
                        <p>Estimated Earning: ₹ 150</p>
                        <p>Distance: 5 km</p>
                        <button
                            className="accept-btn"
                            onClick={handleAcceptRide}
                        >
                            Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Driver;
