import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

import 'mapbox-gl/dist/mapbox-gl.css';

interface MovingObject {
  id: number;
  name: string;
  coordinates: number[];
}

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

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
        center: [-74.0060152, 40.7127281],
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
      

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Construction on the Washington Monument began in 1848.'
      );

      type ApiResponse = Array<{
        _id: string;
        latitude: number;
        longitude: number;
        safetyRating: number;
        reviewText: string;
        userId: string;
      }>;

      // Function to format API response
      const formatApiResponse = (
        apiResponse: ApiResponse
      ): GeoJSON.FeatureCollection<GeoJSON.Point> => {
        return {
          type: "FeatureCollection",
          features: apiResponse.map((item) => ({
            type: "Feature",
            properties: {
              safetyRating: item.safetyRating,
              reviewText: item.reviewText,
              userId: item.userId,
            },
            geometry: {
              type: "Point",
              coordinates: [item.longitude, item.latitude],
            },
          })),
        };
      };

      const fetchData = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8001/api/pins");
          const apiResponse = await response.json();
          console.log(apiResponse);

          const geojsonData = formatApiResponse(apiResponse);
          console.log(geojsonData);

          // for (const feature of geojsonData.features) {
          //   const el = document.createElement('div');
          //   el.className = 'marker';
          //   new mapboxgl.Marker(el)
          //     .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
          //     .setPopup(
          //       new mapboxgl.Popup({ offset: 25 }) // add popups
          //         .setHTML(
          //           `${feature.properties ? `<h3>${feature.properties.reviewText}</h3><p>${feature.properties.safetyRating}</p>` : 'No data available'}`
          //         )
          //     )
          //     .addTo(map); 
          //     console.log("Successfully added marker");
          
          // }

          //Load GeoJSON data on map
          map.on("load", () => {
            map.addSource("points", {
              type: "geojson",
              data: geojsonData,
            });

            map.addLayer({
              id: "points-layer",
              type: "circle",
              source: "points",
              paint: {
                "circle-radius": 6,
                "circle-color": "#007cbf",
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff",
              },
            });

            map.on('mouseenter', 'points-layer', (e) => {
              map.getCanvas().style.cursor = 'pointer';

              const features = map.queryRenderedFeatures(e.point);
              let longitude = (features[0].geometry as GeoJSON.Point).coordinates[0];
              const latitude = (features[0].geometry as GeoJSON.Point).coordinates[1];
              const { safetyRating, reviewText } = features[0].properties as { safetyRating: number; reviewText: string };
    
              // Ensure that if the map is zoomed out such that multiple
              // copies of the feature are visible, the popup appears
              // over the copy being pointed to.
              while (Math.abs(e.lngLat.lng - longitude) > 180) {
                longitude += e.lngLat.lng > longitude ? 360 : -360;
              }
    
              popup
                .setLngLat([longitude, latitude])
                .setHTML(`<h3>${safetyRating}</h3><p>${reviewText}</p>`)
                .addTo(map);
            });

            map.on('mouseleave', 'points-layer', () => {
              map.getCanvas().style.cursor = '';
              popup.remove();
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

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
      }}
    />
  );
};

export default MapComponent;