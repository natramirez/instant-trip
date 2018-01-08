import React from 'react'
import PlacesAutocomplete from 'react-places-autocomplete'

class PlacesSearchBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = { address: '' }
    this.onChange = this.onChange.bind(this)
    // this.onChange = (address) => this.setState({ address })
    // this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  // handleFormSubmit(event) {
  //   event.preventDefault()

  //   geocodeByAddress(this.state.address)
  //     .then(results => getLatLng(results[0]))
  //     .then(latLng => console.log('Success', latLng))  //call callback with latLng
  //     .catch(error => console.error('Error', error))
  // }

  onChange(address) {
    this.setState({address});
    this.props.setParentPlacesState(address);
  }

  render() {
    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
      placeholder: this.props.placeholder,
      types: this.props.types
    }

    return (
      // <form onSubmit={this.handleFormSubmit}>
        <PlacesAutocomplete inputProps={inputProps} />
        // <button type="submit">Submit</button>
      // </form>
    )
  }
}

export default PlacesSearchBox;