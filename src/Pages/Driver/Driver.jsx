// src/components/Driver.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import handshakeAnimation from "../../assets/handshake.json"; // Or any path to an animation

import "./Driver.css";

const Driver = () => {
  const navigate = useNavigate();

  // Use a real driver _id from your DB if you have one.
  // If your schema is relaxed, any string might pass, but ideally an actual ID.
  const simulatedDriverId = "64123456789abc1234567890";

  const [onDuty, setOnDuty] = useState(false);

  // Request popup
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [popupInterval, setPopupInterval] = useState(null);

  // Handshake animation
  const [showHandshakeAnimation, setShowHandshakeAnimation] = useState(false);

  // Current trip
  const [currentTrip, setCurrentTrip] = useState(null);

  // Stats (placeholders)
  const [totalTripsThisMonth] = useState(25);
  const [totalEarningsThisMonth] = useState(5200);
  const [overallTotalTrips] = useState(120);
  const [totalPoints] = useState(200);

  // Driver Info (placeholders for your UI)
  const [driverName] = useState("John Doe");
  const [vehicleNumber] = useState("ABC1234");
  const [licenseNumber] = useState("XYZ-4567");

  // Toggle On Duty
  const handleDutyToggle = () => {
    setOnDuty((prev) => !prev);
  };

  // Poll for new, unassigned trips
  useEffect(() => {
    if (!onDuty) return;

    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        const trips = await response.json();

        // Filter out trips that already have driverId or are ended
        const pendingTrips = trips.filter(
          (t) => !t.driverId && !t.endingUser && !t.endingDriver
        );

        // If we find an unassigned trip & we aren't already showing a popup
        if (pendingTrips.length > 0 && !showRequestPopup) {
          const latestTrip = pendingTrips[pendingTrips.length - 1];
          setCurrentTrip(latestTrip);
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
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    const intervalId = setInterval(fetchTrips, 5000);
    return () => clearInterval(intervalId);
  }, [onDuty, showRequestPopup]);

  // Accept ride => assign driver => show handshake => navigate
  const handleAcceptRide = async () => {
    if (popupInterval) clearInterval(popupInterval);

    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/${currentTrip._id}/assign-driver`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverId: simulatedDriverId }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign driver");

      // Show the handshake animation
      setShowHandshakeAnimation(true);
      setTimeout(() => {
        // If you have a dedicated route for "driverride", do so:
        navigate("/driverride", { state: { driverId: simulatedDriverId } });
      }, 5000);
    } catch (error) {
      console.error("Error:", error);
      // You can show an error message in the UI
    }
  };

  // Example fare
  const calculateFare = (distance) => distance * 15;

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
          className={`duty-toggle-btn ${onDuty ? "on-duty" : "off-duty"}`}
          onClick={handleDutyToggle}
        >
          {onDuty ? "ON DUTY" : "OFF DUTY"}
        </button>

        {/* Ride request popup */}
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
            <button className="accept-btn" onClick={handleAcceptRide}>
              Accept
            </button>
          </div>
        )}

        {/* Handshake animation popup */}
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
