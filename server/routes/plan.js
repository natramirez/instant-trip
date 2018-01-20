const express = require('express');
const request = require('request');
const geoTz = require('geo-tz');
const moment = require('moment');
const async = require('async');

// const config = require('../../config');
const router = new express.Router();

// put in config file later
// var FOURSQUARE_CLIENT_ID = 'SWOOTN5A35KI1S3SPDOK30AFIBPVF1O502JOVJ0FAHPQQ3FA';
// var FOURSQUARE_CLIENT_SECRET = 'V5AXGCJ120UN4LAILUOZ0XZZTG0JNXKIVRGCHQODJ1RELZIS';
// var FOURSQUARE_VERSIONING =  '20180201';
// var FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';

var SYGIC_URL = 'https://api.sygictravelapi.com/1.0/en/places/';
var SYGIC_OPT_URL = 'https://optimization.api.sygic.com/v0/api/optimization?key='
var SYGIC_MAPS_KEY = '2GfhK6NKpYTWWs49EgF5wpnMS';
var SYGIC_KEY = 'EC6mGz7Pmv4Ora08FjLze3utwMvd95QpabXIijYH';

var MAX_WAIT_TIME = '00:05:00'; //max wait time user waitsupon arrival before place opens:  5 minutes
var AVG_DURATION_TIME = '01:00:00'; //avg time spent at each place

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
    // console.log("body parents: " + JSON.stringify(body.data.places.parent_ids));
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
    // });
  // }
});

// function getTimeZone(lat, lng) {
//   return geoTz.tz(lat, lng); // e.g. 'America/Los_Angeles'
// }

function convertFormat(time) {//always keep in utc
  return moment(time).toISOString().replace(/\.\d+Z/,'Z');
}

function convertSecondsToHoursFormat(duration) {
  var date = new Date(null);
  date.setSeconds(duration);
  var result = date.toISOString().substr(11, 8); //HH:mmm:ss
  return result;
}

function makeHoursFormatFromHours(hours, str) {
  return hours.toString() + ':00:00';
}

function setMinutesInHoursFormat(mins, str) {
return str.substr(0,3) + mins.toString();
}


function convertAvailabilityTimeToDate(time, date) {
  var hour = moment(time).hours();
  var min = moment(time).minutes();
  return moment(date).hours(hour).minutes(min).toString();
}
const days = ['Daily','Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const amPm = ['am','pm'];

function parseOpeningHoursToArray(string) {
var arr = string.split(/(:|\t|\n|\r|\s|↵)\W*/);
var openingHours = 
[{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}},
{open:{hours:"",minutes:""},close:{hours:"",minutes:""}}];
var lastIsNum = false;
var isDaily = false;
var curStartDay = 0; //current day range start
var curEndDay = 0; //current day range end
var prevIsDayOfWeek = false; //last elem was day of week
var isOpenTime = true; //next number will be open time
  // arr.forEach(function(elem) {
  for (var i = 0; i < arr.length; i++) {
      var elem = arr[i];
    
    if (days.includes(elem)) {
      console.log("here1")

      if (elem == 'Daily') {
        isDaily = true;
      } else {
        if (prevIsDayOfWeek) {
          curEndDay = elem;
        } else {
          curStartDay = elem; //index of
        }
      }
      if (!isOpenTime) {
        isOpenTime = true;
      }
    } else if (!isNaN(elem)) { //if is number
      console.log("here2")
      if (prevIsDayOfWeek) {
        prevIsDayOfWeek = false;
      }
      if (lastIsNum) { //minutes
        lastIsNum = false;
        if (isDaily) {
          openingHours.forEach(function(day) {
            if (isOpenTime) {
              day.open.minutes = elem;
              isOpenTime = false;
            } else {
              day.close.minutes = elem;
            } 
          });
        } else if (curEndDay != 0) {
            var index = curStartDay;
            while (index <= curEndDay) {
              if (isOpenTime) {
                openingHours[index].open.minutes = elem;
              } else {
                openingHours[index].close.minutes = elem;
              }
              index++;
            }
        } else {
          if (isOpenTime) {
            openingHours[curStartDay].open.minutes = elem;
          } else {
            openingHours[curStartDay].close.minutes = elem;            
          }
        }
      } else { //hours
        lastIsNum = true;
        if (isDaily) {
          openingHours.forEach(function(day) {
            if (isOpenTime) {
              day.open.hours = elem;
              day.open.minutes = '00';
            } else {
              day.close.hours = elem;
              day.close.minutes = '00';
            }
          });
        } else if (curEndDay != 0) {
            var index = curStartDay;
            while (index <= curEndDay) {
              if (isOpenTime) {
                openingHours[index].open.hours = elem;
              } else {
                openingHours[index].close.hours = elem;
              }
              index++;
            }
        } else {
          if (isOpenTime) {
            openingHours[curStartDay].open.hours = elem;
            openingHours[curStartDay].open.minutes = '00';
          } else {
            openingHours[curStartDay].close.hours = elem;   
            openingHours[curStartDay].close.minutes = '00';
          }
        }
      }
    } else if (amPm.includes(elem)) {
      console.log("here3")

      if (elem == 'pm') {
        if (curEndDay != 0) {
          var index = curStartDay;
          while (index <= curEndDay) {
            if (isOpenTime) {
              openingHours[index].open.hours = openingHours[index].open.hours + 12;
            } else {
              openingHours[index].close.hours = openingHours[index].close.hours + 12;
            }
            index++;
          }
        } else {
          if (isOpenTime) {
            openingHours[curStartDay].open.hours = openingHours[curStartDay].open.hours + 12;
          } else {
            openingHours[curStartDay].close.hours = openingHours[curStartDay].close.hours + 12;
          }
        }
      }
      if (isOpenTime) {
        isOpenTime = false;
      } else {
        curEndDay = 0;
      }
      if (lastIsNum) {
        lastIsNum = false;
      }
    } else {
      console.log("here4")

      return 0;
    }
  }
  // });
  return openingHours;
}

