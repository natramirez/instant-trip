import React from 'react';
import { PropTypes } from 'prop-types';
import { Card, CardTitle, CardText } from 'material-ui/Card';



const Suggestions = ({ data }) => (
  <Card className="container">
    <CardTitle
      title="Sightseeing Suggestions"
      subtitle="Select from the following suggestions:"
    />

    {data && <CardText style={{ fontSize: '16px', color: 'green' }}>{data}</CardText>}
  </Card>
);

export default Suggestions;
