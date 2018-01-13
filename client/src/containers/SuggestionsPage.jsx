import React from 'react';
import { PropTypes } from 'prop-types';
// import Auth from '../modules/Auth';
import { Card, CardTitle, CardHeader, CardText, CardActions, CardMedia } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import SuggestionsMap from '../components/SuggestionsMap.jsx';
import StartPointDialogBtn from '../components/StartPointDialog.jsx';
import moment from 'moment';
import async from 'async';



class SuggestionsPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props, context) {
    super(props, context);
    
    if (this.props.location.state.data) {
      this.place = this.props.location.state.place;
      this.lattitude = this.props.location.state.lat;
      this.longitude = this.props.location.state.lng;
      this.data = this.props.location.state.data;
      this.startDate = this.props.location.state.startDate;
      this.endDate = this.props.location.state.endDate;
    }
    this.state = {
      active: {lat:this.lattitude, lng: this.longitude}
    }
    this.makeItinerary = this.makeItinerary.bind(this);
    this.setParentPlacesState = this.setParentPlacesState.bind(this);
    this.setParentStartTimeState = this.setParentStartTimeState.bind(this);
    this.setParentEndTimeState = this.setParentEndTimeState.bind(this);
  }

  setParentPlacesState(address) {
    console.log("address:"+address)
    this.setState({ accommodation:address })
    console.log("accommodation:"+this.state.accommodation)
  }
  setParentStartTimeState(time) {
    this.setState({ dailyStartTime: time });
    console.log("daily start time:"+this.state.dailyStartTime);
    
  }
  setParentEndTimeState(time) {
    this.setState({ dailyEndTime: time });
    console.log("daily end time:"+this.state.dailyEndTime);

  }

  getIconUrl(icon) {
    console.log('icon.prefix: '+ icon.prefix);
    console.log('icon.suffix: ' + icon.suffix);
    return (icon.prefix + 'bg_'+'44' + icon.suffix);
  }

  onClick(location) {
    console.log("changing active to : "+ JSON.stringify(location));
    if(this.state.active == location) {
      this.setState({active:{}});
    } else {
      this.setState({active:location});      
    }
  }

  selectSuggestion(name) {
    console.log("select suggestion entered");
    if (!this.state.selected) {
      this.setState({selected: [name]});
      console.log("new selected: "+ this.state.selected);
    }
    else if (!this.state.selected.includes(name)) {
      var newArr = this.state.selected;
      newArr.push(name);
      this.setState({selected: newArr});
      console.log("updated selected: "+ this.state.selected);
    }
  }

  removeSelection(name) {
    console.log("remove suggestion entered");
    var index = this.state.selected.indexOf(name);    
    if (index != -1) {
      var newArray = this.state.selected;
      newArray.splice(index, 1);
      var curActive = this.state.active;
      // newArr.push(name);
      this.setState({selected: newArray, active: curActive});
      // console.log("updated selected: "+ this.state.selected);
      
    }
  }

  createSelected = (place, index) => {
    console.log("create selected entered")
    
        // var iconUrl = this.getIconUrl(place.categories[0].icon);
        // console.log(iconUrl);
        // var thumbnailUrl = place.thumbnail_url;
        var header = place.thumbnail_url ? <CardHeader
            title={place.name}
            subtitle={place.categories[0]}
            avatar={place.thumbnail_url}
          /> : <CardHeader title={place.name} subtitle={place.categories[0]}/>;
        
        var media = place.thumbnail_url ? (
          <CardMedia overlay={
            <CardTitle 
            title={place.name}
            subtitle={place.categories}
            />}>
            <img className="suggestions-img" src={place.thumbnail_url} alt="" />
          </CardMedia>) : "";
    
    var classes = "selected-box" + ((this.state.active == place.location) ? " active" : "");
    return (
      <div className="suggestion-container">
      <Card className={classes} key={index} >
        {header}
        <FloatingActionButton 
        mini={true}
        className="delete-selected-btn"
        onClick={this.removeSelection.bind(this, place)}>
        X</FloatingActionButton>
      </Card>
      </div>
  )};
  
  createSelectedBoxes = () => {
    if (this.state.selected) {
      return (this.state.selected.map(this.createSelected))
    }
  };

  createSuggestion = (place,index) => {
    var urlBtn = place.url ? <CardActions><FlatButton label="Website" href={place.url}/></CardActions> : "";

    // var iconUrl = this.getIconUrl(place.categories[0].icon);
    // console.log(iconUrl);
    // var thumbnailUrl = place.thumbnail_url;
    var header = place.thumbnail_url ? <CardHeader
        title={place.name}
        subtitle={place.categories[0]}
        // avatar={place.thumbnail_url}
      /> : <CardHeader title={place.name} subtitle={place.categories[0]}/>;
    
    var media = place.thumbnail_url ? 
    (<CardMedia>
        <img className="suggestions-img" src={place.thumbnail_url} alt="" />
      </CardMedia>) : "";

    var classes = "suggestion-box" + ((this.state.active == place.location) ? " active" : "");

    return (
    <div className="suggestion-container">
      <Card className={classes} key={index} onClick={this.onClick.bind(this, place.location)}>
        {header}
        {media}
        {urlBtn}
      </Card>
      <div className="suggestion-btn-column">
        <FloatingActionButton 
          mini={true} 
          className="select-suggestion-btn"
          title="Add to my sightseeing list"
          onClick={this.selectSuggestion.bind(this, place)}>
          
          <ContentAdd/> 
        </FloatingActionButton>
      </div>
    </div>
  )};

  createSuggestionBoxes = () => (
    this.data.places.map(this.createSuggestion)
  )

  // getWaypoints() {
  //   var waypts = [];
  //   if (this.state.selected) {
  //     this.state.selected.forEach(function(place) {
  //       waypts.push({
  //         location: new google.maps.LatLng(place.location.lat, place.location.lng),
  //         stopover:true
  //       });
  //     });
  //   }
  //   return waypts;
  // }

  /*
  for each day
    for each POI
      if not open today, add to reject list
      else add to day list
    order Day List POI by shortest time open first
    if time open <= avg duration there 
      hardcode this place as an event
    else


  */


  makeItinerary() {
    // const DirectionsService = new google.maps.DirectionsService();
    // var departureTime = moment(this.startDate).toDate();
    // const DEFAULT_DAILY_DEPARTURE_HOUR = 9;
    // const DEFAULT_DAILY_SIGHTSEEING_HOURS = 10;
    // departureTime.setHours(DEFAULT_DAILY_DEPARTURE_TIME);
    // var waypoints = this.getWaypoints();
    // DirectionsService.route({
    //   origin: new google.maps.LatLng(41.8507300, -87.6512600),
    //   destination: new google.maps.LatLng(41.8525800, -87.6514100),
    //   waypoints: waypoints,
    //   optimizeWaypoints: true,
    //   // provideRouteAlternatives: false,
    //   travelMode: google.maps.TravelMode.DRIVING,
    //   drivingOptions: {
    //     departureTime: departureTime,
    //     trafficModel: 'pessimistic'
    //   },
    // }, (result, status) => {
    //   if (status === google.maps.DirectionsStatus.OK) {
    //     console.log(`directions result: ${JSON.stringify(result)}`);
    //     console.log(result.routes[0].waypoint_order);
    //   } else {
    //     console.error(`error fetching directions ${result}`);
    //   }
    // });
    var that = this;

    async.map(this.state.selected, function(place, callback) {
      const xhr = new XMLHttpRequest();
      xhr.open('get', '/plan/place-details?id=' + encodeURIComponent(place.id));
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'json';
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          // success
          console.log(xhr.response);
          callback(null, xhr.response);
        } else {
          // failure
          console.log('error with one of the place details requests');
          // return 0;
        }
      });
      xhr.send();
    }, function(err, placeDetailsArr) {
      if (err) {
        console.log('error making place details array');
      } else {
        console.log("completed results: "+JSON.stringify(placeDetailsArr));
        geocodeByAddress(that.state.accommodation)
        .then(results => getLatLng(results[0]))
        .then(coordinates => {
          // var reqUrl = `/plan/suggestions`;
          var formData = {
            place: {
              address:that.state.address, 
              lat:that.lattitude,
              lng:that.longitude
            },
            selected: placeDetailsArr,
            dailyStartTime: that.state.dailyStartTime,
            dailyEndTime: that.state.dailyEndTime,
            startDate: that.startDate,
            endDate: that.endDate,
            accommodation: {
              address: that.state.accommodation,
              lat: coordinates.lat,
              lng: coordinates.lng
            }
          };

          // create an AJAX request
          const xhr = new XMLHttpRequest();
          xhr.open('post', '/plan/itinerary');
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.responseType = 'json';
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              // success
              console.log('sucessssss');
              console.log(xhr.response);

              // change the current URL to /
              // console.log("router: " + this.context.router);
              // console.log("context: " + JSON.stringify(this.context));
              var newEvents = [];
              for (var i = 0; i < xhr.response.response.length; i++) {
                var curEvent = xhr.response.response[i];
                curEvent.start = new Date(curEvent.start);
                curEvent.end = new Date(curEvent.end);
                newEvents.push(curEvent);
              }

              that.context.router.push({ //browserHistory.push should also work here
                pathname: '/itinerary',
                state: {
                  startDate: that.startDate,
                  endDate: that.endDate,
                  events: newEvents,
                  place: that.place
                  // lat: coordinates.lat,
                  // lng: coordinates.lng,
                  // data: xhr.response.response.data
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
        xhr.send(JSON.stringify(formData));
        }).catch(error => console.error('Geocoding Error', error))
      }
    });
}

  /**
   * Render the component.
   */
  render() {
    return (
    <Card className="suggestions-container">
      <CardTitle
        title={"Select from the following sightseeing suggestions in "+this.place+":"}
      />
      <div className="suggestions-subcontainer">
        <div className="suggestions-panel">
        {this.createSuggestionBoxes()}
        </div>
        <div className="suggestions-middle">
          <SuggestionsMap coordinates={this.state.active} selected={this.state.selected}/>
          <div>
          <CardTitle
            // title={"My sightseeing list:"}
            subtitle={"My sightseeing list:"}
          ><StartPointDialogBtn 
              setParentPlacesState={this.setParentPlacesState}
              setParentStartTimeState={this.setParentStartTimeState}
              setParentEndTimeState={this.setParentEndTimeState}
              makeItinerary={this.makeItinerary}
            />
          </CardTitle>
          <div className="suggestions-selected-container">
          {this.createSelectedBoxes()}
          </div>
          </div>
        </div>
        <div className="suggestions-panel">
        {this.createSuggestionBoxes()}
        </div>
      </div>
    </Card>
    );
  }
}

SuggestionsPage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default SuggestionsPage;
