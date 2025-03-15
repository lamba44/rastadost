// src/components/DriverRide.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    LoadScript,
    Marker,
    DirectionsRenderer,
} from "@react-google-maps/api";
import "./DriverRide.css";
import pfp from "./../../assets/pfp.png"; // Optional: if you wish to show a placeholder image

const DriverRide = () => {
    // Map States
    const [mapRef, setMapRef] = useState(null);
    const [directions, setDirections] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [locationError, setLocationError] = useState(null);

    // Trip and User states
    const [trip, setTrip] = useState(null);
    const [userData, setUserData] = useState(null);

    // Local state for end ride status ("idle", "waiting", "ended")
    const [endRideStatus, setEndRideStatus] = useState("idle");

    // Navigation hook from react-router-dom
    const navigate = useNavigate();

    // Use environment variable for your backend base URL
    const BASE_URL = import.meta.env.VITE_BACKEND;

    // Handler for triggering emergency support (styled like the safety button)
    const handleSupport = () => {
        alert("Emergency support triggered! (Demo)");
    };

    const handleEndRide = async () => {
        if (!trip?._id) return;
        setEndRideStatus("waiting");
        try {
            const response = await fetch(
                `${BASE_URL}/api/trips/${trip._id}/end-driver`,
                { method: "PUT" }
            );
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setEndRideStatus("ended");
                setTimeout(() => {
                    navigate("/driver");
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

    // 1) Fetch active trip
    useEffect(() => {
        const fetchActiveTrip = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/trips/active`);
                if (!response.ok)
                    throw new Error("Failed to fetch active trip");
                const data = await response.json();
                setTrip(data);
            } catch (error) {
                console.error("Error fetching trip:", error);
            }
        };
        fetchActiveTrip();
    }, [BASE_URL]);

    // 2) Fetch passenger data when trip is available
    useEffect(() => {
        if (!trip || !trip.userId) return;
        const fetchUser = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/api/details/user/${trip.userId}`
                );
                if (response.ok) {
                    const user = await response.json();
                    setUserData(user);
                } else {
                    console.error("Failed to fetch user data");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, [trip, BASE_URL]);

    // 3) Geocoding and mapping functions
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

    // 4) Initialize map and route when trip is available
    useEffect(() => {
        if (!trip || !window.google) return;
        const initializeRoute = async () => {
            try {
                const origin = await geocodeAddress(trip.source);
                const destination = await geocodeAddress(trip.destination);
                setMarkers([
                    { label: "Pickup", position: origin },
                    { label: "Drop", position: destination },
                ]);
                calculateRoute(origin, destination);
            } catch (error) {
                console.error("Failed to load route:", error);
                setLocationError("Failed to load route.");
            }
        };
        initializeRoute();
    }, [trip, mapRef]);

    // Center the map on the first marker or fallback
    const mapCenter =
        markers.length > 0
            ? markers[0].position
            : { lat: 19.076, lng: 72.8777 };

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
                            {markers.map((marker, i) => (
                                <Marker
                                    key={i}
                                    position={
                                        marker.position.toJSON
                                            ? marker.position.toJSON()
                                            : marker.position
                                    }
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

                {/* Bottom Panel */}
                <div className="driver-panel">
                    {userData ? (
                        <div className="driver-info">
                            <div className="pfpimg">
                                <img src={pfp} alt="Passenger Profile" />
                            </div>
                            <p>
                                {userData.name} <br />{" "}
                                {userData.rating || "4.8"} ⭐
                            </p>
                        </div>
                    ) : (
                        <div className="loading">
                            Loading passenger details...
                        </div>
                    )}

                    {trip ? (
                        <div className="trip-info">
                            <p>{trip.source}</p>
                            <p className="totext">TO</p>
                            <p>{trip.destination}</p>
                        </div>
                    ) : (
                        <div className="loading">Loading trip details...</div>
                    )}

                    {/* Action Buttons */}
                    <div className="ride-actions">
                        <button className="safety-btn" onClick={handleSupport}>
                            Emergency Support
                        </button>
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

export default DriverRide;
