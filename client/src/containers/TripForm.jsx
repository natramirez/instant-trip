import React from 'react';
import { PropTypes } from 'prop-types';
import Auth from '../modules/Auth';
import LoginForm from '../components/LoginForm.jsx';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import PlacesSearchBox from '../components/PlacesSearchBox';
import DateRangePickerWrapper from '../components/DateRangePickerWrapper';
import Checkbox from '../components/Checkbox.jsx';
// const config = require('../../../config');
import request from 'request';

const items = [
  'Landmarks',
  'Museums',
  'Parks',
  'Shopping',
  'Outdoors'
];

const categories = {
  'Landmarks':['4bf58dd8d48988d12d941735'], //monument/landmark
  'Museums':['4bf58dd8d48988d181941735'], //museums
  'Parks':['52e81612bcbc57f1066b7a21','4bf58dd8d48988d163941735'], //natl park, park
  'Shopping':['4bf58dd8d48988d1fd941735','5744ccdfe4b0c0459246b4dc', '4bf58dd8d48988d103951735'],
  'Outdoors':['56aa371be4b08b9a8d573544','4bf58dd8d48988d1e2941735','56aa371be4b08b9a8d57355e','52e81612bcbc57f1066b7a22','4bf58dd8d48988d1e4941735','56aa371be4b08b9a8d573511','52e81612bcbc57f1066b7a12','4bf58dd8d48988d159941735','5032848691d4c4b30a586d61','56aa371be4b08b9a8d573560','4bf58dd8d48988d1e9941735','50328a4b91d4c4b30a586d6b','52e81612bcbc57f1066b7a29','4bf58dd8d48988d162941735','4bf58dd8d48988d161941735','4bf58dd8d48988d160941735'] //bay, beach, bike trail, botanical garden, campground, cave, dive spot,trail, volcano, waterfall, ski area, rock climbing spot, rafting, other great outdoors,lake, hot spring
}

class TripForm extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props, context) {
    super(props, context);

    const storedMessage = localStorage.getItem('successMessage');
    let successMessage = '';

    if (storedMessage) {
      successMessage = storedMessage;
      localStorage.removeItem('successMessage');
    }

    // set the initial component state
    this.state = {
      errors: {}
    };
    this.setParentPlacesState = this.setParentPlacesState.bind(this);
    this.setParentDatesState = this.setParentDatesState.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentWillMount = () => {
    this.selectedCheckboxes = new Set();
  }

  setParentPlacesState(address) {
    this.setState({ address })
  }
  setParentDatesState({ startDate, endDate }) {
    this.setState({ startDate, endDate });
  }

  /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   */
  handleFormSubmit(event) {
  // processForm(latLng, startDate, endDate, categories) {
    // prevent default action. in this case, action is the form submission event
    event.preventDefault();

    //transform data appropriately first
    var that = this;
    console.log('woooo')
    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(coordinates => {
        var categoryIds = [];
        for (const checkbox of this.selectedCheckboxes) {
          console.log(checkbox, 'is selected.');
          categoryIds = categoryIds.concat(categories[checkbox]);
        }
        categoryIds = encodeURIComponent(categoryIds.join(','));
        
        console.log('Success', coordinates);
        var ll = JSON.stringify(coordinates.lat)+','+JSON.stringify(coordinates.lng);
        ll = encodeURIComponent(ll);
        var reqUrl = `/plan/suggestions`;

        // console.log('requrl: '+ reqUrl);

        const formData = `ll=${ll}&categoryIds=${categoryIds}`;
        console.log('categoryIds: ' + categoryIds);

        // create an AJAX request
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/plan/suggestions?' + formData);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.responseType = 'json';
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            // success
            console.log('sucessssss');
            console.log(xhr.response);
            // change the component-container state
            // that.setState({
            //   errors: {}
            // });
    
            // save the token
            // Auth.authenticateUser(xhr.response.token);
    
    
            // change the current URL to /
            that.context.router.push({ //browserHistory.push should also work here
              pathname: '/suggestions',
              state: {
                place: that.state.address,
                lat: coordinates.lat,
                lng: coordinates.lng,
                data: xhr.response.response.response
              }
            });
          } else {
            // failure
            console.log('faill, errors: ' + JSON.stringify(xhr.response.errors) + ', message: ' + xhr.response.message);
            // change the component state
            const errors = xhr.response.errors ? xhr.response.errors : {};
            errors.summary = xhr.response.message;
    
            that.setState({
              errors
            });
          }
        });
        xhr.send();
        // xhr.send(formData);
        

      }).catch(error => console.error('Error', error))
    }
  /**
   * Change the user object.
   *
   * @param {object} event - the JavaScript event object
   */
  // changeUser(event) {
  //   const field = event.target.name;
  //   const user = this.state.user;
  //   user[field] = event.target.value;

  //   this.setState({
  //     user
  //   });
  // }

  toggleCheckbox = label => {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  }
  createCheckbox = label => (
    <Checkbox
      label={label}
      handleCheckboxChange={this.toggleCheckbox}
      key={label}
    />
  )

  createCheckboxes = () => (
    items.map(this.createCheckbox)
  )
  /**
   * Render the component.
   */
  render() {
    // var suggestions = this.state.renderSuggestions ? this.createSuggestions : ({})
    return (
      <div>
      <form onSubmit={this.handleFormSubmit}>
      {/* {successMessage && <p className="success-message">{successMessage}</p>} */}
      {this.state.errors.summary && <p className="error-message">{this.state.errors.summary}</p>}
      <div>
        <p>Which city are you traveling to?</p>
      <PlacesSearchBox setParentPlacesState={this.setParentPlacesState} />
      </div>
      <div>
        <p>What dates will you be traveling?</p>
      <DateRangePickerWrapper setParentDatesState={this.setParentDatesState} />
      </div>
      {/* <LoginForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        successMessage={this.state.successMessage}
        user={this.state.user}
      /> */}
      <div>
        <p>What types of places do you want to visit?</p>
        <div style={{maxWidth: 550, margin: 'auto'}}>
          {this.createCheckboxes()}
        </div>
      </div>
      <p>
      <button type="submit">Submit</button>
      </p>
      </form>
      </div>
    );
  }

}

TripForm.contextTypes = {
  router: PropTypes.object.isRequired
};

export default TripForm;
