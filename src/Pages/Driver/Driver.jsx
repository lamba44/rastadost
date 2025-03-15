// src/components/Driver.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import handshakeAnimation from "../../assets/handshake.json"; // or wherever your animation is
import "./Driver.css";

const Driver = () => {
    const navigate = useNavigate();

    // Duty-related state
    const [onDuty, setOnDuty] = useState(false);

    // Request popup states
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [popupInterval, setPopupInterval] = useState(null);

    // Handshake animation
    const [showHandshakeAnimation, setShowHandshakeAnimation] = useState(false);

    // Active trip
    const [currentTrip, setCurrentTrip] = useState(null);

    // Driver data fetched from backend
    const [driverData, setDriverData] = useState(null);

    // Reference your backend from the environment variable
    const BASE_URL = import.meta.env.VITE_BACKEND;

    // Toggle duty
    const handleDutyToggle = () => {
        setOnDuty((prev) => !prev);
    };

    // Navigate to Points page when button is clicked
    const handleViewPoints = () => {
        navigate("/points");
    };

    // Fetch driver details from backend (fetch first available driver)
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/details/driver`);
                if (response.ok) {
                    const data = await response.json();
                    setDriverData(data);
                } else {
                    console.error("Failed to fetch driver details");
                }
            } catch (error) {
                console.error("Error fetching driver details:", error);
            }
        };

        fetchDriverData();
    }, [BASE_URL]);

    // Poll for new unassigned trips every 5s if onDuty
    useEffect(() => {
        if (!onDuty) return;

        const fetchTrips = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/trips`);
                const trips = await response.json();

                // Filter out assigned or ended trips
                const pendingTrips = trips.filter(
                    (t) => !t.driverId && !t.endingUser && !t.endingDriver
                );

                if (pendingTrips.length > 0 && !showRequestPopup) {
                    // Show the latest pending trip
                    const latestTrip = pendingTrips[pendingTrips.length - 1];
                    setCurrentTrip(latestTrip);
                    setShowRequestPopup(true);
                    setCountdown(10);

                    // Start a 10s countdown
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
                }
            } catch (error) {
                console.error("Error fetching trips:", error);
            }
        };

        const intervalId = setInterval(fetchTrips, 5000);
        return () => clearInterval(intervalId);
    }, [onDuty, showRequestPopup, BASE_URL]);

    // Accept ride => Assign driver => Show handshake => Navigate
    const handleAcceptRide = async () => {
        if (popupInterval) clearInterval(popupInterval);

        try {
            const response = await fetch(
                `${BASE_URL}/api/trips/${currentTrip._id}/assign-driver`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        driverId: driverData ? driverData._id : null,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to assign driver");
            }

            setShowHandshakeAnimation(true);

            // After 5s, navigate away
            setTimeout(() => {
                navigate("/driverride");
            }, 5000);
        } catch (error) {
            console.error("Error:", error);
            // Optionally, display an error message here.
        }
    };

    // Example fare calculation
    const calculateFare = (distance) => distance * 15;

    // Compute earnings as returned by the backend
    const totalEarnings = driverData ? driverData.earnings : 0;

    return (
        <div className="mainbg">
            <div className="phoneview driver-container">
                <h2 className="driver-page-title">Driver Dashboard</h2>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="stat-title">Trips (This Month)</p>
                        <p className="stat-value">
                            {driverData ? driverData.totalTrips : "Loading..."}
                        </p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-title">Earnings (This Month)</p>
                        <p className="stat-value">₹48000</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-title">Overall Trips</p>
                        <p className="stat-value">
                            {driverData ? driverData.totalTrips : "Loading..."}
                        </p>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={handleViewPoints}
                    >
                        <p className="stat-title">Total Points</p>
                        <p className="stat-value">
                            {driverData ? driverData.points : "Loading..."}
                        </p>
                    </div>
                </div>

                {/* Driver Info */}
                <div className="hotspots">
                    <p>Hotspots with potential earnings:</p>
                    <ul>
                        <li>District A: +₹5000</li>
                        <li>District B: +₹4000</li>
                        <li>District C: +₹2500</li>
                    </ul>
                </div>
                <div className="driver-info">
                    <p>
                        Driver: <br />{" "}
                        {driverData ? driverData.name : "Loading..."}
                    </p>
                    <p>
                        Vehicle: <br />{" "}
                        {driverData
                            ? driverData.vehicleNumber || "DL9IAR3425"
                            : "Loading..."}
                    </p>
                    <p>
                        License: <br />{" "}
                        {driverData
                            ? driverData.licenseNumber || "24J4KJ2H3"
                            : "Loading..."}
                    </p>
                </div>

                <button
                    className={`duty-toggle-btn ${
                        onDuty ? "on-duty" : "off-duty"
                    }`}
                    onClick={handleDutyToggle}
                >
                    {onDuty ? "ON DUTY" : "OFF DUTY"}
                </button>

                {/* Request Popup */}
                {showRequestPopup && currentTrip && (
                    <div className="request-popup">
                        <h3>
                            Incoming Ride Request <span>({countdown}s)</span>
                        </h3>
                        <p>Trip ID: {currentTrip._id}</p>
                        <p>Source: {currentTrip.source}</p>
                        <p>Destination: {currentTrip.destination}</p>
                        <p>Distance: {currentTrip.distance} km</p>
                        <p>
                            Estimated Fare: ₹{" "}
                            {currentTrip.distance
                                ? calculateFare(currentTrip.distance)
                                : "N/A"}
                        </p>
                        <button
                            className="accept-btn"
                            onClick={handleAcceptRide}
                        >
                            Accept
                        </button>
                    </div>
                )}

                {/* Handshake Animation Popup */}
                {showHandshakeAnimation && (
                    <div className="handshake-popup">
                        <div className="handshake-content">
                            <Lottie
                                animationData={handshakeAnimation}
                                loop
                                autoplay
                                style={{ width: 200, height: 200 }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Driver;
