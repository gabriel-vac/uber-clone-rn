import React, { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'twrnc';
import MapViewDirections from 'react-native-maps-directions';
// eslint-disable-next-line import/no-unresolved
import { GOOGLE_MAPS_APIKEY } from '@env';
import {
  selectOrigin,
  selectDestination,
  setTravelTimeInformation,
} from '../slices/navSlice';

export default function Map() {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // eslint-disable-next-line no-useless-return
    if (!origin || !destination) return;

    // Zoom & fit to markers
    mapRef.current.fitToSuppliedMarkers(['origin', 'destination']);
  }, [origin, destination]);

  useEffect(() => {
    if (!origin || !destination) return;
    const getTravelTime = async () => {
      fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?
      units=imperial&origins=${origin.description}&destinations=${destination.description}
      &key=${GOOGLE_MAPS_APIKEY}`)
        .then((res) => res.json())
        .then((data) => {
          dispatch(setTravelTimeInformation(data.rows[0].elements[0]));
        });
    };

    getTravelTime();
  }, [origin, destination, GOOGLE_MAPS_APIKEY]);

  return (
    <MapView
      ref={mapRef}
      mapType="mutedStandard"
      style={tw`flex-1`}
      initialRegion={{
        latitude: origin.location.lat,
        longitude: origin.location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
    >
      {origin && destination && (
        <MapViewDirections
          origin={origin.description}
          destination={destination.description}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="black"
        />
      )}
      {origin?.location && ( // if we have an origin.location
        <Marker
          coordinate={{
            latitude: origin.location.lat,
            longitude: origin.location.lng,
          }}
          title="Origin"
          description={origin.description}
          identifier="origin"
        />
      )}
      {destination?.location && ( // if we have an origin.location
        <Marker
          coordinate={{
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          }}
          title="Destination"
          description={destination.description}
          identifier="destination"
        />
      )}
    </MapView>
  );
}
