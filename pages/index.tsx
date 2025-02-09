import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import ResponsiveDrawer from "../components/ResponsiveDrawer";

import 'mapbox-gl/dist/mapbox-gl.css';

interface MovingObject {
  id: number;
  name: string;
  coordinates: number[];
}

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [currentCoords, setCurrentCoords] = React.useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  const toggleDrawer =
  (newOpen: boolean | ((prevState: boolean) => boolean), longitude?: number, latitude?: number) =>
  () => {
    if (longitude !== undefined && latitude !== undefined) {
      setCurrentCoords({ longitude, latitude }); // Update the coordinates state
    }
    setOpen(newOpen); // Open or close the drawer
  };

  const handleSave = async (data: { latitude: number; longitude: number; safetyRating: number; reviewText: string }) => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/send-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log(response.body);
      if (response.ok) {
        console.log("Pin saved successfully");
      } else {
        console.error("Failed to save pin");
      }
    } catch (error) {
      console.error("Error saving pin:", error);
    }
  };

  useEffect(() => {
    // Dynamically add the Google Font
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Monoton&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Clean up on unmount
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox access token is missing!");
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/malakod/cm6dhj0bt00cy01qm14jc1hi1",
        center: [-73.5765, 45.5048],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        maxZoom: 20,
        antialias: true,
      });

      // Add zoom controls
      map.addControl(new mapboxgl.NavigationControl(), "top-left");

      // Add fog styling
      map.on("style.load", () => {
        map.setFog({}); // Add fog for 3D effect

        const labelLayerId = "road-label"; // Known label layer ID in most Mapbox styles
        const layers = map.getStyle()?.layers;

        if (!layers || !layers.some((layer) => layer.id === labelLayerId)) {
          console.warn("Label layer ID not found. Using a fallback.");
        }

        map.addLayer(
          {
            id: "add-3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId // Add below the label layer or fallback
        );
      });

      type ApiResponse = Array<{
        _id: string;
        latitude: number;
        longitude: number;
        safetyRating: number;
        reviewText: string;
      }>;


      // Function to format API response
      const formatApiResponse = (
        apiResponse: ApiResponse
      ): GeoJSON.FeatureCollection<GeoJSON.Point> => {
        return {
          type: "FeatureCollection",
          features: apiResponse.map((item): GeoJSON.Feature<GeoJSON.Point, { safetyRating: number; reviewText: string }> => ({
            type: "Feature",
            properties: {
              safetyRating: item.safetyRating,
              reviewText: item.reviewText
            },
            geometry: {
              type: "Point",
              coordinates: [item.longitude, item.latitude],
            },
          })),
        };
      };

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Example...'
      );

      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:8001/api/pins`);
          const apiResponse = await response.json();
          console.log(apiResponse);

          const geojsonData = formatApiResponse(apiResponse);
          console.log(geojsonData);

          // Load GeoJSON data on map
          geojsonData.features.forEach((feature) => {
            const { coordinates } = feature.geometry;

            // Add a marker to the map
            const marker = new mapboxgl.Marker()
              .setLngLat(coordinates as [number, number])
              .addTo(map);

            // Add hover effect for marker
            marker.getElement().addEventListener('mouseenter', () => {
              map.getCanvas().style.cursor = 'pointer';
              const { safetyRating, reviewText } = feature.properties as { safetyRating: number; reviewText: string };

              popup
                .setLngLat(coordinates as [number, number])
                .setHTML(`
                  <div style="text-align: center;">
      <h3>${safetyRating}</h3>
      <p>${reviewText}</p>
    </div>
  `)
                .addTo(map);
            });

            marker.getElement().addEventListener('mouseleave', () => {
              map.getCanvas().style.cursor = '';
              popup.remove();
            });

            map.on('dblclick', (e) => {
              const { lng, lat } = e.lngLat;

              new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);

              toggleDrawer(true, lng, lat)();
              // if form submitted, then create a new entry in db
              

              console.log(`New marker added at [${lng}, ${lat}]`);
            });
          });

        } catch (error) {
          console.error(error);
        }
      };

      fetchData();

      // Cleanup on unmount
      return () => map.remove();
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleFormSubmit = (data: { lng: number; lat: number; title: string; description: string }) => {
    console.log('Form submitted:', data);
    // Handle form submission logic here (e.g., save to database)
  };

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
      }}
    >
      {/* Banner at the top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          padding: "10px 20px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          borderRadius: "10px",
        }}
      >
        <span  style={{
            fontFamily: "'Monoton', serif", 
            fontSize: "85px",
            fontWeight: "bold",
            marginTop: "40px",
            alignContent: "center",
            justifyContent: "center",
          }}>
          HerMap
        </span>
      </div>
   
      {/* Form for adding a new place */}
      <ResponsiveDrawer
        open={open}
        toggleDrawer={toggleDrawer}
        latitude={currentCoords.latitude}
        longitude={currentCoords.longitude}
        onSave={handleSave}
      />
    </div>
  );
  
};

export default MapComponent;