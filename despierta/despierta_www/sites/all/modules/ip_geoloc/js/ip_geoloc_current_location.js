(function ($) {

function ip_geoloc_getCurrentPosition(callbackUrl, reverseGeocode, refreshPage) {
  $('#loading p').html("Localizando...");

  if (typeof(getCurrentPositionCalled) !== 'undefined') {
    // Been here, done that (can happen in AJAX context).
    return;
  }

  if (navigator.geolocation) {
    var startTime = (new Date()).getTime();
    navigator.geolocation.getCurrentPosition(getLocation, handleLocationError, {enableHighAccuracy: true, timeout: 20000});
    getCurrentPositionCalled = true;
  }
  else {
    var data = new Object;
    data['error'] = Drupal.t('IPGV&M: device does not support W3C API.');

    despiertaGeoError();

    callbackServer(callbackUrl, data, false);
  }


  // DESPIERTA Functions:
  // Extract URL path
  function getUrlPaths() {
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars[hash[0]] = decodeURIComponent( hash[1] );
    }
    var paths = (vars !== undefined && vars['q'] !== undefined && vars['q'] !== "") ? vars['q'].split('/') : [];
    return paths;
  }
  // Redirect region location
  function createRegionURL(url) {
    var location = '';
    if ( url !== undefined && url.length > 0 && ( url[0] === 'home' || url[0] === 'directorio-verde' ) ) {
      var pcode = sessionStorage['code'];
      var rcode = sessionStorage['area_code'];
      var dcode = '';
      if ( url[0] === 'home' ) {
        dcode = 'all';
      }
      else if ( url[0] === 'directorio-verde' ) {
        dcode = (url.length >= 4 && url[3] !== undefined && url[3] !== null && url[3] !== "" ) ? url[3] : '';
      }
      location = '?q=' + url[0] + '/' + pcode + '/'+ rcode + '/' + dcode;
    }
    return location;
  }
  // geo Error
  function despiertaGeoError() {
    sessionStorage['geolocation'] = false;
    sessionStorage.setItem('geolocation', false);
  }
  // geo Position
  function despiertaGeoSession(geoloc) {
    if ( geoloc.country !== undefined && geoloc.country_code !== undefined && geoloc.locality !== undefined && geoloc.administrative_area_level_1 !== undefined && geoloc.administrative_area_level_2 !== undefined ) {
      // Convert Dspierta geoloc from Geocode values
      sessionStorage['geolocation'] = true;
      sessionStorage.setItem('geolocation', true);
      sessionStorage['country'] = geoloc['country'];
      sessionStorage['code'] = geoloc['country_code'].toLowerCase();
      sessionStorage['locality'] = geoloc['locality'];
      sessionStorage['area'] = geoloc['administrative_area_level_2'];
      sessionStorage['area_code'] = geoloc['administrative_area_level_2_code'].toLowerCase();
      sessionStorage['latitude'] = geoloc['latitude'];
      sessionStorage['longitude'] = geoloc['longitude'];
      sessionStorage['formatted_address'] = geoloc['formatted_address'];

      // Redirect region location
      var urlPaths = getUrlPaths();
      window.location.href = createRegionURL(urlPaths);
    }
    else {
      sessionStorage['geolocation'] = false;
      sessionStorage.setItem('geolocation', false);
    }
  }

  function getLocation(position) {
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

        // Create Client session for Despierta
        despiertaGeoSession(ip_geoloc_address);
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

  function handleLocationError(error) {
    var data = new Object;
    data['error'] = Drupal.t('getCurrentPosition() returned error !code: !text. Browser: @browser',
      {'!code': error.code, '!text': error.message, '@browser': navigator.userAgent});

    // Create Client session for Despierta
    despiertaGeoError();

    // Pass error back to PHP rather than alert();
    callbackServer(callbackUrl, data, false);
  }

  function callbackServer(callbackUrl, data, refresh_page) {
    // For drupal.org/project/js module, if enabled.
    data['js_module'] = 'ip_geoloc';
    data['js_callback'] = 'current_location';

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
}

  Drupal.behaviors.addCurrentLocation = {
    attach: function (context, settings) {
      if (
        sessionStorage === undefined || sessionStorage === null || 
        sessionStorage.getItem('geolocation') === undefined || sessionStorage['geolocation'] === undefined || 
        sessionStorage.getItem('geolocation') === null || sessionStorage['geolocation'] === null || 
        sessionStorage.getItem('geolocation') !== "local" || sessionStorage['geolocation'] !== "local"
      ) {
          ip_geoloc_getCurrentPosition(
            settings.ip_geoloc_menu_callback,
            settings.ip_geoloc_reverse_geocode,
            settings.ip_geoloc_refresh_page
          );
      }
    }
  }

})(jQuery);
