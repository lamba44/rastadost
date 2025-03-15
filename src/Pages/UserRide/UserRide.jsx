// src/components/UserRide.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    LoadScript,
    Marker,
    DirectionsRenderer,
} from "@react-google-maps/api";
import "./UserRide.css";
import pfp from "./../../assets/pfp.png";

const UserRide = () => {
    const [activeTrip, setActiveTrip] = useState(null);
    const [tripError, setTripError] = useState(null);

    // For map and route
    const [mapRef, setMapRef] = useState(null);
    const [directions, setDirections] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [locationError, setLocationError] = useState(null);

    // Local state for end ride status ("idle", "waiting", "ended")
    const [endRideStatus, setEndRideStatus] = useState("idle");

    // Navigation hook from react-router-dom
    const navigate = useNavigate();

    // Use environment variable for your backend base URL
    const BASE_URL = import.meta.env.VITE_BACKEND;

    // 1) Poll for the active trip
    useEffect(() => {
        const fetchActiveTrip = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/trips/active`);
                if (response.ok) {
                    const trip = await response.json();
                    setActiveTrip(trip);
                    setTripError(null);
                    console.log("Active trip fetched:", trip);
                } else {
                    const errorData = await response.json();
                    console.error("Active Trip Error:", errorData.message);
                    setTripError(errorData.message);
                    setActiveTrip(null);
                }
            } catch (error) {
                console.error("Error fetching active trip:", error);
                setTripError("Error fetching active trip.");
                setActiveTrip(null);
            }
        };

        fetchActiveTrip();
        const intervalId = setInterval(fetchActiveTrip, 5000);
        return () => clearInterval(intervalId);
    }, [BASE_URL]);

    // 2) Utility: geocode an address
    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            if (!window.google) {
                reject("Google Maps API not loaded");
                return;
            }
            new window.google.maps.Geocoder().geocode(
                { address },
                (results, status) => {
                    if (status === "OK" && results[0]) {
                        resolve(results[0].geometry.location);
                    } else {
                        reject(`Geocode error: ${status}`);
                    }
                }
            );
        });
    };

    // 3) Calculate route
    const calculateRoute = (origin, destination) => {
        if (!origin || !destination) return;
        new window.google.maps.DirectionsService().route(
            {
                origin,
                destination,
                travelMode: "DRIVING",
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    if (mapRef && result.routes[0].bounds) {
                        mapRef.fitBounds(result.routes[0].bounds);
                    }
                } else {
                    console.error("Directions request failed:", status);
                    setDirections(null);
                }
            }
        );
    };

    // 4) When activeTrip changes, load the map route
    useEffect(() => {
        if (!activeTrip) return;

        const loadTripRoute = async () => {
            try {
                const origin = await geocodeAddress(activeTrip.source);
                const destination = await geocodeAddress(
                    activeTrip.destination
                );
                setMarkers([
                    { label: activeTrip.source, position: origin },
                    { label: activeTrip.destination, position: destination },
                ]);
                calculateRoute(origin, destination);
            } catch (error) {
                console.error("Error loading trip route:", error);
                setLocationError("Unable to load trip route.");
            }
        };

        if (window.google) {
            loadTripRoute();
        }
    }, [activeTrip, mapRef]);

    // 5) Center on the first marker or fallback
    const mapCenter =
        markers.length > 0
            ? markers[0].position
            : { lat: 19.076, lng: 72.8777 };

    // 6) End Ride handler for user
    const handleEndRide = async () => {
        if (!activeTrip?._id) return;
        setEndRideStatus("waiting");
        try {
            const response = await fetch(
                `${BASE_URL}/api/trips/${activeTrip._id}/end-user`,
                { method: "PUT" }
            );
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setEndRideStatus("ended");
                // Redirect after a short delay
                setTimeout(() => {
                    navigate("/user");
                }, 2000);
            } else {
                alert(`Error: ${data.message}`);
                setEndRideStatus("idle");
            }
        } catch (error) {
            console.error("Error ending ride:", error);
            alert("Error ending ride.");
            setEndRideStatus("idle");
        }
    };

    return (
        <div className="mainbg">
            <div className="phoneview userride-container">
                {/* Map Area */}
                <div className="map-area">
                    <LoadScript
                        googleMapsApiKey={
                            import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                        }
                        libraries={["places"]}
                    >
                        <GoogleMap
                            mapContainerStyle={{
                                width: "100%",
                                height: "100%",
                            }}
                            center={mapCenter}
                            zoom={10}
                            onLoad={(map) => setMapRef(map)}
                        >
                            {markers.map((marker, idx) => (
                                <Marker
                                    key={idx}
                                    position={marker.position.toJSON()}
                                    label={{
                                        text: marker.label,
                                        color: "#fff",
                                    }}
                                />
                            ))}
                            {directions && (
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: true,
                                        polylineOptions: {
                                            strokeColor: "#248a6c",
                                            strokeWeight: 6,
                                        },
                                    }}
                                />
                            )}
                        </GoogleMap>
                    </LoadScript>
                    {locationError && (
                        <div className="map-error-banner">
                            ⚠️ {locationError}
                        </div>
                    )}
                </div>

                {/* Bottom panel */}
                <div className="driver-panel">
                    {activeTrip ? (
                        <div className="driver-info">
                            <div className="pfpimg">
                                <img src={pfp} alt="Profile Picture" />
                            </div>
                            <p>
                                John Doe <br />
                                4.7 ⭐
                            </p>
                        </div>
                    ) : (
                        <div className="loading">
                            {tripError
                                ? `Error: ${tripError}`
                                : "Locating your ride..."}
                        </div>
                    )}

                    {activeTrip ? (
                        <div className="trip-info">
                            <p>{activeTrip.source}</p>
                            <p className="totext">TO</p>
                            <p>{activeTrip.destination}</p>
                        </div>
                    ) : (
                        <div className="loading">
                            No active trip at the moment.
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="ride-actions">
                        <button
                            className="safety-btn"
                            onClick={() =>
                                alert("Safety assistance triggered! (Demo)")
                            }
                        >
                            Safety
                        </button>
                        {activeTrip && activeTrip.distance ? (
                            <div className="distleft">
                                {activeTrip.distance} km
                            </div>
                        ) : (
                            <div className="distleft">Loading...</div>
                        )}
                        <button
                            className="endride-btn"
                            onClick={handleEndRide}
                            disabled={
                                endRideStatus === "waiting" ||
                                endRideStatus === "ended"
                            }
                            style={{
                                backgroundColor:
                                    endRideStatus === "waiting" ||
                                    endRideStatus === "ended"
                                        ? "gray"
                                        : "",
                            }}
                        >
                            {endRideStatus === "waiting"
                                ? "Waiting..."
                                : endRideStatus === "ended"
                                ? "Ride Ended"
                                : "End Ride"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRide;
