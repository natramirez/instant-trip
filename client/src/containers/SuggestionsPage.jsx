import React from 'react';
import { PropTypes } from 'prop-types';

// import Auth from '../modules/Auth';
import { Card, CardTitle, CardHeader, CardText, CardActions, CardMedia } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import SuggestionsMap from '../components/SuggestionsMap.jsx';


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
    }
    this.state = {
      active: {lat:this.lattitude, lng: this.longitude}
    }
    this.makeItinerary = this.makeItinerary.bind(this);
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

  /*
  makeItinerary output: 
  data: [
    {
      date: "01/27/18"
      [
        {},
        {},
        {},


      ]
    },
    {[]},{[]}
  ]

  */

  
  // getPrimaryCategory(categories) {
  //   for (const cat of categories) {
  //     console.log('category: ',cat.shortName);
  //     if (cat.primary) {return cat.shortName}
  //   }
  // }

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
    
    var media = place.thumbnail_url ? (
      <CardMedia overlay={
        <CardTitle 
        title={place.name}
        subtitle={place.categories}
        />}>
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


  makeItinerary() {
    // var reqUrl = `/plan/suggestions`;
    // const formData = `place=${this.state.address}&categoryIds=${categoryIds}`;

    // // create an AJAX request
    // const xhr = new XMLHttpRequest();
    // xhr.open('get', '/plan/suggestions?' + formData);
    // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // xhr.responseType = 'json';
    // xhr.addEventListener('load', () => {
    //   if (xhr.status === 200) {
    //     // success
    //     console.log('sucessssss');
    //     console.log(xhr.response);

        // change the current URL to /
        console.log("router: " + this.context.router);
        console.log("context: " + JSON.stringify(this.context));
        this.context.router.push({ //browserHistory.push should also work here
          pathname: '/itinerary',
          // state: {
          //   place: that.state.address,
          //   lat: coordinates.lat,
          //   lng: coordinates.lng,
          //   data: xhr.response.response.data
          // }
        });
    //   } else {
    //     // failure
    //     console.log('faill, errors: ' + JSON.stringify(xhr.response.errors) + ', message: ' + xhr.response.message);
    //     // change the component state
    //     const errors = xhr.response.errors ? xhr.response.errors : {};
    //     errors.summary = xhr.response.message;

    //     that.setState({
    //       errors
    //     });
    //   }
    // });
    // xhr.send();
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
          <SuggestionsMap coordinates={this.state.active}/>
          <div>
          <CardTitle
            // title={"My sightseeing list:"}
            subtitle={"My sightseeing list:"}
          ><FloatingActionButton className="make-itinerary-btn" onClick={this.makeItinerary}>Make my itinerary</FloatingActionButton></CardTitle>
          <div className="suggestions-selected-container">
          {this.createSelectedBoxes()}
          </div>
          </div>
        </div>
        <div className="suggestions-panel">
        {/* {this.createSuggestionBoxes()} */}
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
