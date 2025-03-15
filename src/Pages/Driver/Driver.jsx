import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import handshakeAnimation from "../../assets/handshake.json";

import "./Driver.css";

const Driver = () => {
  const navigate = useNavigate();

  // Duty state
  const [onDuty, setOnDuty] = useState(false);

  // For ride request popup
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [popupInterval, setPopupInterval] = useState(null);

  // ** New: handshake animation popup state
  const [showHandshakeAnimation, setShowHandshakeAnimation] = useState(false);

  // Trip data
  const [currentTrip, setCurrentTrip] = useState(null);

  // Stats (placeholders)
  const [totalTripsThisMonth] = useState(25);
  const [totalEarningsThisMonth] = useState(5200);
  const [overallTotalTrips] = useState(120);
  const [totalPoints] = useState(200);

  // Driver Info (placeholders)
  const [driverName] = useState("John Doe");
  const [vehicleNumber] = useState("ABC1234");
  const [licenseNumber] = useState("XYZ-4567");

  // Toggle Duty
  const handleDutyToggle = () => {
    setOnDuty((prev) => !prev);
  };

  // Simulate a request (useful for testing locally)
  const handleSimulateRequest = () => {
    const fakeTrip = {
      _id: "fake123",
      userId: "645b267a123abc", // example ID
      userName: "Jane Smith",
      source: "Location A",
      destination: "Location B",
      distance: 5,
      estimatedEarning: 150,
    };

    setCurrentTrip(fakeTrip);
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

  // Poll for new trips only if onDuty
  useEffect(() => {
    if (!onDuty) return;

    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        const trips = await response.json();
        const pendingTrips = trips.filter(
          (trip) => !trip.endingUser && !trip.endingDriver
        );

        if (pendingTrips.length > 0 && !showRequestPopup) {
          const latestTrip = pendingTrips[pendingTrips.length - 1];

          // (Optional) fetch user info here:
          // const userRes = await fetch(
          //   `http://localhost:5000/api/details/user/${latestTrip.userId}`
          // );
          // const userData = await userRes.json();

          // const mergedTrip = {
          //   ...latestTrip,
          //   userName: userData.name,
          // };
          // setCurrentTrip(mergedTrip);

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

  // Accept ride
  const handleAcceptRide = () => {
    // Clear any existing countdown
    if (popupInterval) clearInterval(popupInterval);

    // Show handshake animation
    setShowHandshakeAnimation(true);

    // Hide the request popup
    setShowRequestPopup(false);

    // After 5 seconds, navigate to the DriverRide screen
    setTimeout(() => {
      setShowHandshakeAnimation(false);
      navigate("/driverride");
    }, 5000);
  };

  // Example fare function
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

        <p className="simulate-text" onClick={handleSimulateRequest}>
          Click here to simulate a ride request
        </p>

        {/* Request popup */}
        {showRequestPopup && currentTrip && (
          <div className="request-popup">
            <h3>
              Incoming Ride Request <span>({countdown}s)</span>
            </h3>
            <p>User Name: {currentTrip.userName}</p>
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
