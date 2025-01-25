import Head from 'next/head';
import React, { useState } from 'react';
import ReactMapGL, { NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 45.4211,
    longitude: -75.6903,
    zoom: 10
  });

  return (
    <div>
      {/* <ReactMapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onViewportChange={(nextViewport: React.SetStateAction<{ width: string; height: string; latitude: number; longitude: number; zoom: number; }>) => setViewport(nextViewport)}
      >
        <NavigationControl style={{ position: 'absolute', top: 10, left: 10 }} />
      </ReactMapGL> */}
    </div>
  );
}