import React from 'react';
import { PropTypes } from 'prop-types';
import Auth from '../modules/Auth';
import LoginForm from '../components/LoginForm.jsx';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import PlacesSearchBox from '../components/PlacesSearchBox';
import DateRangePickerWrapper from '../components/DateRangePickerWrapper';
import Checkbox from '../components/Checkbox.jsx';

// import XMLHttpRequest from 'xmlhttprequest';

const items = [
  'Landmarks',
  'Museums',
  'Parks',
];

const categories = {
  'Landmarks': ['4bf58dd8d48988d12d941735'], //monument/landmark
  'Museums':['4bf58dd8d48988d181941735'], //museums
  'Parks':['52e81612bcbc57f1066b7a21','4bf58dd8d48988d163941735'] //natl park, park
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
    // var lattitude, longitude;
    var that = this;
    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(coordinates => {
        var categoryIds = [];
        for (const checkbox of this.selectedCheckboxes) {
          console.log(checkbox, 'is selected.');
          categoryIds = categoryIds.concat(categories[checkbox]);
        }
        categoryIds = categoryIds.join(',');
        console.log('catids: ' + categoryIds)

        var CLIENT_ID = 'SWOOTN5A35KI1S3SPDOK30AFIBPVF1O502JOVJ0FAHPQQ3FA';
        var CLIENT_SECRET = 'V5AXGCJ120UN4LAILUOZ0XZZTG0JNXKIVRGCHQODJ1RELZIS';
        console.log('Success', coordinates);
        var lattitude = coordinates.lat;
        var longitude = coordinates.lng;
        var ll = JSON.stringify(lattitude)+','+JSON.stringify(longitude);
        var v = '20180201';
        var reqUrl = `https://api.foursquare.com/v2/venues/search?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&ll=${ll}&categoryId=${categoryIds}&v=${v}`;
        const xhr = new XMLHttpRequest();
        xhr.open('get', reqUrl);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.responseType = 'json';
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            console.log('status == 200');
            console.log('suggestions: ' + JSON.stringify(xhr.response));
            that.setState({
              errors: {},
              suggestions: xhr.response
            });
          } else {
            console.log('status != 200');
            // failure

            // change the component state
            const errors = xhr.response.errors ? xhr.response.errors : {};
            // errors.summary = xhr.response.message;
            that.setState({
              errors
            });
          }
        });
        xhr.send();
      })


        
        // var startDate = encodeURIComponent(that.state.startDate);
        // var endDate = encodeURIComponent(that.state.endDate);

        // const formData = `lattitude=${lattitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}`;
        // const formData = `lattitude=${lattitude}&longitude=${longitude}`;

        // // create an AJAX request
        // const xhr = new XMLHttpRequest();
        // xhr.open('get', '/plan/suggestions?' + formData);
        // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // xhr.responseType = 'json';
        // xhr.addEventListener('load', () => {
        //   if (xhr.status === 200) {
        //     // success
        //     console.log('Res received', xhr.response.suggestions);

        //     // change the component-container state
        //     that.setState({
        //       errors: {},
        //       suggestions: xhr.response.suggestions
        //     });

        //     // save the token
        //     // Auth.authenticateUser(xhr.response.token);

        //     //for now: load suggestions component below form


        //     // change the current URL to /
        //     // this.context.router.replace('/suggestions');
        //   } else {
        //     // failure

        //     // change the component state
        //     const errors = xhr.response.errors ? xhr.response.errors : {};
        //     errors.summary = xhr.response.message;

        //     that.setState({
        //       errors
        //     });
        //   }
        // });
        // xhr.send();
        //call callback with latLng
      .catch(error => console.error('Error', error))
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
      <div>
        <p>Which city will you go to?</p>
      <PlacesSearchBox setParentPlacesState={this.setParentPlacesState} />
      </div>
      <div>
        <p>Which dates will you be traveling?</p>
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
        <p>What types of places do you want to go to?</p>
      {this.createCheckboxes()}
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
