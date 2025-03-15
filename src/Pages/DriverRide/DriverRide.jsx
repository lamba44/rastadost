import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./DriverRide.css";

const DriverRide = () => {
  // Map States
  const [mapRef, setMapRef] = useState(null);
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [locationError, setLocationError] = useState(null);

  // Trip and User states
  const [trip, setTrip] = useState(null);
  const [userData, setUserData] = useState(null);

  // Handlers
  const handleSupport = () => {
    alert("Support has been triggered for this ride!");
  };

  const handleEndRide = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/${trip._id}/end-driver`,
        { method: "PUT" }
      );
      if (response.ok) {
        alert("Ride ended successfully. Waiting for user confirmation.");
      } else {
        alert("Failed to end ride");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
    }
  };

  // Fetch active trip
  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips/active");
        if (!response.ok) throw new Error("Failed to fetch active trip");
        const data = await response.json();
        setTrip(data);
      } catch (error) {
        console.error("Error fetching trip:", error);
      }
    };
    fetchActiveTrip();
  }, []);

  // Fetch user data when trip is available
  useEffect(() => {
    if (!trip || !trip.userId) return;

    const fetchUser = async () => {
      try {
        // In DriverRide.js component
        const response = await fetch(
          `http://localhost:5000/api/details/user/${trip.userId}`
        );
        const user = await response.json();
        setUserData(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [trip]);

  // Geocoding and mapping functions
  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      new window.google.maps.Geocoder().geocode(
        { address },
        (results, status) => {
          if (status === "OK") return resolve(results[0].geometry.location);
          reject(status);
        }
      );
    });
  };

  const calculateRoute = async (origin, destination) => {
    new window.google.maps.DirectionsService().route(
      {
        origin,
        destination,
        travelMode: "DRIVING",
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          mapRef.fitBounds(result.routes[0].bounds);
        }
      }
    );
  };

  // Initialize map and route
  useEffect(() => {
    if (!trip || !window.google) return;

    const initializeRoute = async () => {
      try {
        const origin = await geocodeAddress(trip.source);
        const destination = await geocodeAddress(trip.destination);

        setMarkers([
          { position: origin, label: "Pickup" },
          { position: destination, label: "Drop" },
        ]);

        calculateRoute(origin, destination);
      } catch (error) {
        setLocationError("Failed to load route");
      }
    };
    initializeRoute();
  }, [trip, mapRef]);

  return (
    <div className="mainbg">
      <div className="phoneview driverride-container">
        {/* Map Area */}
        <div className="map-area">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
          >
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={markers[0]?.position || { lat: 0, lng: 0 }}
              zoom={13}
              onLoad={(map) => setMapRef(map)}
            >
              {markers.map((marker, i) => (
                <Marker
                  key={i}
                  position={marker.position}
                  label={{ text: marker.label, color: "#fff" }}
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
            <div className="map-error-banner">⚠️ {locationError}</div>
          )}
        </div>

        {/* Ride Panel */}
        <div className="ride-panel">
          <h2 className="ride-title">Ride Details</h2>

          {userData && (
            <div className="user-info">
              <p className="info-text">
                <strong>Passenger:</strong> {userData.name}
              </p>
              <p className="info-text">
                <strong>Contact:</strong> {userData.phone}
              </p>
              <p className="info-text">
                <strong>Rating:</strong> {userData.rating || "4.8"} ★
              </p>
            </div>
          )}

          {trip && (
            <div className="trip-info">
              <p>
                <strong>From:</strong> {trip.source}
              </p>
              <p>
                <strong>To:</strong> {trip.destination}
              </p>
              <p>
                <strong>Distance:</strong> {trip.distance} km
              </p>
              <p>
                <strong>Earnings:</strong> ₹{(trip.distance * 15).toFixed(2)}
              </p>
            </div>
          )}

          <div className="ride-actions">
            <button className="support-btn" onClick={handleSupport}>
              Emergency Support
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
