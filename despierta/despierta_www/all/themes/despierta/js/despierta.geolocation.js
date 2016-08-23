(function ($) {

var allPaisRegionsObj;
var allCategoriasObj;
var urlPaths = getUrlPaths();

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

function despiertaGeoError()
{
  var html = Drupal.theme('paisSelectList', allPaisRegionsObj);
  $('#sms_geoloc_nodespierta .modal-body').prepend('<div class="sel-pais">' + html + '</div>');
  $('#sms_geoloc_nodespierta select[id="sel-pais"]').prepend('<option value="-" dp-pais-code="-">Seleccione un país</option>');  
  $('#sms_geoloc_nodespierta select[id="sel-pais"] > option[value="-"]').prop('selected', true);

  var html = Drupal.theme('regionesSelectList', allPaisRegionsObj);
  $('#sms_geoloc_nodespierta .modal-body').append('<div class="sel-regions">' + html + '</div>');

  $('#sms_geoloc_nodespierta').modal('show');

  sessionStorage['geolocation'] = "local";

  // Still loading but with exceptions
  $('#loading').css('z-index', 100);
}

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
      var geoloc_area2 = ( geoloc['administrative_area_level_2'] !== undefined ) ? geoloc['administrative_area_level_2'].toLowerCase() : '';
      var geoloc_loc = ( geoloc['locality'] !== undefined ) ? geoloc['locality'].toLowerCase() : '';
      if ( allPaisRegionsObj[geoloc_pcode]['regions'][geoloc_area2_code] !== undefined ) {
        sessionStorage['area_code'] = geoloc_area2_code;
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
      else if ( allNamePaisRegionsObj[geoloc_pcode]['syn'][geoloc_area2] !== undefined ) {
        sessionStorage['area_code'] = allNamePaisRegionsObj[geoloc_pcode]['syn'][geoloc_area2]['code'];
        geolocation = "true";
      }
      else if ( allNamePaisRegionsObj[geoloc_pcode]['syn'][geoloc_area1] !== undefined ) {
        sessionStorage['area_code'] = allNamePaisRegionsObj[geoloc_pcode]['syn'][geoloc_area1]['code'];
        geolocation = "true";
      }
      else {
        sessionStorage['area_code'] = '-';
        geolocation = "true";
      }
    }
    
    if ( geolocation === "true" ) {
      sessionStorage['geolocation'] = true;
      sessionStorage['locality'] = geoloc['locality'];
      sessionStorage['area'] = geoloc['administrative_area_level_1'];
      sessionStorage['area_2'] = geoloc['administrative_area_level_2'];
      sessionStorage['formatted_address'] = geoloc['formatted_address'];

      // Crete region panel
      Drupal.theme.prototype.createRegionPanel(allPaisRegionsObj, allCategoriasObj);

      // Show the page      
      Drupal.theme.prototype.isReady();
    }
    else {
      sessionStorage['code'] = '-';
      sessionStorage['area_code'] = '-';
      sessionStorage['cat_code'] = '-';
      despiertaGeoError();
    }

  }
  else {
    despiertaGeoError();
  }
}

function getLocation(position) {
  var ip_geoloc_address = new Object;
  ip_geoloc_address['latitude']  = position.coords.latitude;
  ip_geoloc_address['longitude'] = position.coords.longitude;
  ip_geoloc_address['accuracy']  = position.coords.accuracy;

  // Reverse-geocoding of lat/lon requested.
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
      // Error
      despiertaGeoError();
    }
  });
}

function getGeolocation() {

  $('#loading p').html("Localizando...");

  if ("geolocation" in navigator) {
  /* geolocation is available */
    // navigator.geolocation.getCurrentPosition(getLocation, despiertaGeoError, {enableHighAccuracy: true, timeout: 10000});
    navigator.geolocation.getCurrentPosition(getLocation, despiertaGeoError, {enableHighAccuracy: true});
  } else {
    /* geolocaiton IS NOT available */
    despiertaGeoError();
  }

  // if (navigator.geolocation) {
  // /* geolocation is available */
  //   navigator.geolocation.getCurrentPosition(getLocation, despiertaGeoError, {enableHighAccuracy: true, timeout: 10000});
  // } else {
  //   /* geolocaiton IS NOT available */
  //   despiertaGeoError();
  // }
  
}


  Drupal.behaviors.despiertaGeolocation = {
  attach: function (context, settings) {

      // console.log("context.geolocation");
      // console.log(context);

      // Active loading page
      Drupal.theme.prototype.isLoading(context);

      // Get Taxonomy: regiones (global)
      allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('#block-views-tax-regiones-block .view-tax-regiones') );

      // Get Taxonomy: categorias
      allCategoriasObj = Drupal.theme.prototype.categoriasObj( $('#block-views-categorias-names .view-content') );


      // Get Geolocation if it does not alreaady exists (Session)
      if ( urlPaths !== undefined && urlPaths.length > 0 && ( urlPaths[0] === 'usuario' || urlPaths[0] === 'empresa' || urlPaths[0] === 'user' || urlPaths[0] === 'admin' ) ) {
        Drupal.theme.prototype.isReady();
      }
      else {
        if (
          sessionStorage === undefined || sessionStorage === null || 
          sessionStorage['geolocation'] === undefined || sessionStorage['geolocation'] === null   || 
          sessionStorage['code'] === undefined        || sessionStorage['code'] === null          || sessionStorage['code'] === ''      ||
          sessionStorage['area_code'] === undefined   || sessionStorage['area_code'] === null     || sessionStorage['area_code'] === ''
        ) {
            // For firefox: In the case "Not now" event does not work
            if ( /firefox/.test(navigator.userAgent.toLowerCase()) ) {
              // Check if geolocation and the website is ready after a time
              // setTimeout(despiertaGeoError, 15000);
            }
            getGeolocation();
        }
        else {
          if (
            sessionStorage['geolocation'] !== undefined && sessionStorage['geolocation'] !== null  && sessionStorage['geolocation'] === "local" && 
            (sessionStorage['code'] === ''      || sessionStorage['code'] === '-') &&
            (sessionStorage['area_code'] === '' || sessionStorage['area_code'] === '-')
          ) {
            despiertaGeoError();
          }
          else {
            Drupal.theme.prototype.isReady();
          }
        }
      }

      /* Control the "Local Region Panel" */
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

        var html = Drupal.theme('regionesSelectList', allPaisRegionsObj, pcode);
        $('#sms_geoloc_nodespierta .sel-regions').replaceWith('<div class="sel-regions">' + html + '</div>');

        // Enable/Disable button depending 'pais' is selected or not
        if ( pcode !== '' && pcode !== '-' ) {
          $('#sms_geoloc_nodespierta .btn').attr('disabled', false);
        }
        else {
          $('#sms_geoloc_nodespierta .btn').attr('disabled', true);
        }
      });
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
      //$(context).delegate('#sms_geoloc_nodespierta .btn', 'click', function(event) {
      $('#sms_geoloc_nodespierta .btn').one( "click", function() {

        Drupal.theme.prototype.createRegionPanel(allPaisRegionsObj, allCategoriasObj);

        if ( urlPaths !== undefined && urlPaths.length > 0 && ( urlPaths[0] === 'directorio-verde' || urlPaths[0] === 'busq' ) ) {
          window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);
        }
        else {
          Drupal.theme.prototype.isReady();          
        }


      });

    } // end: attach
  }

})(jQuery);
