(function ($) {

var allPaisRegionsObj;
var urlPaths = getUrlPaths();

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
// geo Error
// function despiertaGeoError(error) {

//   $('#sms_geoloc_nodespierta').modal('show');

//   sessionStorage['geolocation'] = false;
//   sessionStorage.setItem('geolocation', false);

//   // Finish loading
//   $('#loading').css('display', 'none');
//   // change the empty results when the geolocation is not working
//   if ( $('#block-views-sedes3-block .view-sedes3 > .view-empty').length > 0 ) {
//     var smsNoGeo = '<section class="no-resultados">'+
//                 '<div class="alert alert-warning" role="alert">'+
//                 'Actualmente no tiene activado la geolocalización, o su navegador no lo permite. '+
//                 'Le recomentamos que lo active, o en su defecto, '+
//                 'seleccione el país y regiones mediante las opciones del panel superior derecho en la web.'+
//                 '</div>'+
//               '</section>';
//     if ( error !== undefined && error.code === 3 && error.message === "Position acquisition timed out" ) {
//       var smsNoGeo = '<section class="no-resultados">'+
//                   '<div class="alert alert-warning" role="alert">'+
//                 'Problemas de geolocalización ajenos a la web. Se ha superado el tiempo de búsqueda localizando.'+
//                 'Si persiste el problema, localice sus sedes modificando el panel superior derecho en la web.'+
//                   '</div>'+
//                 '</section>';
//     }
//     $('#block-views-sedes3-block .view-sedes3 > .view-empty').html(smsNoGeo);
//   }
// }
// function despiertaGeoLocationError() {
//   $('#sms_geoloc_nodespierta').modal('show');

//   sessionStorage['geolocation'] = false;
//   sessionStorage.setItem('geolocation', false);

//   // Finish loading
//   $('#loading').css('display', 'none');
//   // change the empty results when the geolocation is not working
//   if ( $('#block-views-sedes3-block .view-sedes3 > .view-empty').length > 0 ) {
//     var smsNoGeo = '<section class="no-resultados">'+
//                 '<div class="alert alert-warning" role="alert">'+
//                 'Se encuentra geolocalización pero no existen sedes en su país o región. '+
//                 'Seleccione el país y regiones mediante las opciones del panel superior derecho en la web.'+
//                 '</div>'+
//               '</section>';
//     $('#block-views-sedes3-block .view-sedes3 > .view-empty').html(smsNoGeo);
//   }
// }
function despiertaGeoError() {
  var $paisHTML = Drupal.theme('paisSelectList', allPaisRegionsObj);
  $('#sms_geoloc_nodespierta .modal-body').prepend($paisHTML);

  var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj);
  $('#sms_geoloc_nodespierta .modal-body').append($regHTML);      

  $('#sms_geoloc_nodespierta').modal('show');

  sessionStorage['geolocation'] = "local";
  sessionStorage.setItem('geolocation', "local");

  // Finish loading
  $('#loading').css('display', 'none');
}
// geo Position
function despiertaGeoSession(geoloc) {
  var geolocation = "false";
  var allNamePaisRegionsObj = Drupal.theme.prototype.paisRegionesNameObj( $('#block-views-tax-regiones-block .view-tax-regiones') )
  if ( geoloc.country !== undefined && geoloc.country_code !== undefined && ( geoloc.locality !== undefined || geoloc.administrative_area_level_1 !== undefined || geoloc.administrative_area_level_2 !== undefined ) ) {

    // Convert Dspierta geoloc from Geocode values
    sessionStorage['country'] = geoloc['country'];
    sessionStorage['latitude'] = geoloc['latitude'];
    sessionStorage['longitude'] = geoloc['longitude'];
    // check pais code
    var geoloc_pcode = geoloc['country_code'].toLowerCase();
    if ( allPaisRegionsObj[geoloc_pcode] !== undefined ) {
      sessionStorage['code'] = geoloc_pcode;

      // check area2 code (by Spain)
      var geoloc_area2_code = ( geoloc['administrative_area_level_2_code'] !== undefined ) ? geoloc['administrative_area_level_2_code'].toLowerCase() : '';
      var geoloc_area1 = ( geoloc['administrative_area_level_1'] !== undefined ) ? geoloc['administrative_area_level_1'].toLowerCase() : '';
      var geoloc_loc = ( geoloc['locality'] !== undefined ) ? geoloc['locality'].toLowerCase() : '';
      if ( allPaisRegionsObj[geoloc_pcode][geoloc_area2_code] !== undefined ) {
        sessionStorage['area_code'] = rcode_geoloc;
        geolocation = "true";
      }
      else if ( allNamePaisRegionsObj[geoloc_pcode]['regions'][geoloc_area1] !== undefined ) {
        sessionStorage['area_code'] = allNamePaisRegionsObj[geoloc_pcode]['regions'][geoloc_area1]['code'];
        geolocation = "true";
      }
      else if ( allNamePaisRegionsObj[geoloc_pcode]['regions'][geoloc_loc] !== undefined ) {
        sessionStorage['area_code'] = allNamePaisRegionsObj[geoloc_pcode]['regions'][geoloc_loc]['code'];
        geolocation = "true";
      }
      else {
        sessionStorage['area_code'] = '-';
        geolocation = "true";
      }
    }
    
    if ( geolocation === "true" ) {
      sessionStorage['geolocation'] = true;
      sessionStorage.setItem('geolocation', true);          
      sessionStorage['locality'] = geoloc['locality'];
      sessionStorage['area'] = geoloc['administrative_area_level_1'];
      sessionStorage['area_2'] = geoloc['administrative_area_level_2'];
      sessionStorage['formatted_address'] = geoloc['formatted_address'];

      //window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);
    }
    else {
      sessionStorage['code'] = '-';
      sessionStorage['area_code'] = '-';
      despiertaGeoError();
    }

  }
  else {
    despiertaGeoError();
  }
}

function ip_geoloc_getCurrentPosition(callbackUrl, reverseGeocode, refreshPage) {
  $('#loading p').html("Localizando...");

  if (typeof(getCurrentPositionCalled) !== 'undefined') {
    // Been here, done that (can happen in AJAX context).
    return;
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

  if (navigator.geolocation) {
    var startTime = (new Date()).getTime();
    navigator.geolocation.getCurrentPosition(getLocation, handleLocationError, {enableHighAccuracy: true, timeout: 10000});
    getCurrentPositionCalled = true;

    if ( /firefox/.test(navigator.userAgent.toLowerCase()) ) {
      $('#loading').css('display', 'block');
      sleep(10000);
    }
  }
  else {
    var data = new Object;
    data['error'] = Drupal.t('IPGV&M: device does not support W3C API.');

    despiertaGeoError();

    callbackServer(callbackUrl, data, false);
  }
  
}


  Drupal.behaviors.despiertaGeolocation = {
    attach: function (context, settings) {

      allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('#block-views-tax-regiones-block .view-tax-regiones') )

      // $('#sms_geoloc_nodespierta select[id="sel-pais"]').change(function(event) {
      $(context).delegate('#sms_geoloc_nodespierta select[id="sel-pais"]', 'change', function(event) {
        sessionStorage['geolocation'] = "local";

        // country has been changed. rewrite 'region' options
        var pais = $('option:selected', this ).text();
        var pcode = $('option:selected', this).attr('dp-pais-code');
        var rcode = '-';
        var region = '';
        sessionStorage['country'] = pais;
        sessionStorage['code'] = pcode;
        sessionStorage['area'] = region;
        sessionStorage['area_code'] = rcode;

        var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, pcode);
        $( '#sms_geoloc_nodespierta .sel-regions' ).replaceWith($regHTML);        
      });
      // $('#sms_geoloc_nodespierta .btn').click(function(event) {
      $(context).delegate('#sms_geoloc_nodespierta .btn', 'click', function(event) {

        // Redirect region location
        //window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);

        // Simple/Advance search
        Drupal.theme.prototype.modifySearchRegion(allPaisRegionsObj);

        // change directorio-verde menu
        Drupal.theme.prototype.changeLinkToRegion();        

      });
      // $('#sms_geoloc_nodespierta select[id="sel-regions"]').change(function(event) {
      $(context).delegate('#sms_geoloc_nodespierta select[id="sel-regions"]', 'change', function(event) {

        sessionStorage['geolocation'] = "local";

        // region has been changed
        var pcode = $('#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
        var region = $('option:selected', this).text();
        var rcode = $('option:selected', this).attr('dp-reg-code');
        if ( region === "Todas las regiones" ) { region = ""; rcode = '-' }
        sessionStorage['area'] = region;
        sessionStorage['area_code'] = rcode;

      });

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

    } // end: attach
  }

})(jQuery);
