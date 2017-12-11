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

  if (!payload || !payload.place) {
    isFormValid = false;
    errors.city = 'Please provide a travel destination.';
  }
  if (!payload.categoryIds) {
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

// function findParentCity(parentsArray) {
//   for (var i = 0; i < parentsArray.length; i++) {
//     if (parentsArray[i].level == 'city') return parentsArray[i].name;
//     else if (parentsArray[i].level == 'town') return parentsArray[i].name;

//   }
// }

router.get('/suggestions', function(req, res) {
  console.log(JSON.stringify(req.query));
  
  const validationResult = validateTripForm(req.query);
  
  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  // } else {
  //   console.log("attempting request");
    
  //   var reply = request.get({
  //     // url: `${SYGIC_URL}/detect-parents?location=${req.query.ll}`,
  //     url: `${SYGIC_URL}/list?query=${req.query.place}`,
  //     headers: {'x-api-key': SYGIC_KEY}
  //   },
  //    (err1, response1, body1) => {
  //      var body = JSON.parse(body1);

  //     if (err1 || body.status_code != 200) {        
  //       console.error(err1);
  //       res.status(400).json({
  //         success: false,
  //         errors: {},
  //         message: 'Error making request. Please try again later.'
  //       });
      } else {
        // console.log('resp1: '+body1);
        // console.log("attempting request #2");
        // var parentId = findParentCity(body.data.places);
        // console.log('parentId: '+parentId);
        var reply = request.get({
          url: `${SYGIC_URL}/list?query=${req.query.place}&categories=${req.query.categoryIds}&limit=20`,
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
    // }); //
  // }
});

module.exports = router;
