import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./UserRide.css";

const UserRide = () => {
  // Dummy driver details
  const driverName = "Rahul Sharma";
  const carNumber = "KA05AB9999";
  const phoneNumber = "9876543210";
  const rating = 4.7;

  // Map & route state
  const [mapRef, setMapRef] = useState(null);
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [locationError, setLocationError] = useState(null);

  // State to hold the first trip from the reversed data
  const [firstTrip, setFirstTrip] = useState(null);

  // Utility function to geocode an address
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

  // Calculate the route between two locations.
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

  // Fetch all trips and then reverse the array to select the first one from the reversed data.
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        if (response.ok) {
          const trips = await response.json();
          console.log("Fetched trips:", trips); // Debug: Check what is returned.
          if (trips.length > 0) {
            // Reverse the fetched data and select the first trip from the reversed list.
            const reversedTrips = trips.reverse();
            setFirstTrip(reversedTrips[0]);
          } else {
            console.error("No trips found");
          }
        } else {
          console.error("Failed to fetch trip data");
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  // Once the firstTrip is fetched, set up the map using its source and destination.
  useEffect(() => {
    if (!firstTrip) return;
    const loadTripRoute = async () => {
      try {
        const origin = await geocodeAddress(firstTrip.source);
        const destination = await geocodeAddress(firstTrip.destination);
        setMarkers([
          { label: firstTrip.source, position: origin },
          { label: firstTrip.destination, position: destination },
        ]);
        calculateRoute(origin, destination);
      } catch (error) {
        console.error("Error loading trip route:", error);
        setLocationError("Unable to load trip route.");
      }
    };

    // Ensure the Google Maps API is loaded before trying to geocode.
    if (window.google) {
      loadTripRoute();
    }
  }, [firstTrip, mapRef]);

  // Set center to the origin marker if available, otherwise a default coordinate.
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

        {/* Bottom panel with driver details */}
        <div className="driver-panel">
          <h2 className="ride-title">Your Ride</h2>
          <div className="driver-info">
            <p className="info-text">Driver: {driverName}</p>
            <p className="info-text">Car Number: {carNumber}</p>
            <p className="info-text">Phone: {phoneNumber}</p>
            <p className="info-text">Rating: {rating} ★</p>
          </div>

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
                  "User ended the ride. Waiting for driver to also end the ride. (Demo)"
                )
              }
            >
              End Ride
            </button>
          </div>

          {/* Display the first trip data from MongoDB */}
          {firstTrip && (
            <div className="trip-info">
              <h3>Trip Data:</h3>
              <p>
                <strong>Source:</strong> {firstTrip.source}
              </p>
              <p>
                <strong>Destination:</strong> {firstTrip.destination}
              </p>
              <p>
                <strong>Distance:</strong> {firstTrip.distance} km
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRide;
