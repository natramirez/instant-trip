const express = require('express');
const request = require('request');
// const config = require('../../config');
const router = new express.Router();

// put in config file later
// var FOURSQUARE_CLIENT_ID = 'SWOOTN5A35KI1S3SPDOK30AFIBPVF1O502JOVJ0FAHPQQ3FA';
// var FOURSQUARE_CLIENT_SECRET = 'V5AXGCJ120UN4LAILUOZ0XZZTG0JNXKIVRGCHQODJ1RELZIS';
// var FOURSQUARE_VERSIONING =  '20180201';
// var FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';

var SYGIC_URL = 'https://api.sygictravelapi.com/1.0/en/places/';
var SYGIC_KEY = 'EC6mGz7Pmv4Ora08FjLze3utwMvd95QpabXIijYH';

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
    
    var reply = request.get({
      url: `${SYGIC_URL}/detect-parents?location=${req.query.ll}`,
      headers: {'x-api-key': SYGIC_KEY}
    },
     (err1, response1, body1) => {
       var body = JSON.parse(body1);
      // console.log('err1: '+ err1);
      // console.log('resp status code: '+ response1.statusCode);
      // console.log('body status code: '+ body.status_code);
      // console.log('response1: '+ JSON.stringify(response1));
      if (err1 || body.status_code != 200) {
        // console.log('error occurred');
        // console.log('status code: ' + JSON.stringify(response1));
        // console.log(body1);
        
        console.error(err1);
        res.status(400).json({
          success: false,
          errors: {},
          message: 'Error making request. Please try again later.'
        });
      } else {
        // console.log('resp1: '+body1);
        // console.log("attempting request #2");
        var parentId = body.data.places[0].id;
        // console.log('parentId: '+parentId);
        var reply = request.get({
          url: `${SYGIC_URL}/list?parents=${parentId}&categories=${req.query.categoryIds}&limit=20`,
          headers: {'x-api-key': SYGIC_KEY}
        },
        (err2, response2, body2) => {
          // console.log('kncksnakc');
          var body = JSON.parse(body2);
          // console.log('resp2: '+body2);
          if (err2 || body.status_code != 200) {
            console.log('error occurred');
            res.status(400).json({
              success: false,
              errors: {},
              message: 'Error making request. Please try again later.'
            });
          } else {
            res.status(200).json({
              success: true,
              response: body
            });
          }
        });
      }
    });
  }
});

module.exports = router;
