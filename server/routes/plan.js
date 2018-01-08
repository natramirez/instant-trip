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
  if (!payload.categoryIds && !payload.tags) {
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
    var limit = 30;
    var radius = 30000;
    var params = '';
    if (req.query.categoryIds) {
      if (req.query.tags) {
        params = `&categories=${req.query.categoryIds}&tags=${req.query.tags}`;
      } else {
        params = `&categories=${req.query.categoryIds}`;
      }
    } else if (req.query.tags) {
      params = `&tags=${req.query.tags}`;
    }
    var reply = request.get({
      url: `${SYGIC_URL}/list?area=${req.query.ll},${radius}${params}&limit=${limit}`,
      headers: {'x-api-key': SYGIC_KEY}
    },
    (err2, response2, body2) => {
      var body = JSON.parse(body2);
      if (err2 || response2.statusCode != 200 || body.status_code != 200) {
        console.log('error occurred: ' + err2);
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

module.exports = router;
