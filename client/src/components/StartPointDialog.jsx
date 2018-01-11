import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import PlacesSearchBox from '../components/PlacesSearchBox';

/**
 * A modal dialog can only be closed by selecting one of the actions.
 */

const customStyle = {
    overflowY: 'visible'
};
export default class DialogModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {open: false, value1: null, value2: null};
    }
  

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleChangeTimePicker1 = (event, date) => {
        this.setState({value1: date});
        this.props.setParentStartTimeState(date);
    }
    handleChangeTimePicker2 = (event, date) => {
        this.setState({value2: date});
        this.props.setParentEndTimeState(date);

    }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Make My Itinerary"
        primary={true}
        onClick={this.props.makeItinerary}
      />,
    ];

    return (
      <div className="dialog-btn">
        <RaisedButton label="Make My Itinerary" onClick={this.handleOpen} />
        <Dialog
          title="Additional details needed"
          actions={actions}
          modal={true}
          bodyStyle={customStyle}
          open={this.state.open}
        >
        Please select a starting and ending point for each day of travel. This may be your accommodation.
        <PlacesSearchBox setParentPlacesState={this.props.setParentPlacesState} placeholder={'e.g. Hotel name or address'}/>

        Please select a starting and ending time for each day of travel. You can edit these options later as needed.
        <TimePicker hintText="Start time" value={this.state.value1} onChange={this.handleChangeTimePicker1}/>  
        <TimePicker hintText="End time" value={this.state.value2} onChange={this.handleChangeTimePicker2}/>  
        </Dialog>
      </div>
    );
  }
}