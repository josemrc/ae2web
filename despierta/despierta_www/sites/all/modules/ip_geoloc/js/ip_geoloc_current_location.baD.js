(function ($) {

  Drupal.theme.prototype.getLocation = function (position) {
  // function getLocation(position) {
console.log("getLocation");
console.log(position);
    if ( position === undefined ) {
      handleLocationError("position is not defined");
    }
    if (window.console && window.console.log) { // Does not work on IE8
      var elapsedTime = (new Date()).getTime() - startTime;
      window.console.log(Drupal.t('!time s to locate visitor', { '!time' : elapsedTime/1000 }));
    }
    var ip_geoloc_address = new Object;
    ip_geoloc_address['latitude']  = position.coords.latitude;
    ip_geoloc_address['longitude'] = position.coords.longitude;
    ip_geoloc_address['accuracy']  = position.coords.accuracy;

    if (!reverseGeocode) {
      // Pass lat/long back to Drupal without street address.
      callbackServer(callbackUrl, ip_geoloc_address, refreshPage);
      return;
    }
    // Reverse-geocoding of lat/lon requested.
    startTime = (new Date()).getTime();
    var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    new google.maps.Geocoder().geocode({'latLng': location }, function(response, status) {

      if (status === google.maps.GeocoderStatus.OK) {
        var google_address = response[0];
        ip_geoloc_address['formatted_address'] = google_address.formatted_address;
        for (var i = 0; i < google_address.address_components.length; i++) {
          var component = google_address.address_components[i];
          if (component.long_name !== null) {
            var type = component.types[0];
            ip_geoloc_address[type] = component.long_name;
            if (type === 'administrative_area_level_2' && component.short_name !== null) {
              ip_geoloc_address['administrative_area_level_2_code'] = component.short_name;
            }            
            if (type === 'country' && component.short_name !== null) {
              ip_geoloc_address['country_code'] = component.short_name;
            }
          }
        }
      }
      else {
        var error = ''; // from response or status?
        if (window.console && window.console.log) {
          window.console.log(Drupal.t('IPGV&M: Google Geocoder returned error !code.', { '!code': status }));
        }
        ip_geoloc_address['error'] = Drupal.t('getLocation(): Google Geocoder address lookup failed with status code !code. @error', { '!code': status, '@error': error });
        refreshPage = false;
      }
      if (window.console && window.console.log) {
        var elapsedTime = (new Date()).getTime() - startTime;
        window.console.log(Drupal.t('!time s to reverse-geocode to address', { '!time' : elapsedTime/1000 }));
      }

      // Pass lat/long, accuracy and address back to Drupal
      callbackServer(callbackUrl, ip_geoloc_address, refreshPage);
    });
  }

  Drupal.theme.prototype.handleLocationError = function (error) {
  // function handleLocationError(error) {
console.log("handleLocationError");
    var data = new Object;
    data['error'] = Drupal.t('getCurrentPosition() returned error !code: !text. Browser: @browser',
      {'!code': error.code, '!text': error.message, '@browser': navigator.userAgent});
    // Pass error back to PHP rather than alert();
    callbackServer(callbackUrl, data, false);
  }

  Drupal.theme.prototype.callbackServer = function (callbackUrl, data, refresh_page) {
  // function callbackServer(callbackUrl, data, refresh_page) {
    // For drupal.org/project/js module, if enabled.
    data['js_module'] = 'ip_geoloc';
    data['js_callback'] = 'current_location';

console.log("callbackServer");
console.log(refresh_page);
console.log(data);

    jQuery.ajax({
      url: callbackUrl,
      type: 'POST',
      dataType: 'json',
      data: data,
      success: function (serverData, textStatus, http) {
        if (window.console && window.console.log) {
          if (serverData && serverData.messages && serverData.messages['status']) {
            // When JS module is used, it collects msgs via drupal_get_messages().
            var messages = serverData.messages['status'].toString();
            // Remove any HTML markup.
            var msg = Drupal.t('From server, via JS: ') + jQuery('<p>' + messages + '</p>').text();
          }
          else {
            //var msg = Drupal.t('Server confirmed with: @status', { '@status': textStatus });
          }
          if (msg) window.console.log(msg);
        }
        if (refresh_page) {
          window.location.reload();
        }
      },
      error: function (http, textStatus, error) {
        // 404 may happen intermittently and when Clean URLs isn't enabled
        // 503 may happen intermittently, see [#2158847]
        var msg = Drupal.t('IPGV&M, ip_geoloc_current_location.js @status: @error (@code)', { '@status': textStatus, '@error': error, '@code': http.status });
        if (window.console && window.console.log) {
          window.console.log(msg);
        }
        if (http.status > 0 && http.status !== 200 && http.status !== 404 && http.status !== 503) {
          alert(msg);
        }
      },
      complete: function(http, textStatus) {
        window.console.log(Drupal.t('AJAX call completed with @status', { '@status': textStatus }));
      }
    });
  }

  Drupal.theme.prototype.getPosition = function (callbackUrl, reverseGeocode, refreshPage) {

  console.log("ip_geoloc_getCurrentPosition");
    if (typeof(getCurrentPositionCalled) !== 'undefined') {
  console.log("Been here, done that (can happen in AJAX context).");
      // Been here, done that (can happen in AJAX context).
      return;
    }

    if (navigator.geolocation) {
  console.log("navigator.geolocation");
      var startTime = (new Date()).getTime();
      navigator.geolocation.getCurrentPosition(Drupal.theme.prototype.getLocation, Drupal.theme.prototype.handleLocationError, {enableHighAccuracy: true, timeout: 20000, maximumAge: 0});
      getCurrentPositionCalled = true;
    }
    else {
  console.log("navigator.geolocation else");
      var data = new Object;
      data['error'] = Drupal.t('IPGV&M: device does not support W3C API.');
      callbackServer(callbackUrl, data, false);
    }
  }


  Drupal.behaviors.addCurrentLocation = {
    attach: function (context, settings) {

console.log("addCurrentLocation");
console.log(context);
console.log(settings);
  var callbackUrl = settings.ip_geoloc_menu_callback;
  var reverseGeocode = settings.ip_geoloc_reverse_geocode;
  var refreshPage = settings.ip_geoloc_refresh_page;

Drupal.theme.prototype.getPosition(callbackUrl, reverseGeocode, refreshPage);

// console.log("ip_geoloc_getCurrentPosition");
//   if (typeof(getCurrentPositionCalled) !== 'undefined') {
// console.log("Been here, done that (can happen in AJAX context).");
//     // Been here, done that (can happen in AJAX context).
//     return;
//   }

//   if (navigator.geolocation) {
// console.log("navigator.geolocation");
//     var startTime = (new Date()).getTime();
//     navigator.geolocation.getCurrentPosition(Drupal.theme.prototype.getLocation, Drupal.theme.prototypehandleLocationError, {enableHighAccuracy: true, timeout: 20000});
//     // navigator.geolocation.getCurrentPosition(getLocation, handleLocationError);
//     getCurrentPositionCalled = true;
//   }
//   else {
// console.log("navigator.geolocation else");
//     var data = new Object;
//     data['error'] = Drupal.t('IPGV&M: device does not support W3C API.');
//     callbackServer(callbackUrl, data, false);
//   }

  //   if ( navigator.userAgent.toLowerCase().indexOf("firefox") >= 0 ) {
  // console.log("ip_geoloc_getCurrentPosition OUT: "+navigator.userAgent);
  //     var data = new Object;
  //     data['error'] = Drupal.t('Mozilla problems');
  //     // callbackServer(callbackUrl, data, true);
  //     getLocation();    
  //   }  

      // ip_geoloc_getCurrentPosition(
      //   settings.ip_geoloc_menu_callback,
      //   settings.ip_geoloc_reverse_geocode,
      //   settings.ip_geoloc_refresh_page
      // );
    }
  }

})(jQuery);

