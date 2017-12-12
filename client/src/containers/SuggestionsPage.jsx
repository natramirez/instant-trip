import React from 'react';
// import Auth from '../modules/Auth';
import { Card, CardTitle, CardHeader, CardText, CardActions, CardMedia } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import SuggestionsMap from '../components/SuggestionsMap.jsx';


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
