import React from 'react';
// import Auth from '../modules/Auth';
import { Card, CardTitle, CardHeader, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
// import Suggestions from '../components/Suggestions.jsx';


class SuggestionsPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);
    
    if (this.props.location.state.data) {
      this.data = this.props.location.state.data
    }

    // this.createSuggestionBoxes = this.createSuggestionBoxes.bind(this);
    
  }

  getIconUrl(icon) {
    console.log('icon.prefix: '+ icon.prefix);
    console.log('icon.suffix: ' + icon.suffix);
    return (icon.prefix + 'bg_'+'44' + icon.suffix);
  }

  getPrimaryCategory(categories) {
    for (const cat of categories) {
      console.log('category: ',cat.shortName);
      if (cat.primary) {return cat.shortName}
    }
  }

  createSuggestion = (venue,index) => {
    console.log(venue.name)
    console.log(venue.url)

    var urlBtn = venue.url ? <CardActions><FlatButton label="Website" href={venue.url}/></CardActions> : "";

    var iconUrl = this.getIconUrl(venue.categories[0].icon);
    console.log(iconUrl);
    var avatar = iconUrl ? <CardHeader
        title={venue.name}
        subtitle={this.getPrimaryCategory(venue.categories)}
        avatar={iconUrl}
      /> : <CardHeader title={venue.name} subtitle={this.getPrimaryCategory(venue.categories)}/>;

    return (
    <Card className="suggestion-box" key={index}>
      {avatar}
      {urlBtn}
    </Card>
  )};

  createSuggestionBoxes = () => (
    this.data.venues.map(this.createSuggestion)
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
    // return (<Suggestions data={this.props.location.state.data} />);

    return (
    <Card className="suggestions-container">
      <CardTitle
        title="Sightseeing Suggestions"
        subtitle="Select from the following suggestions:"
      />
      
      {this.createSuggestionBoxes()}
      
  </Card>
  );
  }

}

export default SuggestionsPage;
