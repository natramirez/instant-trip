import React from 'react';
// import Auth from '../modules/Auth';
import { Card, CardTitle, CardHeader, CardText, CardActions, CardMedia } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import SuggestionsMap from '../components/SuggestionsMap.jsx';

// import Suggestions from '../components/Suggestions.jsx';


class SuggestionsPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);
    
    if (this.props.location.state.data) {
      this.place = this.props.location.state.place;
      this.lattitude = this.props.location.state.lat;
      this.longitude = this.props.location.state.lng;
      this.data = this.props.location.state.data;
    }
    this.state = {
      selected: {lat:this.lattitude, lng: this.longitude}
    }

    // this.createSuggestionBoxes = this.createSuggestionBoxes.bind(this);
    
  }

  getIconUrl(icon) {
    console.log('icon.prefix: '+ icon.prefix);
    console.log('icon.suffix: ' + icon.suffix);
    return (icon.prefix + 'bg_'+'44' + icon.suffix);
  }

  onClick(location) {
    console.log("changing selected to : "+ JSON.stringify(location));
    if(this.state.selected == location) {
      this.setState({selected:{}});
    } else {
      this.setState({selected:location});      
    }
  }

  // getPrimaryCategory(categories) {
  //   for (const cat of categories) {
  //     console.log('category: ',cat.shortName);
  //     if (cat.primary) {return cat.shortName}
  //   }
  // }
  

  createSuggestion = (place,index) => {
    // console.log(place.name)
    // console.log(place.url)

    var urlBtn = place.url ? <CardActions><FlatButton label="Website" href={place.url}/></CardActions> : "";

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
    // console.log("location: "+JSON.stringify(place.location));
    var classes = "suggestion-box" + ((this.state.selected == place.location) ? " active" : "");

    return (
    <Card className={classes} key={index} onClick={this.onClick.bind(this, place.location)}>
      {/* {header} */}
      {media}
      {urlBtn}
    </Card>
  )};

  createSuggestionBoxes = () => (
    this.data.places.map(this.createSuggestion)
  )

  // createSuggestionBoxes() {
  //   this.data.venues.map((venue, index) => (
  //     // console.log(venue.name);
  //     <div>{JSON.stringify(venue.name)}</div>
  //         <Card className="suggestion-container" key={index}>
  //           <CardTitle
  //             title={venue.name}
  //             // subtitle="Select from the following suggestions:"
  //             avatar={this.getIconUrl(venue.categories[0].icon)}
  //           />
  //           <CardActions>
  //             <FlatButton label="Website" href={venue.url}/>
  //           </CardActions>
          
  //         </Card>
  //   ));
  // }

  /**
   * This method will be executed after initial rendering.
   */
  // componentDidMount() {
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('get', '/api/dashboard');
  //   xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  //   // set the authorization HTTP header
  //   xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
  //   xhr.responseType = 'json';
  //   xhr.addEventListener('load', () => {
  //     if (xhr.status === 200) {
  //       this.setState({
  //         secretData: xhr.response.message
  //       });
  //     }
  //   });
  //   xhr.send();
  // }

  /**
   * Render the component.
   */
  render() {
    return (
    <Card className="suggestions-container">
      <CardTitle
        title="Sightseeing Suggestions"
        subtitle="Select from the following suggestions:"
      />
      <div className="suggestions-subcontainer">
        <div className="suggestions-panel">
        {this.createSuggestionBoxes()}
        </div>
        <SuggestionsMap coordinates={this.state.selected}/>
        <div className="suggestions-panel">
        {this.createSuggestionBoxes()}
        </div>
      </div>
    </Card>
    );
  }
}

export default SuggestionsPage;
