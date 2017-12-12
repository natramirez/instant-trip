import React from "react"
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

var GOOGLE_MAPS_KEY = 'AIzaSyA_-LRXLmMWEr6_BfIBSjxxuqEX_vUmxuQ';

const MyMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key="+GOOGLE_MAPS_KEY,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className="suggestions-map" />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={12}
    center={props.startCoordinates}
  >
    {props.isMarkerShown && <Marker position={props.startCoordinates} onClick={props.onMarkerClick} />}
  </GoogleMap>
);

class SuggestionsMap extends React.PureComponent {
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
        startCoordinates={this.props.coordinates}
      />
    )
  }
}

export default SuggestionsMap;