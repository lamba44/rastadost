import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    LoadScript,
    Marker,
    DirectionsRenderer,
} from "@react-google-maps/api";
import "./User.css";

const User = () => {
    const navigate = useNavigate();

    // State definitions
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [travelMode, setTravelMode] = useState("DRIVING");
    const [destinations, setDestinations] = useState([]);
    const [directions, setDirections] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [mapRef, setMapRef] = useState(null);

    // Use environment variable for your backend base URL
    const BASE_URL = import.meta.env.VITE_BACKEND;

    // Geocoding function
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
                        reject(
                            status === "ZERO_RESULTS"
                                ? "Address not found"
                                : `Geocode error: ${status}`
                        );
                    }
                }
            );
        });
    };

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    setLocationError(
                        error.code === error.PERMISSION_DENIED
                            ? "Location access denied. Using default map view."
                            : "Unable to retrieve your location"
                    );
                }
            );
        } else {
            setLocationError("Geolocation not supported");
        }
    }, []);

    // Show route
    const handleShowRoute = async () => {
        if (!pickup || !drop) return;
        try {
            const [pickupLocation, dropLocation] = await Promise.all([
                geocodeAddress(pickup),
                geocodeAddress(drop),
            ]);
            setDestinations([
                { label: "A", address: pickup, location: pickupLocation },
                { label: "B", address: drop, location: dropLocation },
            ]);
            calculateRoute(pickupLocation, dropLocation);
        } catch (error) {
            alert(`Failed to add locations:\n${error}`);
        }
    };

    // Calculate route
    const calculateRoute = (pickupLoc, dropLoc) => {
        if (!pickupLoc || !dropLoc) return;
        new window.google.maps.DirectionsService().route(
            {
                origin: pickupLoc,
                destination: dropLoc,
                travelMode: travelMode,
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    const leg = result.routes[0].legs[0];
                    setRouteInfo({
                        distanceText: leg.distance.text,
                        // leg.distance.value is in meters, convert to km
                        distanceValue: leg.distance.value / 1000,
                        duration: leg.duration.text,
                    });
                    if (mapRef && result.routes[0].bounds) {
                        mapRef.fitBounds(result.routes[0].bounds);
                    }
                } else {
                    console.error("Directions request failed:", status);
                    setDirections(null);
                    setRouteInfo(null);
                }
            }
        );
    };

    // Book Now => create a trip in the backend
    const handleBookNow = async () => {
        if (!pickup || !drop || !routeInfo) {
            alert("Please enter valid locations and show the route first.");
            return;
        }
        try {
            const payload = {
                source: pickup,
                destination: drop,
                distance: routeInfo.distanceValue, // in km
            };

            // Post to your backend using the env var
            const response = await fetch(`${BASE_URL}/api/trips`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const trip = await response.json();
                console.log("Trip created:", trip);
                navigate("/userride");
            } else {
                const errorData = await response.json();
                console.error("Failed to create trip:", errorData.message);
                alert("Failed to create trip. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error connecting to the backend.");
        }
    };

    // Map center
    const mapCenter = userLocation || { lat: 0, lng: 0 };

    return (
        <div className="mainbg">
            <div className="phoneview user-container">
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
                            zoom={userLocation ? 13 : 2}
                            onLoad={(map) => setMapRef(map)}
                        >
                            {destinations.map((dest, idx) => (
                                <Marker
                                    key={idx}
                                    position={dest.location.toJSON()}
                                    label={{ text: dest.label, color: "#fff" }}
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

                <div className="booking-panel">
                    <div className="location-inputs">
                        <div className="input-wrapper">
                            <label htmlFor="pickup">Pickup</label>
                            <input
                                id="pickup"
                                type="text"
                                placeholder="Enter pickup location"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                            />
                        </div>
                        <div className="input-wrapper">
                            <label htmlFor="drop">Drop</label>
                            <input
                                id="drop"
                                type="text"
                                placeholder="Enter drop location"
                                value={drop}
                                onChange={(e) => setDrop(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* New container for inline details */}
                    <div className="details-row">
                        <button
                            className="showroute-btn"
                            onClick={handleShowRoute}
                        >
                            Show Details
                        </button>
                        {routeInfo && (
                            <div className="estimates-row">
                                <div className="estimate-text">
                                    {routeInfo.distanceText}
                                </div>
                                <div className="estimate-text">
                                    {routeInfo.duration}
                                </div>
                                <div className="estimate-text">
                                    ₹ {routeInfo.distanceValue * 15}
                                </div>
                            </div>
                        )}
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