function getLocationsArray(start, selected, end, date) {
  var dayOfWeek = moment(date).utc().day() + 1; //Sun=1 - Sat=7
  var waypts = [];
  waypts.push({
    location_id: 'start',
    coordinates: start.lat+","+start.lng
  });
  if (selected && selected.length > 0) {
    var index = 0;
    selected.forEach(function(place) {
    // console.log("place opening hours: " + place.opening_hours);
    // if (place.response.data.place.opening_hours) {
    //   console.log("place opening hours: " + place.response.data.place.opening_hours);
    //   var openingHoursArr = parseOpeningHoursToArray(place.response.data.place.opening_hours);
    //   console.log(JSON.stringify(openingHoursArr));
    //   if (openingHoursArr != 0) {
    //     var openHours = openingHoursArr[dayOfWeek].open.hours;
    //     var openMins = openingHoursArr[dayOfWeek].open.minutes;
    //     var closeHours = openingHoursArr[dayOfWeek].open.hours;
    //     var closeMins = openingHoursArr[dayOfWeek].open.minutes;
  
    //     var openingHours = moment(date).hours(openHours);
    //     openingHours = moment(date).minutes(openMins);
    //     var closingHours = moment(date).hours(closeHours);
    //     closingHours = moment(date).minutes(closeMins);
  
    //     // get place opening hours if defined
    //     // using date, set the availability start and end times to the corresponding
    //     //(check day of week of date and match to parse return array) hours and minutes
    //     //
    //     // var start = convertAvailabilityTimeToDate(place.opening_hours)
    //     waypts.push({
    //       location_id: 'stop'+index.toString(),
    //       coordinates: place.response.data.place.location.lat+","+place.response.data.place.location.lng, //error handling?
    //       availability: {earliest_start: openingHours, latest_end: closingHours} //Transform as needed, format: 2017-03-02T08:00:00Z; earliest_start, latest_end //what if no hours of op?
    //     });
    //   } else {
    //     waypts.push({
    //       location_id: 'stop'+index.toString(),
    //       coordinates: place.response.data.place.location.lat+","+place.response.data.place.location.lng, //error handling?
    //     });
    //   }
    // } else {
      waypts.push({
        location_id: 'stop'+index.toString(),
        coordinates: place.response.data.place.location.lat+","+place.response.data.place.location.lng, //error handling?
      });
    // }
    // var locationId = 'stop'+index.toString();
    index++;
    });
  }
  waypts.push({
    location_id: 'end',
    coordinates: end.lat+","+end.lng
  });
  console.log('waypts'+JSON.stringify(waypts));
  return waypts;
}

