import React, { useState } from 'react';
import ReactMapGL, { NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  const [viewPort, setViewPort] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 45.4211,
    longitude: -75.6903,
    zoom: 10
  });

  return (
    <div>
      <ReactMapGL
        {...viewPort}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onMove={evt => setViewPort({
          ...viewPort,
          ...evt.viewState
        })}
      >
        <NavigationControl position="top-left" />
      </ReactMapGL>
    </div>
  );
}