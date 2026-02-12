import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapLocationPicker.css';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to update map center when location changes
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  
  return null;
}

const MapLocationPicker = ({ city, country, onLocationChange }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  // Geocode the location when city or country changes
  const geocodeLocation = async () => {
    if (!city || !country) {
      setError('Please enter both city and country');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Nominatim OpenStreetMap geocoding API (free, no API key required)
      const searchQuery = `${city}, ${country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
        setPosition(location);
        setShowMap(true);
        
        if (onLocationChange) {
          onLocationChange(location);
        }
      } else {
        setError('Location not found. Please check city and country names.');
        setShowMap(false);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to find location. Please try again.');
      setShowMap(false);
    } finally {
      setLoading(false);
    }
  };

  // Auto-geocode when city and country are both provided
  useEffect(() => {
    if (city && country) {
      const debounceTimer = setTimeout(() => {
        geocodeLocation();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setShowMap(false);
      setPosition(null);
    }
  }, [city, country]);

  const toggleMap = () => {
    if (!showMap) {
      geocodeLocation();
    } else {
      setShowMap(false);
    }
  };

  return (
    <div className="map-location-picker">
      <div className="map-controls">
        <button
          type="button"
          onClick={toggleMap}
          disabled={!city || !country || loading}
          className="map-toggle-button"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Finding location...
            </>
          ) : showMap ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
              </svg>
              Hide Map
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Show on Map
            </>
          )}
        </button>

        {position && (
          <span className="location-coordinates">
            📍 {city}, {country}
          </span>
        )}
      </div>

      {error && (
        <div className="map-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {showMap && position && (
        <div className="map-container-wrapper">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={12}
            style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>{city}</strong>
                  <br />
                  {country}
                  <br />
                  <small>
                    Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
                  </small>
                </div>
              </Popup>
            </Marker>
            <MapUpdater center={[position.lat, position.lng]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default MapLocationPicker;