function getTasksArray(selected) {
  var tasks = [];
  // console.log("selected: " + selected);
  // console.log("selected: " + selected.length);
  if (selected && selected.length > 0) {
    var numPlaces = selected.length;

    var index = 0;
    selected.forEach(function(place) {
      console.log("place opening hours: " + place.response.data.place.opening_hours);
      // var locationId = 'stop'+index.toString();
      var serviceTime = AVG_DURATION_TIME;
      if (place.response.data.place.duration) {
        serviceTime = convertSecondsToHoursFormat(place.response.data.place.duration);
      }
      var priority;
      switch (index % 4 ) {
        case 0:
          priority = 'critical';
          break;
        case 1:
          priority = 'high';
          break;
        case 2:
          priority = 'normal';
          break;
        case 3:
          priority = 'low';
          break;
      }
      tasks.push({
        'task_id':'task'+index.toString(),
        'priority': priority,
        'activities':[
          {
            'activity_type': 'visit',
            'location_id': 'stop'+index.toString(),
            'service_time': serviceTime
          }
        ],
      });
      index++;
    });
  }
  console.log('tasks'+JSON.stringify(tasks));

  return tasks;
}

router.get('/place-details', function(req, res) {
  var id = req.query.id;
  var reply = request.get({
    url: `${SYGIC_URL}/${id}`,
    headers: {'x-api-key': SYGIC_KEY}
  },
  (err, response, body) => {
    var body = JSON.parse(body);
    if (err || response.statusCode != 200 || body.status_code != 200) {
      console.log('error occurred: ' + err);
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
});
function matchLocationPlaceNames(selected, locationsArr) {
  // console.log('\nselected at matchLocation:\n'+ JSON.stringify(selected));
  var matchDict = {};
  for (var i = 0; i < locationsArr.length; i++) {
    if (i == 0 || i == locationsArr.length-1) {
      continue;
    } else {
        // console.log('\nselected[i] at matchLocation:\n'+ JSON.stringify(selected[i-1]));

      matchDict[locationsArr[i].location_id] = selected[i-1].response.data.place.name;
    }
  }
  return matchDict;
}
// function getPlaceDetails(id) {
//   var reply = request.get({
//     url: `${SYGIC_URL}/${id}`,
//     headers: {'x-api-key': SYGIC_KEY}
//   },
//   (err, response, body) => {
//     var body = JSON.parse(body);
//     if (err2 || response.statusCode != 200 || body.status_code != 200) {
//       console.log('error occurred: ' + err);
//       res.status(400).json({
//         success: false,
//         errors: {},
//         message: 'Error making request. Please try again later.'
//       });
//     } else {
//       res.status(200).json({
//         success: true,
//         response: body
//       });
//     }
//   });
// }

router.post('/itinerary', function(req, res) {
  console.log(req.body);
  var body = req.body;
  
  // const validationResult = validateTripForm(req.query);
  
  // if (!validationResult.success) {
  //   res.status(400).json({
  //     success: false,
  //     message: validationResult.message,
  //     errors: validationResult.errors
  //   });
  // } else {

    var selected = body.selected;

    //  convert times to format: 2017-03-02T08:00:00Z
    console.log('oldStartDate: '+body.startDate);
    var startDate = moment(body.startDate).utc().format();
    console.log('newStartDate: '+startDate);
    
    console.log('oldEndDate: '+body.endDate);
    var endDate = moment(body.endDate).utc().format();
    console.log('newEndDate: '+endDate);

    console.log('oldDayStartTime: '+body.dailyStartTime);
    console.log('oldDayEndTime: '+body.dailyEndTime);


    var startPoint = body.accommodation;
    var endPoint = body.accommodation;
  
    var numDays = Math.abs(moment(startDate).diff(moment(endDate), 'days'))+1;
    console.log("numDays: " + numDays);

    var daysArray = [];
    var curDate = startDate;
    for (var i = 0; i < numDays; i++) {
      daysArray.push({'date':curDate});
      curDate = convertFormat(moment(curDate).add(1,'days'));
    }
    console.log("daysArray: " + daysArray);

    var locationNames;

    async.map(daysArray, function(curDay, callback) {
      var curDate = curDay.date;

      var startTime = moment(curDate).utc().set({
        'hour' : moment(body.dailyStartTime).utc().hour(),
        'minute' : moment(body.dailyStartTime).utc().minute()
      });
      var endTime = moment(curDate).utc().set({
        'hour' : moment(body.dailyEndTime).utc().hour(),
        'minute' : moment(body.dailyEndTime).utc().minute()
      });

      console.log("startTime: " + startTime.format());
      console.log("endTime: " + endTime.format());

      var locationsArray = getLocationsArray(startPoint, selected, endPoint, curDate);
      locationNames = matchLocationPlaceNames(selected, locationsArray);

      var formData = {
        settings:{
          max_wait_time: MAX_WAIT_TIME
        },
        locations: locationsArray,
        vehicles: [
          {
              "vehicle_id": "vehicle",
              "cost_per_km": 1,
              "cost_per_hour": 1,
              "fixed_cost": 5,
              "start_location_id": "start",
              "end_location_id": "end",
              "availability": {
                  "earliest_start": startTime,
                  "latest_end": endTime
              }
          }
        ],
        tasks: getTasksArray(selected)
      };
      var reply = request.post({
        url: `${SYGIC_OPT_URL}${SYGIC_MAPS_KEY}`,
        json: formData
      },
      (err2, response2, body2) => {
        // var body = JSON.parse(body2);
        var body = body2;
        if (err2 || response2.statusCode != 202) {
          console.log("full response: " + response2);
          console.log("response2.statusCode: " + response2.statusCode);
          if (body.status != 'OK') {
            console.log("not OK");
            console.log("full header: " + JSON.stringify(response2.headers));

            console.log("header status: " + response2.status);
            console.log("state" + body.state);
            console.log("location" + response2.location);
            if (body.error) {
              // check for error field with code and message subfields in body

              console.log("error code: "+body.error.code);
              console.log("error message: "+body.error.message);
            }
          }
          console.log('error occurred: ' + err2);
          res.status(400).json({
            success: false,
            errors: {},
            message: 'Error making request. Please try again later.'
          });
        } else {
          callback(null,response2.headers.location);
        }
      });
    }, function(err, urlResultsArr) {
      if (err) {
        console.log('error making place details array');
        res.status(400).json({
            success: false,
            errors: {},
            message: 'Error making request. Please try again later.'
          });
      } else {
        console.log("completed url results: "+JSON.stringify(urlResultsArr));

        async.map(urlResultsArr, function(url, callback) {
          // var details = this.getPlaceDetails(place.id);
          // selected.push(details.data.place);
          var intervalId = setInterval(function() {
            var reply = request.get({
              url: url
            },
            (err2, response2, body2) => {
              // var body = JSON.parse(body2);
              var body = JSON.parse(body2);
              if (err2 || response2.statusCode != 200 || body.state == 'Failed') {
                console.log("full response: " + response2);
                console.log("response2.statusCode: " + response2.statusCode);
                console.log("body.state: " + body.state);
                console.log('error occurred: ' + err2);
                
                clearInterval(intervalId);

                res.status(400).json({
                  success: false,
                  errors: {},
                  message: 'Error making request. Please try again later.'
                });
              } else if (body.status == 'OK') {
                clearInterval(intervalId);
                callback(null,body);
              }
            });
          }, 1000);
          
        }, function(err, results) {
          if (err) {
            console.log('error making trip results array');
          }
          console.log("completed full results:\n "+JSON.stringify(results));
          
          // make results into events format and return
          var eventsArr = [];

          for (var i = 0; i < results.length; i++) {
            var activities = results[i].plan[0].activities;
            var prevDuration = 0;
            for (var j = 0; j < activities.length; j++) {
              if (j == 0 || j == activities.length-1) {
                continue;
              }
              var activity = activities[j];
              var name = locationNames[activity.location_id];
              var startTime = moment(activity.timestamp).utc();
              var duration = moment.duration(activity.service_duration);
              var endTime = moment(activity.timestamp).add(duration).utc();

              console.log("startTime down here:\n "+ startTime.format());
              console.log("endTime down here:\n "+ endTime.format());

              var startJsDate = convertJsDateToUTC(new Date(startTime.toDate()));
              var endJsDate = convertJsDateToUTC(new Date(endTime.toDate()));

              console.log("startJsDate: " + startJsDate);
              console.log("endJsDate: " + endJsDate);


              eventsArr.push(makeEventObject(name, startTime, endTime));
            }
          }
          res.status(200).json({
            success: true,
            response: eventsArr
          });
        });
      }  
    });
  });

  function convertJsDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }
  function makeEventObject(title, starttime, endtime) {
    return {title:title, start: starttime, end: endtime};
  }
// });

module.exports = router;