// function ip_geoloc_getCurrentPosition(callbackUrl, reverseGeocode, refreshPage) {

// console.log("ip_geoloc_getCurrentPosition");
//   if (typeof(getCurrentPositionCalled) !== 'undefined') {
// console.log("Been here, done that (can happen in AJAX context).");
//     // Been here, done that (can happen in AJAX context).
//     return;
//   }

//   if (navigator.geolocation) {
// console.log("navigator.geolocation");
//     var startTime = (new Date()).getTime();
//     navigator.geolocation.getCurrentPosition(getLocation, handleLocationError, {enableHighAccuracy: true, timeout: 20000});
//     getCurrentPositionCalled = true;
//   }
//   else {
// console.log("navigator.geolocation else");
//     var data = new Object;
//     data['error'] = Drupal.t('IPGV&M: device does not support W3C API.');
//     callbackServer(callbackUrl, data, false);
//   }

//   function getLocation(position) {
// console.log("getLocation");
//     if (window.console && window.console.log) { // Does not work on IE8
//       var elapsedTime = (new Date()).getTime() - startTime;
//       window.console.log(Drupal.t('!time s to locate visitor', { '!time' : elapsedTime/1000 }));
//     }
//     var ip_geoloc_address = new Object;
//     ip_geoloc_address['latitude']  = position.coords.latitude;
//     ip_geoloc_address['longitude'] = position.coords.longitude;
//     ip_geoloc_address['accuracy']  = position.coords.accuracy;

