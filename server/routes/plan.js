const express = require('express');
const request = require('request');
// const config = require('../../config');
const router = new express.Router();

// put in config file later
var FOURSQUARE_CLIENT_ID = 'SWOOTN5A35KI1S3SPDOK30AFIBPVF1O502JOVJ0FAHPQQ3FA';
var FOURSQUARE_CLIENT_SECRET = 'V5AXGCJ120UN4LAILUOZ0XZZTG0JNXKIVRGCHQODJ1RELZIS';
var FOURSQUARE_VERSIONING =  '20180201';
var FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';


function validateTripForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || !payload.ll) {
    isFormValid = false;
    errors.city = 'Please provide a travel destination.';
  }
  if (!payload || !payload.categoryIds) {
    isFormValid = false;
    errors.categoryIds = 'Please select at least one place category.';
  }
  if (!isFormValid) {
    message = 'Check the form for errors.';
  }
  return {
    success: isFormValid,
    message,
    errors
  };
}

router.get('/suggestions', function(req, res) {
  console.log(JSON.stringify(req.query));
  
  const validationResult = validateTripForm(req.query);
  
  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  } else {
    console.log("attempting request");
    
    var reply = request.get(`${FOURSQUARE_SEARCH_URL}?client_id=${FOURSQUARE_CLIENT_ID}&client_secret=${FOURSQUARE_CLIENT_SECRET}&ll=${req.query.ll}&categoryId=${req.query.categoryIds}&v=${FOURSQUARE_VERSIONING}`,
     (err, response, body) => {
      console.log('kncksnakc');
      if (err || response.statusCode != 200) {
        console.log('error occurred');
        res.status(400).json({
          success: false,
          errors: {},
          message: 'Error making request. Please try again later.'
        });
      } else {
        res.status(200).json({
          success: true,
          response: JSON.parse(body)
        });
      }
    });
  }

});

module.exports = router;
