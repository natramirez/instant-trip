import React from 'react';
// import events from 'react-big-calendar/lib/addons/dragAndDrop/events'
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import BigCalendar from 'react-big-calendar';

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';

// BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

class Dnd extends React.Component {
  constructor (props) {
    super(props);
    console.log("goes here")

    if (this.props.location.state) {
      console.log("defined!1")
      this.place = this.props.location.state.place;
      // this.lattitude = this.props.location.state.lat;
      // this.longitude = this.props.location.state.lng;
      this.startDate = this.props.location.state.startDate;
      this.endDate = this.props.location.state.endDate;
      // this.accomodation = this.props.location.state.accomodation;
      // this.data = this.props.location.state.data;
    }
    this.state = {
      events: this.props.location.state.events
    }

    this.moveEvent = this.moveEvent.bind(this)
  }

  moveEvent({ event, start, end }) {
    const { events } = this.state;

    const idx = events.indexOf(event);
    const updatedEvent = { ...event, start, end };

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents
    })

    alert(`${event.title} was dropped onto ${event.start}`);
  }

  render() {
    return (
      <div className="calendar-container">
      <DragAndDropCalendar
        selectable
        events={this.state.events}
        onEventDrop={this.moveEvent}
        defaultView='week'
        defaultDate={moment(this.startDate).toDate()}
      />
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Dnd)