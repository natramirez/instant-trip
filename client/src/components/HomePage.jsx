import React from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import PlacesSearchBox from './PlacesSearchBox';

// FourSquare API
// CLIENT_ID:
// SWOOTN5A35KI1S3SPDOK30AFIBPVF1O502JOVJ0FAHPQQ3FA
// CLIENT_SECRET:
// V5AXGCJ120UN4LAILUOZ0XZZTG0JNXKIVRGCHQODJ1RELZIS

//Google Maps Javascript API KEY: AIzaSyCP60cFA2BJfNsbX4P_Eai-sV1nuwB_BwU

const HomePage = () => (
  <Card className="container">
    <CardTitle title="React Application" subtitle="This is the home page." />
    <PlacesSearchBox />
  </Card>
);

export default HomePage;
