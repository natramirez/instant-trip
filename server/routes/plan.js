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
var MAPBOX_URL = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/';
var MAPBOX_ROUNDTRIP_PARAMS = '?source=first&destination=last&roundtrip=true';
var MAPBOX_KEY = '&access_token=pk.eyJ1IjoibmF0cmFtaXJleiIsImEiOiJjamlybHg2dWMwa2I4M2twaWlvcnlhYWw4In0.8De8ngC-F5BVcCDjvTcDig';

// var MAX_WAIT_TIME = '00:05:00'; //max wait time user waitsupon arrival before place opens:  5 minutes
var AVG_DURATION_TIME = '3600'; //avg time spent at each place (seconds)

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

function getCoordinates(start, selected, end) {
  // var dayOfWeek = moment(date).utc().day() + 1; //Sun=1 - Sat=7
  var waypts = "";
  waypts = waypts.concat(start.lng.toFixed(6)+","+start.lat.toFixed(6)+";");
  if (selected && selected.length > 0) {
    selected.forEach(function(place) {
    waypts = waypts.concat(place.response.data.place.location.lng.toFixed(6)+","+place.response.data.place.location.lat.toFixed(6)+";");
    });
  }
  waypts = waypts.substring(0,waypts.length-1);
  // waypts = waypts.concat(end.lng+","+end.lat);
  console.log('waypts: '+JSON.stringify(waypts));
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
  console.log('tasks: '+JSON.stringify(tasks));

  return tasks;
}

// Get the details of a specific place.
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

function makeLocationDict(selected, coordinates) {
  // console.log('\nselected at matchLocation:\n'+ JSON.stringify(selected));
  var matchDict = {};
  var locationsArr = coordinates.split(';');
  console.log('locationsArr length: ' + locationsArr.length);
  for (var i = 0; i < locationsArr.length; i++) {
    if (i == 0) {
    // if (i == 0 || i == locationsArr.length-1) {
      continue;
    } else {
        // console.log('\nselected[i] at matchLocation:\n'+ JSON.stringify(selected[i-1]));
      var duration = selected[i-1].response.data.place.duration;
      if (!duration) {
        duration = AVG_DURATION_TIME;
      }
      matchDict[locationsArr[i]] = {
        name: selected[i-1].response.data.place.name, 
        duration: duration
      };
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
function matchCoordinate(coord, coordsDict) {
  var closest = {key: null, diff: null};
  var c, key, diff;
  for (key in coordsDict) {
    c = key.split(",");
    c = c[0];
    c = parseFloat(c);
    diff = Math.abs(parseFloat(coord) - c);
    if (!closest.key || diff < closest.diff) {
        closest.key = key;
        closest.diff = diff;
    }
    // update this func to also compare 2nd coord?
  }
  console.log("closest: " + JSON.stringify(closest));
  return closest.key;
}

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

    // map each date with an optimized route of POIs for itinerary
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

      var coordinatesList = getCoordinates(startPoint, selected, endPoint);
      locationNames = makeLocationDict(selected, coordinatesList);
      console.log(locationNames);
      // create Optimization request
      var reply = request.get(`${MAPBOX_URL}${coordinatesList}${MAPBOX_ROUNDTRIP_PARAMS}${MAPBOX_KEY}`,
      (err2, response2, body2) => {
        var body = JSON.parse(body2);

        // var body = body2;
        if (err2 || response2.statusCode != 200 || body.code != "Ok") {
          console.log("full response: " + JSON.stringify(response2));
          console.log("body2: "+ body2);
          console.log("body2.code: "+ body2.code);

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
          // should call callback with err set to true and let callback handle error
          callback(true, null);
          // res.status(400).json({
          //   success: false,
          //   errors: {},
          //   message: 'Error making request. Please try again later.'
          // });
        } else {
          // if successful, callback is called. Data is now 'results'
          console.log()
          console.log("successful!")
          console.log()
          console.log("body.trips[0].legs : " + JSON.stringify(body.trips[0].legs));
          console.log("number of legs: " + body.trips[0].legs.length);
          console.log()
          body["startTime"] = startTime;
          body["endTime"] = endTime;
          console.log()
          console.log("body.startTime: " + body.startTime)
          console.log()
          console.log("body.endTime: " + body.endTime)
          console.log()
          callback(null, body);
        }
      });

    }, function(err, results) {
      if (err) {
        console.log('error making place details array');
        res.status(400).json({
            success: false,
            errors: {},
            message: 'Error making request. Please try again later.'
          });
      } else {
        // console.log("completed results: "+JSON.stringify(results));

        // make results into events format and return
        var eventsArr = [];
        var waypts = results[0].waypoints;
        waypts.sort(function (a, b) {
          return a.waypoint_index - b.waypoint_index;
        });
        console.log("waypts: " + waypts);
        // waypoints = [];
        var curTime = results[0].startTime;
        // console.log("results: " + JSON.stringify(results))
        console.log()
        console.log("results.startTime: " + results[0].startTime);
        console.log()

        // from accomodation to first POI:
        var legDuration = results[0].trips[0].legs[0].duration;
        curTime.add(legDuration, 's');
        console.log("curTime after leg "+ 0+": " + curTime.format());

        // fix time (currently all times are 1 hour before set time in UI)
        for (var i = 1; i < waypts.length; i++) {
          // indexing above omits first leg (hotel to first POI), and final leg (last POI to hotel)
          var coords = JSON.stringify(waypts[i].location)
          coords = coords.substring(1,coords.length-1);
          console.log("coords before: " + coords);
          coords = matchCoordinate(coords, locationNames);
          console.log("coords after: " + coords);
          console.log("location names: " + JSON.stringify(locationNames));
          var name = locationNames[coords].name;
          var placeDuration = locationNames[coords].duration;
          var startTime = moment(curTime).utc();
          curTime.add(placeDuration,'s');
          console.log("curTime after waypt "+ i+" duration: " + curTime.format());
          var endTime = moment(curTime).utc();
          eventsArr.push(makeEventObject(name, startTime, endTime));

          legDuration = results[0].trips[0].legs[i].duration;
          curTime.add(legDuration, 's');
          console.log("curTime after leg "+ i+": " + curTime.format());
        }
        console.log();
        console.log("events obj: " + JSON.stringify(eventsArr));
        console.log();
        // for (var i = 0; i < results.length; i++) {
        //   var activities = results[i].plan[0].activities;
        //   var prevDuration = 0;
        //   for (var j = 0; j < activities.length; j++) {
        //     if (j == 0 || j == activities.length-1) {
        //       continue;
        //     }
        //     var activity = activities[j];
        //     // var name = locationNames[activity.location_id];
        //     var startTime = moment(activity.timestamp).utc();
        //     var duration = moment.duration(activity.service_duration);
        //     var endTime = moment(activity.timestamp).add(duration).utc();

            

        //     var startJsDate = convertJsDateToUTC(new Date(startTime.toDate()));
        //     var endJsDate = convertJsDateToUTC(new Date(endTime.toDate()));

        //     console.log("startJsDate: " + startJsDate);
        //     console.log("endJsDate: " + endJsDate);


        //     eventsArr.push(makeEventObject(name, startTime, endTime));
        //   }
        // }
        res.status(200).json({
          success: true,
          response: eventsArr
        });
      // });
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
