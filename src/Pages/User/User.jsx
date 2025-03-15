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

  // Form fields for manually entered addresses.
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING");

  // Stores the geocoded destinations (Pickup at index 0 and Dropoff at index 1)
  const [destinations, setDestinations] = useState([]);
  // Stores the computed Directions result
  const [directions, setDirections] = useState(null);
  // Stores route info (distance & duration)
  const [routeInfo, setRouteInfo] = useState(null);
  // User's location for centering the map (but not pinned)
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Google Map reference for controlling the map (e.g., fitting bounds)
  const [mapRef, setMapRef] = useState(null);

  // Utility: simple geocoding function.
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

  // Get user's live location on mount (for centering the map only).
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

  // When the user clicks "Show Route", geocode both addresses and compute the route.
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

  // Compute route using Google Directions Service.
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
            distance: leg.distance.text,
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

  const handleBookNow = () => {
    // You can pass route info or booking details if needed.
    navigate("/userride");
  };

  // Map center: use userLocation if available; otherwise, default to (0,0)
  const mapCenter = userLocation || { lat: 0, lng: 0 };

  return (
    <div className="mainbg">
      <div className="phoneview user-container">
        {/* Map Area: Replaces the placeholder with the live Google Map */}
        <div className="map-area">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
          >
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={userLocation ? 13 : 2}
              onLoad={(map) => setMapRef(map)}
            >
              {/* Render markers for Pickup and Dropoff (if available) */}
              {destinations.map((dest, idx) => (
                <Marker
                  key={idx}
                  position={dest.location.toJSON()}
                  label={{
                    text: dest.label,
                    color: "#fff",
                  }}
                />
              ))}

              {/* Render route if available */}
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
            <div className="map-error-banner">⚠️ {locationError}</div>
          )}
        </div>

        {/* Booking Panel: Contains inputs, route info, and booking button */}
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

          {/* Button to trigger route calculation */}
          <button className="showroute-btn" onClick={handleShowRoute}>
            Show Route
          </button>

          {/* Display route info if available */}
          {routeInfo && (
            <div className="estimates-row">
              <p className="estimate-text">Distance: {routeInfo.distance}</p>
              <p className="estimate-text">
                Estimated Duration: {routeInfo.duration}
              </p>
            </div>
          )}

          <button className="book-btn" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;