//     if (!reverseGeocode) {
//       // Pass lat/long back to Drupal without street address.
//       callbackServer(callbackUrl, ip_geoloc_address, refreshPage);
//       return;
//     }
//     // Reverse-geocoding of lat/lon requested.
//     startTime = (new Date()).getTime();
//     var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//     new google.maps.Geocoder().geocode({'latLng': location }, function(response, status) {

//       if (status === google.maps.GeocoderStatus.OK) {
//         var google_address = response[0];
//         ip_geoloc_address['formatted_address'] = google_address.formatted_address;
//         for (var i = 0; i < google_address.address_components.length; i++) {
//           var component = google_address.address_components[i];
//           if (component.long_name !== null) {
//             var type = component.types[0];
//             ip_geoloc_address[type] = component.long_name;
//             if (type === 'administrative_area_level_2' && component.short_name !== null) {
//               ip_geoloc_address['administrative_area_level_2_code'] = component.short_name;
//             }            
//             if (type === 'country' && component.short_name !== null) {
//               ip_geoloc_address['country_code'] = component.short_name;
//             }
//           }
//         }
//       }
//       else {
//         var error = ''; // from response or status?
//         if (window.console && window.console.log) {
//           window.console.log(Drupal.t('IPGV&M: Google Geocoder returned error !code.', { '!code': status }));
//         }
//         ip_geoloc_address['error'] = Drupal.t('getLocation(): Google Geocoder address lookup failed with status code !code. @error', { '!code': status, '@error': error });
//         refreshPage = false;
//       }
//       if (window.console && window.console.log) {
//         var elapsedTime = (new Date()).getTime() - startTime;
//         window.console.log(Drupal.t('!time s to reverse-geocode to address', { '!time' : elapsedTime/1000 }));
//       }

//       // Pass lat/long, accuracy and address back to Drupal
//       callbackServer(callbackUrl, ip_geoloc_address, refreshPage);
//     });
//   }

//   function handleLocationError(error) {
// console.log("handleLocationError");
//     var data = new Object;
//     data['error'] = Drupal.t('getCurrentPosition() returned error !code: !text. Browser: @browser',
//       {'!code': error.code, '!text': error.message, '@browser': navigator.userAgent});
//     // Pass error back to PHP rather than alert();
//     callbackServer(callbackUrl, data, false);
//   }

//   function callbackServer(callbackUrl, data, refresh_page) {
//     // For drupal.org/project/js module, if enabled.
//     data['js_module'] = 'ip_geoloc';
//     data['js_callback'] = 'current_location';

// console.log("callbackServer");
// console.log(refresh_page);
// console.log(data);

//     jQuery.ajax({
//       url: callbackUrl,
//       type: 'POST',
//       dataType: 'json',
//       data: data,
//       success: function (serverData, textStatus, http) {
//         if (window.console && window.console.log) {
//           if (serverData && serverData.messages && serverData.messages['status']) {
//             // When JS module is used, it collects msgs via drupal_get_messages().
//             var messages = serverData.messages['status'].toString();
//             // Remove any HTML markup.
//             var msg = Drupal.t('From server, via JS: ') + jQuery('<p>' + messages + '</p>').text();
//           }
//           else {
//             //var msg = Drupal.t('Server confirmed with: @status', { '@status': textStatus });
//           }
//           if (msg) window.console.log(msg);
//         }
//         if (refresh_page) {
//           window.location.reload();
//         }
//       },
//       error: function (http, textStatus, error) {
//         // 404 may happen intermittently and when Clean URLs isn't enabled
//         // 503 may happen intermittently, see [#2158847]
//         var msg = Drupal.t('IPGV&M, ip_geoloc_current_location.js @status: @error (@code)', { '@status': textStatus, '@error': error, '@code': http.status });
//         if (window.console && window.console.log) {
//           window.console.log(msg);
//         }
//         if (http.status > 0 && http.status !== 200 && http.status !== 404 && http.status !== 503) {
//           alert(msg);
//         }
//       },
//       complete: function(http, textStatus) {
//         window.console.log(Drupal.t('AJAX call completed with @status', { '@status': textStatus }));
//       }
//     });
//   }
// }
