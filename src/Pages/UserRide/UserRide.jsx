// src/components/UserRide.jsx
import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./UserRide.css";

const UserRide = () => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripError, setTripError] = useState(null);

  // For map and route
  const [mapRef, setMapRef] = useState(null);
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [locationError, setLocationError] = useState(null);

  // 1) Poll for the active trip
  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips/active");
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
  }, []);

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
        const destination = await geocodeAddress(activeTrip.destination);
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
    markers.length > 0 ? markers[0].position : { lat: 19.076, lng: 72.8777 };

  return (
    <div className="mainbg">
      <div className="phoneview userride-container">
        {/* Map Area */}
        <div className="map-area">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
          >
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={10}
              onLoad={(map) => setMapRef(map)}
            >
              {markers.map((marker, idx) => (
                <Marker
                  key={idx}
                  position={marker.position.toJSON()}
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

        {/* Bottom panel */}
        <div className="driver-panel">
          <h2 className="ride-title">Your Ride</h2>

          {/* Display "John Doe" if there's an active trip. Otherwise, show "Locating your ride..." */}
          {activeTrip ? (
            <div className="driver-info">
              <p>
                <strong>Driver:</strong> John Doe
              </p>
              {/* You can hardcode more details here if you want */}
            </div>
          ) : (
            <div className="loading">
              {tripError ? `Error: ${tripError}` : "Locating your ride..."}
            </div>
          )}

          {/* Action buttons */}
          <div className="ride-actions">
            <button
              className="safety-btn"
              onClick={() => alert("Safety assistance triggered! (Demo)")}
            >
              Safety
            </button>
            <button
              className="endride-btn"
              onClick={() =>
                alert(
                  "User ended the ride. Waiting for driver to also end. (Demo)"
                )
              }
            >
              End Ride
            </button>
          </div>

          {/* Display the active trip data */}
          {activeTrip ? (
            <div className="trip-info">
              <h3>Trip Data:</h3>
              <p>
                <strong>Source:</strong> {activeTrip.source}
              </p>
              <p>
                <strong>Destination:</strong> {activeTrip.destination}
              </p>
              <p>
                <strong>Distance:</strong> {activeTrip.distance} km
              </p>
            </div>
          ) : (
            <div className="loading">No active trip at the moment.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRide;
