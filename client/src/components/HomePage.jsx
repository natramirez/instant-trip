import React from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import TripForm from '../containers/TripForm.jsx'


const HomePage = () => (
  <Card className="container">
    <CardTitle title="Instant Trip" subtitle="Please enter your trip details below." />
    <TripForm />
  </Card>
);

export default HomePage;
