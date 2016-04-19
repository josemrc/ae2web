(function ($) {

var allPaisRegionsObj;
var allCategoriasObj;

// geo Position
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

function ip_geoloc_getCurrentPosition() {

  $('#loading p').html("Localizando...");

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

  if ("geolocation" in navigator) {
  /* geolocation is available */
    navigator.geolocation.getCurrentPosition(getLocation, despiertaGeoError, {enableHighAccuracy: true, timeout: 10000});
  } else {
    /* geolocaiton IS NOT available */
    despiertaGeoError();
  }

  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(getLocation, despiertaGeoError, {enableHighAccuracy: true, timeout: 10000});
  // }
  // else {
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


      if (
        sessionStorage === undefined || sessionStorage === null || 
        sessionStorage.getItem('geolocation') === undefined || sessionStorage['geolocation'] === undefined || 
        sessionStorage.getItem('geolocation') === null || sessionStorage['geolocation'] === null || 
        sessionStorage.getItem('geolocation') !== "local" || sessionStorage['geolocation'] !== "local"
      ) {
          // For firefox: In the case "Not now" event does not work
          if ( /firefox/.test(navigator.userAgent.toLowerCase()) ) {
            // Check if geolocation and the website is ready after a time
            //setTimeout(despiertaGeoError, 15000);
          }

          ip_geoloc_getCurrentPosition(
            settings.ip_geoloc_menu_callback,
            settings.ip_geoloc_reverse_geocode,
            settings.ip_geoloc_refresh_page
          );
      }
      else {
        Drupal.theme.prototype.isReady();
      }


      // // $('#sms_geoloc_nodespierta select[id="sel-pais"]').change(function(event) {
      // $(context).delegate('#sms_geoloc_nodespierta select[id="sel-pais"]', 'change', function(event) {
      //   sessionStorage['geolocation'] = "local";

      //   // country has been changed. rewrite 'region' options
      //   var pais = $('option:selected', this ).text();
      //   var pcode = $('option:selected', this).attr('dp-pais-code');
      //   var rcode = '-';
      //   var region = '';
      //   sessionStorage['country'] = pais;
      //   sessionStorage['code'] = pcode;
      //   sessionStorage['area'] = region;
      //   sessionStorage['area_code'] = rcode;

      //   var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, pcode);
      //   $( '#sms_geoloc_nodespierta .sel-regions' ).replaceWith($regHTML);        
      // });
      // // $('#sms_geoloc_nodespierta .btn').click(function(event) {
      // $(context).delegate('#sms_geoloc_nodespierta .btn', 'click', function(event) {

      //   // Redirect region location
      //   //window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);

      //   // change directorio-verde menu
      //   // Drupal.theme.prototype.changeLinkToRegion();

      // });
      // // $('#sms_geoloc_nodespierta select[id="sel-regions"]').change(function(event) {
      // $(context).delegate('#sms_geoloc_nodespierta select[id="sel-regions"]', 'change', function(event) {

      //   sessionStorage['geolocation'] = "local";

      //   // region has been changed
      //   var pcode = $('#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
      //   var region = $('option:selected', this).text();
      //   var rcode = $('option:selected', this).attr('dp-reg-code');
      //   if ( region === "Todas las regiones" ) { region = ""; rcode = '-' }
      //   sessionStorage['area'] = region;
      //   sessionStorage['area_code'] = rcode;

      // });



    } // end: attach
  }

})(jQuery);
