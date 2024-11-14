import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import { Location } from './types';

const API_URL = 'https://temp.staticsave.com/673244e3f3dbf.json';

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [deletedLocations, setDeletedLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations. You can try uploading a JSON file instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const locations = JSON.parse(e.target?.result as string);
        setLocations(locations);
        setError(null);
      } catch (error) {
        setError('Error reading file: Please ensure it is a valid JSON file');
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  const removeLocation = (id: number) => {
    const locationToRemove = locations.find(loc => loc.id === id);
    if (locationToRemove) {
      setLocations(locations.filter(loc => loc.id !== id));
      setDeletedLocations([...deletedLocations, locationToRemove]);
    }
  };

  const restoreLocation = (id: number) => {
    const locationToRestore = deletedLocations.find(loc => loc.id === id);
    if (locationToRestore) {
      setDeletedLocations(deletedLocations.filter(loc => loc.id !== id));
      setLocations([...locations, locationToRestore]);
    }
  };

  return (
    <div className="container">
      <Sidebar
        locations={locations}
        deletedLocations={deletedLocations}
        onRemoveLocation={removeLocation}
        onRestoreLocation={restoreLocation}
        onFileUpload={handleFileUpload}
        error={error}
        isLoading={isLoading}
      />
      <MapView locations={locations} />
    </div>
  );
}