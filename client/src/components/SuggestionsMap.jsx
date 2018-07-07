import React from "react"
import { compose, withProps, withState, withHandlers, lifecycle } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker, DirectionsRenderer } from "react-google-maps"

var GOOGLE_MAPS_KEY = 'AIzaSyA_-LRXLmMWEr6_BfIBSjxxuqEX_vUmxuQ';

const MyMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key="+GOOGLE_MAPS_KEY,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className="suggestions-map" />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withState('zoom', 'onBoundsChange', 12),
  withHandlers(() => {
    const refs = {
      map: undefined,
    }

    return {
      onMapMounted: () => ref => {
        refs.map = ref
      },
      onBoundsChanged: ({ onBoundsChange }) => () => {
        onBoundsChange(refs.map.getBounds());
        console.log("bounds: " + JSON.stringify(refs.map.getBounds()));
      }
    }
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentDidMount() {
      const DirectionsService = new google.maps.DirectionsService();

      DirectionsService.route({
        origin: new google.maps.LatLng(41.8507300, -87.6512600),
        destination: new google.maps.LatLng(41.8525800, -87.6514100),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
    }
  })
)((props) =>
  <GoogleMap
    defaultZoom={props.zoom}
    center={props.activeCoordinates}
    ref={props.onMapMounted}
    onBoundsChanged={props.onBoundsChanged}
  >
    {props.isMarkerShown && <Marker position={props.activeCoordinates} onClick={props.onMarkerClick} />}
  </GoogleMap>
);

class SuggestionsMap extends React.Component {
  state = {
    isMarkerShown: false,
  }

  componentDidMount() {
    this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 1000)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <MyMapComponent
        isMarkerShown={this.state.isMarkerShown}
        onMarkerClick={this.handleMarkerClick}
        activeCoordinates={this.props.coordinates}
      />
    )
  }
}

export default SuggestionsMap;

/*
Initial: no marker, no selected, just center map on coordinates (active)
Active: marker on active, center map on active coordinates
Selected: (length == 1) && Active (length == 0): marker on selected ; center map on selected
Selected (length == 1) && Active (length == 1): marker on active, selected ; center map on active
Selected (length == 2) : display directions with no waypoints
Selected (length > 2) : display directions with waypoints

*/