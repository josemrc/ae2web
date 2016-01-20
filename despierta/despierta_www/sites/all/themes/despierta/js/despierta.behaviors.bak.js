(function ($) {

  /**
   * Global vars
   */
	var allPaisRegionsObj = {};
	var visitor = {};
	var allSedes = {};
	var htmlNoResults = '<section class="no-resultados">'+
							'<div class="alert alert-warning" role="alert">'+
							'No hay entidades registradas en esta región, '+
							'si desea registrar su entidad acceda al menú de registro o, '+
							'si por el contrario quiere notificarnos la existencia de alguna, '+
							'póngase en contacto con nosotros'+
							'</div>'+
						'</section>';
	var smsNoGeo = '<div id="messages"><div class="section clearfix">'+
						'<div class="nogeo messages warning">'+
							'Actualmente no tiene activado la geolocalización, o su navegador no lo permite. '+
							'Le recomentamos que lo active, o en su defecto, '+
							'seleccione el país y regiones mediante las opciones del panel superior derecho'+
						'</div>'+
					'</div></div>';

	var urlVars = getUrlVars();


  /**
   *
   * Global functions.
   * 
   */
	// New functions
	if (typeof(Number.prototype.toRad) === "undefined") {
  		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		}
	}
	if (typeof(String.prototype.capitalizeFirstLetter) === "undefined") {
		String.prototype.capitalizeFirstLetter = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		}				
	}
	jQuery.expr[':'].icontains = function(a, i, m) {
		return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};
	jQuery.expr[':'].iattrcontains = function(elem, i, prop) {
		var iparam = prop[3].split(',');
		var iattr = iparam[0];
		var ival = iparam[1].toLowerCase();
		ival = ival.replace(/^\n*\s*/g,'');
		ival = ival.replace(/\n*\s*$/g,'');
		if ( jQuery(elem).attr(iattr).toLowerCase().indexOf( ival ) >= 0 ) { return 1 }
	};   
	// Read a page's GET URL variables and return them as an associative array.
	// Drupal.theme.prototype.getUrlVars = function (elem) {
	function getUrlVars(elem) {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars[hash[0]] = decodeURIComponent( hash[1] );
		}
		return vars;
	}
	// Get city from lat/lng
	function codeLatLng(lat, lng) {
		var latlng = new google.maps.LatLng(lat, lng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					//formatted address
					alert(results[0].formatted_address)
					//find country name
					for (var i=0; i<results[0].address_components.length; i++) {
						for (var b=0;b<results[0].address_components[i].types.length;b++) {
							//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
							if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
								//this is the object you are looking for
								city= results[0].address_components[i];
								break;
							}
						}
					}
					//city data
					alert(city.short_name + " " + city.long_name)
				} else {
					alert("No results found");
				}
			} else {
				alert("Geocoder failed due to: " + status);
			}
		});
	}	
	// Geolocation
	function geoProximity(lon1, lat1, lon2, lat2) {
		var R = 6371; // Radius of the earth in km
		var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
		var dLon = (lon2-lon1).toRad(); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}
	// Change title adding the region
	Drupal.theme.prototype.getTitleRegion = function (title) {
		var prefixtitle = title.substring(0, title.indexOf(" en "));
		if ( prefixtitle != "" ) { title = prefixtitle }
		var region = $('select[id="sel-regions"] option:selected').text();
		var pais = $('select[id="sel-pais"] option:selected').text();
		var q = region;
		if ( region == "Todas las regiones" ) { q = pais }
		return title + " en " + q;
	};
	// Show and Hide sedes panel
	Drupal.theme.prototype.hideSedesPanel = function () {
		if ( $('#block-views-sedes-block').length > 0 ) {
			$('#loading').removeClass('element-invisible');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .view-filters').css('display', 'none');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .view-content').css('display', 'none');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .attachment').addClass('element-invisible');
		}	
	};
	Drupal.theme.prototype.showSedesPanel = function () {
		if ( $('div[id="block-views-sedes-block"]').length > 0 ) {
			$('#loading').addClass('element-invisible');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .view-filters').fadeIn('slow');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .view-content').fadeIn('slow');
			$('#block-views-sedes-block .view-id-sedes.view-display-id-block > .attachment').removeClass('element-invisible');
		}
	};
	// Filter by direction or by country you sell
	Drupal.theme.prototype.filterByRegionOnline = function (type) {
		// create query 'pais/region'
		var regquery = "";
		var pais = $( '#header select[id="sel-pais"] option:selected').text();
		var pcode = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
		var region = $( '#header select[id="sel-regions"] option:selected').text();
		var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
		if ( region == "Todas las regiones" ) { region = "" }
		if ( region != "" ) { regquery = pais + ',' + region }
		else { regquery = pais }

		if ( type == "online" ) { 
			pcode = "All";
			region = "";
			// regquery = "";
		}
		// Sedes pages:
		// Chages the filter forms of Sedes!!!
		if ( $( 'form[id="views-exposed-form-sedes-block"]' ).length ) {
			var lreg = region.toLowerCase();
			// Add Country Code
			$('form[id="views-exposed-form-sedes-block"] select[id="edit-field-sede-direccion-country"] > option[value="'+pcode+'"] ').prop('selected', true);
			// Add Region Code
			$( 'form[id="views-exposed-form-sedes-block"] #edit-field-sede-direccion-administrative-area-selective-wrapper .form-type-bef-checkbox').each(function(){
				var rcode2 = $('input', this).val();
				if ( rcode != undefined && rcode2 != undefined && rcode2 == rcode ) {
					$('input', this).prop( "checked", true );
				} else {
					$('input', this).prop( "checked", false );
				}				
			});
			// Add city (locality)
			$( 'form[id="views-exposed-form-sedes-block"] div[id="edit-field-sede-direccion-locality-selective-wrapper"] div[class*="form-type-bef-checkbox"]').each(function(){
				if ( lreg != "" && $(' > input', this).attr('value').toLowerCase() == lreg ) {
					$(' > input', this).prop( "checked", true );
				} else {
					$(' > input', this).prop( "checked", false );
				}
			});
			$('form[id="views-exposed-form-sedes-block"] input[id="edit-field-sede-pais-tid"]').val(regquery);
			$('form[id="views-exposed-form-sedes-block"] select[id="edit-field-sede-direccion-country"]').change();
		}		
	};
	// Modify the Simple/Advance Search form
	Drupal.theme.prototype.modifySearchRegion = function () {
		if ( $('form[id="views-exposed-form-sedes2-busq-simple"]').length ) {
			// Copy regions in the search panels (if apply)
			var oldrcode = $('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-region"] > option:selected').val();
			var $options = $('#header select[id="sel-regions"] > option').clone();
			$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-region"] > option').remove();
			$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-region"]').append($options);
			//var urlVars = getUrlVars();
			if ( urlVars['q'] === undefined ) {
				var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
				$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-region"] > option[value="'+rcode+'"]').prop('selected', true);
			}
			else {
				$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-region"] > option[value="'+oldrcode+'"]').prop('selected', true);
			}
			// Add pais into 
			var pais = $('select[id="sel-pais"] option:selected').text();
			$('form[id="views-exposed-form-sedes2-busq-simple"] input[id="edit-pais"]').val(pais);
		}

		if ( $('form[id="views-exposed-form-sedes2-busq-avan"]').length ) {
			var pcode = $('form[id="views-exposed-form-sedes2-busq-avan"] select[id="edit-pais"] > option:selected').val();
			if ( pcode != undefined && pcode != "All" ) {
				var $regions = Drupal.theme('regionesSelectList', allPaisRegionsObj, pcode);
				var $options = $($regions).find('option');
				$('form[id="views-exposed-form-sedes2-busq-avan"] #edit-region > option').remove();
				$('form[id="views-exposed-form-sedes2-busq-avan"] #edit-region').append($options);
				$('form[id="views-exposed-form-sedes2-busq-avan"] #edit-region').removeAttr('disabled');
			}
			else {
				$('form[id^="views-exposed-form-sedes2-busq-avan"] #edit-region').attr('disabled', 'disabled');
			}
		}
	};
	

	// Apply changes when 'pais/region' panel is modified (or active)
	Drupal.theme.prototype.applyRegionOption = function () {

		// hide panels
		Drupal.theme.prototype.hideSedesPanel();

		// create query 'pais/region'
		Drupal.theme.prototype.filterByRegionOnline();

		// Change title in 'Directorio verde' and 'Categories' pages
		if ( $( 'div[id="block-views-sedes-block"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}
		if ( $( 'div[class*="view-despierta-directorio-verde"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}

		// Simple/Advance search
		Drupal.theme.prototype.modifySearchRegion();

	};


  /**
   *
   * Pais / Regions functions.
   * 
   */

	// Create Object: Pais - Regions
	Drupal.theme.prototype.paisRegionesObj = function (elem) {
		var paises = {};
		$('div[class="region"]', elem).map( function () {
			var region = $(this).text();
			var pais = $(this).attr('dp-pais');
			var code = $(this).attr('dp-pais-code');
			if ( paises[code] === undefined ) {
				paises[code] = {
					'name': pais,
					'regions': {}
				};
			}
			if ( paises[code].regions[region] === undefined ) {
				var regCode = addressfield_get_region_code(code, region);
				if ( regCode === undefined ) {
					regCode = region.toLowerCase();
					regCode = regCode.replace(/^\n*\s*/g,'');
					regCode = regCode.replace(/\n*\s*$/g,'');
					regCode = regCode.replace(/\s/g,'_');
				}
				paises[code].regions[regCode] = {
					'name': region
				};
			}
		});
		return paises;
	};	
	// Create Object: Pais - Regions (from the Enable list of 'paises/regions')
	Drupal.theme.prototype.paisRegionesEnableObj = function (elem) {
		var regions = [];
		$('option', elem).map( function () {
			var region = $(this).val();
			if ( region !== "All" ) {
				regions.push(region);				
			}
		});
		return regions;
	};
	// Create HTML select option
	Drupal.theme.prototype.paisSelectList = function (paisRegions) {
		var selHTML = '<select id="sel-pais">';
		for (var pCode in paisRegions) {
			var pais = paisRegions[pCode].name;
			selHTML += '<option value="'+pais+'" dp-pais-code="'+pCode+'">' + pais + '</option>';
		}
		selHTML += '</select>';
		return $('<div class="sel-pais">' + selHTML + '</div>');
	};
	// Create HTML select option
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, inCode) {
		var selHTML = '<select id="sel-regions">';		
		selHTML += '<option value="All">Todas las regiones</option>';
		var code = ( inCode !== "" && inCode !== undefined ) ?  inCode : Object.keys(paisRegions)[0];
		for (var rCode in paisRegions[code].regions)  {
			var region = paisRegions[code].regions[rCode];
			selHTML += '<option value="'+rCode+'" dp-reg-code="'+rCode+'">'+region.name+'</option>';
		}
		selHTML += '</select>';
		return $('<div class="sel-regions">' + selHTML + '</div>');
	};	
	// Select: Specific Pais - Region (for Geolocation)
	// Eg, Drupal.theme.prototype.selectPaisRegion("Honduras", "Napo");
	Drupal.theme.prototype.selectPaisRegion = function (cPosition) {
		var code = cPosition['code'];
		var pais = cPosition['country'];
		var region = cPosition['area'];
		if ( code !== undefined || code !== null || code !== "" ) {
			$('select[id="sel-pais"] > option[dp-pais-code="'+code+'"]').prop('selected', true);
		}
		if ( region !== undefined || region !== null || region !== "" ) {
			if ( region !== "" ) {
				$('select[id="sel-regions"] > option:contains("'+region+'")').prop('selected', true);
			}
			else {
				$('select[id="sel-regions"] > option[value="All"]').prop('selected', true);				
			}
		}
		return { 'pais': pais, 'region': region }
	}; 

  /**
   *
   * Sedes
   * 
   */

	// Create report with a Sede
	Drupal.theme.prototype.repSede = function (elem) {
		var sede = {};
		// nid (only for Sedes view)
		if ( $('td[class$="views-field-nid"]', elem).length ) {
			var val = $('td[class$="views-field-nid"]', elem).text().replace(/\n*\s*/g,'');
			sede.nid = val;
		}
		// distance (only for Sedes view)
		if ( $('td[class$="views-field-field-geofield-distance"]', elem).length ) {
			var val = $('td[class$="views-field-field-geofield-distance"]', elem).text().replace(/\n*\s*/g,'');
			sede.proximity = val;
		}
		if ( $('td[class$="views-field-field-location"]', elem).length ) {
			var val = $('td[class$="views-field-field-location"]', elem).text().replace(/\n*\s*/g,'');
			if ( val !== undefined && val != "" ) {
				sede.location = jQuery.parseJSON( val );
				// sede.proximity = geoProximity( parseFloat(sessionStorage['longitude']), parseFloat(sessionStorage['latitude']), sede.location.coordinates[0], sede.location.coordinates[1]);
			}
		}
		// title
		if ( $('td[class$="views-field-title"]', elem).length ) {
			var val = $('td[class$="views-field-title"] > a', elem).text().replace(/\n*\s*/g,'');
			sede.title = val;
		}
		else if ( $('#page-title').length ) {
			var val = $('#page-title').text().replace(/\n*\s*/g,'');
			sede.title = val;
		}
		// logo
		if ( $('td[class$="views-field-field-sede-logo"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-logo"] > img', elem).attr('src').replace(/\n*\s*/g,'');
			sede.logo = val;
		}
		else if ( $('.field-name-field-sede-logo .field-item', elem).length ) {
			var val = $('.field-name-field-sede-logo .field-item > img', elem).attr('src').replace(/\n*\s*/g,'');
			sede.logo = val;
		}
		// desc. breve
		if ( $('td[class$="views-field-field-sede-descripcion-breve"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-descripcion-breve"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.descb = val;
		}
		else if ( $('.field-name-field-sede-descripcion-breve .field-item', elem).length ) {
			var val = $('.field-name-field-sede-descripcion-breve .field-item', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.descb = val;
		}
		// desc. completa
		if ( $('td[class$="views-field-field-sede-descripcion-completa"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-descripcion-completa"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.descc = val;
		}
		else if ( $('.field-name-field-sede-descripcion-completa .field-item', elem).length ) {
			var val = $('.field-name-field-sede-descripcion-completa .field-item', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.descc = val;
		}
		// direccion: street
		if ( $('td[class$="views-field-field-sede-direccion-thoroughfare"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-direccion-thoroughfare"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			val = val.replace(/\s*,\s*/g,', ');
			sede.direccion = val;
		}
		else if ( $('.field-name-field-sede-direccion .thoroughfare', elem).length ) {
			var val = $('.field-name-field-sede-direccion .thoroughfare', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			val = val.replace(/\s*,\s*/g,', ');
			sede.direccion = val;
		}
		// direccion: postal code
		if ( $('td[class$="views-field-field-sede-direccion-postal-code"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-direccion-postal-code"]', elem).text().replace(/\n*\s*/g,'');
			sede.cp = val;
		}
		else if ( $('.field-name-field-sede-direccion .postal-code', elem).length ) {
			var val = $('.field-name-field-sede-direccion .postal-code', elem).text().replace(/\n*\s*/g,'');
			sede.cp = val;
		}
		// direccion: locality
		if ( $('td[class$="views-field-field-sede-direccion-locality"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-direccion-locality"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.locality = val;
		}
		else if ( $('.field-name-field-sede-direccion .locality', elem).length ) {
			var val = $('.field-name-field-sede-direccion .locality', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.locality = val;
		}
		// direccion: region
		if ( $('td[class$="views-field-field-sede-direccion-administrative-area"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-direccion-administrative-area"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.region = val;
		}
		else if ( $('.field-name-field-sede-direccion .locality', elem).length ) {
			var val = $('.field-name-field-sede-direccion .locality', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.region = val;
		}
		// direccion: country
		if ( $('td[class$="views-field-field-sede-direccion-country"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-direccion-country"]', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.country = val;
		}
		else if ( $('.field-name-field-sede-direccion .country', elem).length ) {
			var val = $('.field-name-field-sede-direccion .country', elem).text();
			val = val.replace(/^\n*\s*/g,'');
			val = val.replace(/\n*\s*$/g,'');
			sede.country = val;
		}
		// email
		if ( $('td[class$="views-field-field-sede-email"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-email"]', elem).text().replace(/\n*\s*/g,'');
			sede.email = val;
		}
		else if ( $('.field-name-field-sede-email .field-item', elem).length ) {
			var val = $('.field-name-field-sede-email .field-item', elem).text().replace(/\n*\s*/g,'');
			sede.email = val;
		}
		// web
		if ( $('td[class$="views-field-field-sede-web"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-web"]', elem).text().replace(/\n*\s*/g,'');
			sede.web = val;
		}
		else if ( $('.field-name-field-sede-web .field-item', elem).length ) {
			var val = $('.field-name-field-sede-web .field-item', elem).text().replace(/\n*\s*/g,'');
			sede.web = val;
		}		
		// tlf
		if ( $('td[class$="views-field-field-sede-telefono"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-telefono"]', elem).text().replace(/\n*\s*/g,'');
			sede.tlf = val;
		}
		else if ( $('.field-name-field-sede-telefono .field-item', elem).length ) {
			var val = $('.field-name-field-sede-telefono .field-item', elem).text().replace(/\n*\s*/g,'');
			sede.tlf = val;
		}
		// tipo actividad
		if ( $('td[class$="views-field-field-sede-tipo-actividad"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-tipo-actividad"]', elem).text();
			sede.t_act = val;
		}
		else if ( $('.field-name-field-sede-tipo-actividad', elem).length ) {
			var val = "";
			$('.field-name-field-sede-tipo-actividad .lineage-item', elem).each(function(){ val += '; '+$(this).text(); });
			val = val.replace(/^;\s*/g,'');
			sede.t_act = val;
		}
		// tipo movimiento
		if ( $('td[class$="views-field-field-sede-tipo-movimiento"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-tipo-movimiento"]', elem).text();
			sede.t_mov = val;
		}
		else if ( $('.field-name-field-sede-tipo-movimiento', elem).length ) {
			var val = "";
			$('.field-name-field-sede-tipo-movimiento .lineage-item', elem).each(function(){ val += '; '+$(this).text(); });
			val = val.replace(/^;\s*/g,'');
			sede.t_mov = val;
		}		
		// tipo venta
		if ( $('td[class$="views-field-field-sede-tipo-venta"]', elem).length ) {
			var val = $('td[class$="views-field-field-sede-tipo-venta"]', elem).text();
			sede.t_vent = val;
		}
		else if ( $('.field-name-field-sede-tipo-venta', elem).length ) {
			var val = "";
			$('.field-name-field-sede-tipo-venta .lineage-item', elem).each(function(){ val += '; '+$(this).text(); });
			val = val.replace(/^;\s*/g,'');
			sede.t_vent = val;
		}		
		// venta paises
		if ( $('td[class$="views-field-field-sede-pais"]', elem).length ) {
			var val = "";
			$('td[class$="views-field-field-sede-pais"] .lineage-item', elem).each(function(){ val += '; '+$(this).text(); });
			sede.p_serv = val;
		}
		else if ( $('.field-name-field-sede-pais', elem).length ) {
			var val = "";
			$('.field-name-field-sede-pais .lineage-item', elem).each(function(){ val += '; '+$(this).text(); });
			val = val.replace(/^;\s*/g,'');
			sede.p_serv = val;
		}
		// directorio-verde (only for Sede page)
		if ( $('.field-name-field-directorio-verde', elem).length ) {
			var cats = {};
			$('.field-name-field-directorio-verde li[class*="taxonomy-term-reference"]', elem).each(function(){
				var cat = $('.lineage-item-level-0', this).text();
				var subcat = $('.lineage-item-level-1', this).text();
				var etiq = $('.lineage-item-level-2', this).text();
				if ( cats[cat] === undefined ) { cats[cat] = {} }
				if ( cats[cat][subcat] === undefined ) { cats[cat][subcat] = {} }
				cats[cat][subcat][etiq] = 1;
			});
			sede.cats = cats;
		}

		return sede;
	};
	// Create report with the list of Sedes
	Drupal.theme.prototype.reportSedes = function (elem) {
		var reportSedes = {};
		$('.view-grouping', elem).map( function (i, group) {
			var cat = $('.view-grouping-header', this).text();
			cat = cat.replace(/Categoria\:\s*/g,'');
			$( 'table', group ).map( function (i, table) {
				var subcat = $('caption:first', table).text();
				subcat = subcat.replace(/Subcategoria\:\s*/g,'');
				subcat = subcat.replace(/\n*\s*$/g,'');
				$('tbody > tr', table).map( function (j, tr) {
					// create sede obj
					var sede = Drupal.theme.prototype.repSede( tr );
					// add sede into list report
					if ( sede.nid != undefined ) {
						var nid = sede.nid;
						// add for first time the report
						if ( reportSedes[nid] === undefined ) {
							reportSedes[nid] = sede;
							reportSedes[nid].cats = {};
						}
						// concatenate 'directorio-verde' values (cat > subcat > etiqs)
						if ( $('td[class$="sede-etiq"]', tr).length ) {
							var val = $('td[class$="sede-etiq"]', tr).text();
							val = val.replace(/^\n*\s*/g,'');
							val = val.replace(/\n*\s*$/g,'');
							if ( reportSedes[nid].cats[cat] === undefined ) { reportSedes[nid].cats[cat] = {} }
							if ( reportSedes[nid].cats[cat][subcat] === undefined ) { reportSedes[nid].cats[cat][subcat] = {} }
							reportSedes[nid].cats[cat][subcat][val] = 1;
						}
					}
				});
			});
		});
		return reportSedes;
	};
	
	// Create tab list depending on type of view
	Drupal.theme.prototype.createTabHeader = function (inSedesObj, tabAll) {
		var tabHeader = {};
		for ( var nid in inSedesObj ) {
			var iSedeObj = inSedesObj[nid];
			for ( var cat in iSedeObj.cats ) {
				var sede = {
					'title': "",
					'nid': "",
					'locality': "",
					'country': "",
					'proximity': "",
					'p_serv': "",

				};
				if ( iSedeObj.title != undefined ) { sede.title = iSedeObj.title }
				if ( iSedeObj.nid != undefined ) { sede.nid = iSedeObj.nid }
				if ( iSedeObj.locality != undefined ) { sede.locality = iSedeObj.locality.toLowerCase() }
				if ( iSedeObj.region != undefined ) { sede.region = iSedeObj.region }
				if ( iSedeObj.country != undefined ) { sede.country = iSedeObj.country.toLowerCase() }
				if ( iSedeObj.proximity != undefined ) { sede.proximity = iSedeObj.proximity }
				if ( iSedeObj.p_serv != undefined ) { sede.p_serv = iSedeObj.p_serv.toLowerCase() }
				// Region view
				if ( tabAll === true ) {
				// if ( urlVars['q'] === undefined || urlVars['q'] === "" ) {
					if ( tabHeader['Todas'] === undefined ) { tabHeader['Todas'] = {} }
					tabHeader['Todas'][nid] = sede;
					if ( tabHeader[cat] === undefined ) { tabHeader[cat] = {} }
					tabHeader[cat][nid] = sede;
				}
				// Categoria view
				else {
					for ( var subcat in iSedeObj.cats[cat] ) {
						if ( tabHeader[subcat] === undefined ) { tabHeader[subcat] = {} }
						tabHeader[subcat][nid] = sede;
					}
				}
			}
		}
		return tabHeader;
	};

	// Sort sedes by proximity
	Drupal.theme.prototype.sortSedesBy = function (sedesObj) {
		var pais = $( '#header select[id="sel-pais"] option:selected').text().toLowerCase();
		var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
		var region = $('#header select[id="sel-regions"] option:selected').text().toLowerCase();
		var sortable = [];
		var sortableBy = {
			'locality': [],
			'country': [],
			'online': []
		};
		// sort by proximity visitor position
		for (var nid in sedesObj) { sortable.push([nid, sedesObj[nid].proximity]) }
		sortable.sort(function(a, b) {return a[1] - b[1]});
		for ( var i=0; i < sortable.length; i++ ) {
			var nid = sortable[i][0];
			var sedeObj = sedesObj[nid];
			// 1. Check if sede has locality direction
			if ( sedeObj.region != "" && ( sedeObj.region == rcode ) ) {
				sortableBy.locality.push( sedeObj );
			}
			else if ( sedeObj.locality != "" && ( sedeObj.locality == region ) ) {
				sortableBy.locality.push( sedeObj );
			}
			// 2. Check if sede has country direction
			else if ( sedeObj.country != "" && ( sedeObj.country == pais ) && sessionStorage['geolocation'] === "false" ) {
				sortableBy.country.push( sedeObj );
			}
			// 3. Check if sede works on locality
			else if ( sedeObj.p_serv != "" && ( sedeObj.p_serv.indexOf(';'+region) >=0 )) {
				sortableBy.online.push( sedeObj );
			}
			// 4. Check if sede works on country and the rest
			else {
				sortableBy.online.push( sedeObj );
			}
		}
		return sortableBy;
	};

	// Create HTML: tab List
	Drupal.theme.prototype.tabSedes = function (inSedesObj, tabAll) {
		var tabList = [];
		var todasTab = {};
		var endTab = {};
		//var urlVars = getUrlVars();
		// Create tab list depending on type of view
		var tabHeaders = Drupal.theme.prototype.createTabHeader(inSedesObj, tabAll);
		var tabNames = Object.keys(tabHeaders).sort();
		for (var i=0; i < tabNames.length; i++ ) {
			var tname = tabNames[i];
			var tcont = "";
			var sortedSedes = Drupal.theme.prototype.sortSedesBy(tabHeaders[tname]);

			// 1. Sort by locality direcction (and proximity)
			if ( sortedSedes.locality ) {
				var sedes = sortedSedes.locality;
				if ( urlVars['q'] === undefined || urlVars['q'] === "" || urlVars['q'].indexOf("directorio-verde") >= 0 ) {
					if ( sedes.length > 0 ) {
						tcont += "<center><div class='sep-title'>Sedes que poseen un tienda en su región</div></center><hr>";
					}
					else {
						tcont += "<center><div class='sep-title'>No hay Sedes que poseen un tienda en su región</div></center><hr>";
					}
				}
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('articleSede', inSedesObj[nid], tname);
				}
			}
			// 2. Sort by country direction (and proximity)
			if ( sortedSedes.country ) {
				var sedes = sortedSedes.country;
				if ( urlVars['q'] === undefined || urlVars['q'] === "" || urlVars['q'].indexOf("directorio-verde") >= 0 ) {
					if ( sedes.length > 0 ) {
						tcont += "<center><div class='sep-title'>Sedes que poseen un establecimiento físico dentro de su país</div></center><hr>";
					}
				}
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('articleSede', inSedesObj[nid], tname);
				}
			}
			// 3. Sort by country where works (and proximity)
			if ( sortedSedes.online ) {
				var sedes = sortedSedes.online;
				if ( urlVars['q'] === undefined || urlVars['q'] === "" || urlVars['q'].indexOf("directorio-verde") >= 0 ) {
					if ( sedes.length > 0 ) {
						tcont += "<center><div class='sep-title'>Sedes que trabajan <i>Online</i> para su región</div></center><hr>";
					}
				}
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('articleSede', inSedesObj[nid], tname);
				}
			}			
			if ( tcont != "" ) {
				var id = tname.replace(/[\s\,]/g,'_');
				id = id.replace(/\.*/g,'');
				var label = tname;
				if ( tabAll == false ) { label = label + ' (' + Object.keys(tabHeaders[tname]).length + ')'}

				if ( id == "Todas" ) {
					todasTab = {
					'id': id,
					'label': label,
					'cont': '<div class="view-content"><section class="resultados">'+tcont+'</section></div>'
					};
				}
				else if ( id == "Más" ) {
					endTab = {
					'id': id,
					'label': label,
					'cont': '<div class="view-content"><section class="resultados">'+tcont+'</section></div>'
					};
				}
				else {
					tabList.push({
						'id': id,
						'label': label,
						'cont': '<div class="view-content"><section class="resultados">'+tcont+'</section></div>'
					});
				}
			}
		}
		if ( !jQuery.isEmptyObject(todasTab) ) { tabList.unshift(todasTab) }
		if ( !jQuery.isEmptyObject(endTab) ) { tabList.push(endTab) }
		var tabHTML = Drupal.theme('createTabPanel', tabList, "tabSedes");
		return tabHTML;
	};



	// Create HTML: article
	Drupal.theme.prototype.articleSede = function (sedeObj, iCat) {
 		var sedHTML = '<article class="media ">';

		sedHTML += '<div class="media-bod col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12 prici">';

			sedHTML += '<div class="logoempresa col-lg-2 col-md-2 col-sm-2 col-s-2 col-xs-2">';
				sedHTML += '<img class="media-object" src="' + sedeObj.logo + '">';
			sedHTML += '</div>';
			
			sedHTML += '<div class="allinfo col-lg-5 col-md-5 col-sm-5 col-s-9 col-xs-9">';
				sedHTML += '<h2>' + sedeObj.title +'<div class="info url"><span>+ info</span>';
					sedHTML += '<img class="ico_flecha" src="sites/default/files/ico_flecha.png">';
				sedHTML += '</div></h2>';
				// sedHTML += '<span>' + sedeObj.proximity+ ': ' +JSON.stringify(sedeObj.location)+'</span>';
				sedHTML += '<div class="inform text-justify clean"><p class="desc_breve">' + sedeObj.descb + '</p></div>';
			sedHTML += '</div>';

			sedHTML += '<div class="locinfo col-lg-5 col-md-5 col-sm-5 col-s-12 col-xs-12 text-right pull-right">';
				var dircompl = '';
				var cp = '';
				if ( sedeObj.direccion !== undefined && sedeObj.direccion != "" ) { dircompl = sedeObj.direccion }
				if ( sedeObj.cp !== undefined && sedeObj.cp != "" ) { cp += sedeObj.cp }
				if ( sedeObj.locality !== undefined && sedeObj.locality != "" ) { cp += (cp == "")? sedeObj.locality : ', '+sedeObj.locality }
				sedHTML += '<p class="direccion">' + dircompl + '</p>';
				sedHTML += '<p class="cp">' + cp + '</p>';
				if ( sedeObj.tlf !== undefined && sedeObj.tlf != "" ) {
					sedHTML += '<p><img class="ico" src="sites/default/files/ico_tlfno.png"><a class="url" href="tel:">' + sedeObj.tlf + '</a></p>';						
				}
				if ( sedeObj.email !== undefined && sedeObj.email != "" ) {
					sedHTML += '<p><img class="ico" src="sites/default/files/ico_email.png"><a class="url" href="mailto:'+sedeObj.email+'">' + sedeObj.email + '</a></p>';
				}
				if ( sedeObj.web !== undefined && sedeObj.web != "" ) {
					sedHTML += '<p class="ult"><img class="ico" src="sites/default/files/ico_url.png"><a class="url" href="www.despierta.org" target="_blank" rel="nofollow">' + sedeObj.web + '</a></p>';
				}

			sedHTML += '</div>';
			sedHTML += '<div class="clean subrayado col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12"></div>';
			sedHTML += '<div class="clean masinfo col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12">';
				var cats = "";
				var etiqs = "";
				if ( sedeObj.cats != undefined ) {
					var numCat = sedeObj.cats.length;
					for ( var cat in sedeObj.cats ) {
						if ( iCat == "Todas" ) {
							cats += cat + ' (' + Object.keys(sedeObj.cats[cat]).join(', ') + '); '
						}
						else { cats += cat + '; ' }

						for ( var subcat in sedeObj.cats[cat] ) {
							if ( iCat == "Todas" ) { etiqs += cat + ' (' + Object.keys(sedeObj.cats[cat][subcat]).join(', ') + '); ' }
							else if ( cat == iCat ) {  etiqs += Object.keys(sedeObj.cats[cat]).join('; ') }
							else if ( subcat == iCat ) {  etiqs += Object.keys(sedeObj.cats[cat][subcat]).join('; ') }
						}
					}
					cats = cats.replace(/\;\s*$/g,'');
					etiqs = etiqs.replace(/\;\s*$/g,'');
				}
				sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Tipo de movimiento:</p><p>' + sedeObj.t_mov + '</p></div>';
				sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Descripción:</p><p>' + sedeObj.descc + '</p></div>';
				sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Tipo de actividad:</p><p>' + sedeObj.t_act + '</p></div>';
				sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Tipo de venta:</p><p>' + sedeObj.t_vent + '</p></div>';
				if ( cats != "" ) {
					sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Categorías:</p><p>' + cats + '</p></div>';
				}
				if ( etiqs != "" ) {
					sedHTML += '<div class="row"><p class="rlabel text-left col-xs-4">Etiquetas:</p><p>' + etiqs + '</p></div>';					
				}
				if ( sedeObj.p_serv != undefined && sedeObj.p_serv != "" ) {
					sedHTML += '<div class="row p_serv"><p class="rlabel text-left col-xs-4">Paises (Regiones) de venta:</p><p>' + sedeObj.p_serv + '</p></div>';					
				}

			sedHTML += '</div>';
		sedHTML += '</div> <!-- media-bod -->';

		sedHTML += '</article>';
		return sedHTML;
	};	


  /**
   *
   * Busqueda Panel (Frontpage).
   * 
   */
	// Create HTML tab (jQuery)
	Drupal.theme.prototype.createTabPanel = function (tabList, id) {
		var tabid = "";
		var labels = "";
		var contents = "";
		for (var i=0; i<tabList.length; i++) {
			var tab = tabList[i];
			var active = (i == 0)? 'active': '';
			labels += '<li role="presentation" class="'+active+' "><a href="#'+tab.id+'" aria-controls="'+tab.id+'" role="tab" data-toggle="tab">'+tab.label+'</a></li>';
			contents += '<div role="tabpanel" class="tab-pane '+active+'" id="'+tab.id+'">' + tab.cont + '</div>';
		}
		if ( id !== undefined || id != "" ) {
			tabid = 'id='+id;
		}
		var tabHTML = '<ul '+tabid+' class="nav nav-tabs" role="tablist">'+labels+'</ul>';
		tabHTML += '<div class="tab-content">'+contents+'</div>';
		return '<div class="tab-despierta">'+tabHTML+'</div>';;
	};



  /**
   * Behaviors are Drupal's way of applying JavaScript to a page. In short, the
   * advantage of Behaviors over a simple 'document.ready()' lies in how it
   * interacts with content loaded through Ajax. Opposed to the
   * 'document.ready()' event which is only fired once when the page is
   * initially loaded, behaviors get re-executed whenever something is added to
   * the page through Ajax.
   *
   * You can attach as many behaviors as you wish. In fact, instead of overloading
   * a single behavior with multiple, completely unrelated tasks you should create
   * a separate behavior for every separate task.
   *
   * In most cases, there is no good reason to NOT wrap your JavaScript code in a
   * behavior.
   *
   * @param context
   *   The context for which the behavior is being executed. This is either the
   *   full page or a piece of HTML that was just added through Ajax.
   * @param settings
   *   An array of settings (added through drupal_add_js()). Instead of accessing
   *   Drupal.settings directly you should use this because of potential
   *   modifications made by the Ajax callback that also produced 'context'.
   */
	Drupal.behaviors.despiertaBehaviors = {
		attach: function (context, settings) {

// console.log("despiertaBehaviors");
// console.log(context);
// console.log(settings);
// ip_geoloc_getCurrentPosition(
// settings.ip_geoloc_menu_callback,
// settings.ip_geoloc_reverse_geocode,
// settings.ip_geoloc_refresh_page
// );

			// Changes titles for multiple pages
			// var urlVars = getUrlVars();
			if ( urlVars['q'] != undefined ) {
				if ( urlVars['q'] == "legal" ) {
					// change title
					$('h1[id="page-title"]').text("Aviso legal");
				}
				else if ( urlVars['q'] == "usuario" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
				else if ( urlVars['q'] == "usuario/login" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
				else if ( urlVars['q'] == "usuario/recuperar" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
				else if ( urlVars['q'].indexOf("user") >= 0 ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
				else if ( urlVars['q'] == "empresa/registro" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
			}			

			/* Change Breadcrumb from URL */
			$('div[id="breadcrumb"]', context).once('despierta', function () {
				// delete frontpage
				if ( urlVars === undefined || urlVars['q'] === undefined ) {
					$(this).remove();
				}
				else {
					var path = urlVars['q'].split('/');
					if ( path.length > 0 ) {
						// delete for: empresa,usuario
						if ( path[0] == "usuario" || path[0] == "empresa" ) {
							$(this).remove();
						}
						else { 
							var out = '<div class="breadcrumb">';
							out += '<a href="/despierta/">Inicio</a>';
							var p = '';						
							for ( var i=1; i <= path.length; i++) {
								var n = path[i-1];
								if ( n != '' ) {
									p += (p == '')? n : '/'+n;
									n = n.replace(/-/g,' ');
									n = n.capitalizeFirstLetter();
									if ( i == path.length ) { out += ' - <span>'+n+'</span>' }
									else { out += ' - <a href="/despierta/?q='+p+'">'+n+'</a>' }
								}
							}
							out += '</div>';
							$(this).html(out);

						}
					}
				}
			});
			/* Main Menu */
			$('div[id="main-menu"]', context).once('despierta', function () {
				$('ul[id="main-menu-links"]').addClass('nav navbar-nav navbar-right');
				// add 'hoja' img
				$('ul[id="main-menu-links"] li[class^="menu"]').each(function() {
					$(this).append('<img class="hoja" src="sites/default/files/hoja.png">');					
				});
			});


			/*
			 * PAIS/REGIONES
			 */
		

			/* Pais/Regiones View */
			$('div[id="block-views-tax-regiones-block"]', context).once('despierta', function () {

				// Create Object: Pais - Regions
				allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('.view-tax-regiones', this) );
				$('div[id="block-views-tax-regiones-block"]').remove();				

				// IP Geolocation!!!
				if ( sessionStorage['geolocation'] === "local" || sessionStorage.getItem('geolocation') === "local" ) {
					sessionStorage['geolocation'] = "local";
					sessionStorage.setItem('geolocation', "local");
				}
				else {
					if ( Drupal.settings.despierta !== null && Drupal.settings.despierta !== undefined && 
							Drupal.settings.despierta.session !== null && Drupal.settings.despierta.session !== undefined && 
							Drupal.settings.despierta.session.ip_geoloc !== null && Drupal.settings.despierta.session.ip_geoloc !== undefined 
					) {
						var ip_geoloc = Drupal.settings.despierta.session.ip_geoloc;
						if ( !jQuery.isEmptyObject(ip_geoloc) && ip_geoloc !== null && !jQuery.isEmptyObject(ip_geoloc.location) && ip_geoloc.location !== undefined ) {
							var geoloc = ip_geoloc.location;
							if ( geoloc.country !== undefined && geoloc.country_code !== undefined && geoloc.locality !== undefined && geoloc.administrative_area_level_1 !== undefined && geoloc.administrative_area_level_2 !== undefined ) {
								sessionStorage['geolocation'] = true;
								sessionStorage.setItem('geolocation', true);
								sessionStorage['country'] = geoloc['country'];
								sessionStorage['code'] = geoloc['country_code'];
								sessionStorage['locality'] = geoloc['locality'];
								sessionStorage['area'] = geoloc['administrative_area_level_2'];
								sessionStorage['area_code'] = geoloc['administrative_area_level_2_code'];
								sessionStorage['latitude'] = geoloc['latitude'];
								sessionStorage['longitude'] = geoloc['longitude'];
								// sessionStorage['country'] = geoloc['country'];
								// sessionStorage['code'] = geoloc['country_code'];
								// sessionStorage['locality'] = "Suances";
								// sessionStorage['area'] = "Cantabria";
								// sessionStorage['area_code'] = "S";
								// sessionStorage['latitude'] = geoloc['latitude'];
								// sessionStorage['longitude'] = geoloc['longitude'];
								var smsGeo = '<div id="messages"><div class="section clearfix">'+
													'<div class="nogeo messages status">'+
														'Geolocalización:<br>'+
														' Country: '+sessionStorage['country']+'; '+
														' Country_code: '+sessionStorage['code']+';'+
														' Area: '+sessionStorage['area']+';'+
														' Area_code: '+sessionStorage['area_code']+';'+
														' Locality: '+sessionStorage['locality']+';'+
														' Address: '+geoloc.formatted_address+
													'</div>'+
												'</div></div>';
								$('#page-wrapper').prepend(smsGeo);
							}
							else {
								sessionStorage['geolocation'] = false;
								sessionStorage.setItem('geolocation', false);
							}
						}
						else {
							sessionStorage['geolocation'] = false;
							sessionStorage.setItem('geolocation', false);
						}
					} else {
						sessionStorage['geolocation'] = false;
						sessionStorage.setItem('geolocation', false);						
					}
				}

				// Create HTML for 'Paises'
				var $paisHTML = Drupal.theme('paisSelectList', allPaisRegionsObj);
				$( '#header .region' ).prepend($paisHTML);

				// Create HTML for 'Regions'
				var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, sessionStorage['code']);
				$( '#header .region > div:nth-child(1)' ).after($regHTML);

				// Save 'sessionStorage' into 'options'
				Drupal.theme.prototype.selectPaisRegion(sessionStorage);

				// Apply 'pais/regions' options
				if ( sessionStorage['geolocation'] !== "false" || sessionStorage.getItem('geolocation') !== "false" ) {				
					Drupal.theme.prototype.applyRegionOption();
				}
				else {
					Drupal.theme.prototype.hideSedesPanel();
					$('div[id="loading"]').addClass('element-invisible');
					$('div[id="page-wrapper"]').css('display', 'block');
					$('#block-views-sedes-block').prepend(smsNoGeo);
					if ( $('#messages .messages:contains("Localizando")').length > 0 ) {
						$('#messages .messages:contains("Localizando")').addClass('element-invisible');
					}
				}
			});

			/* Search panel */
			// Create Busqueda Panel
			$('#block-views-frontpage-desc-busq-block', context).once('despierta', function () {

				// Extract simple search
				var simHTML = $( '#block-views-exp-sedes2-busq-simple' ).html();
				$( '#block-views-exp-sedes2-busq-simple' ).remove();

				// Create Advanced search from Tax View
				var avaHTML = $( '#block-views-exp-sedes2-busq-avan' ).html();
				$( '#block-views-exp-sedes2-busq-avan' ).remove();

				// Create HTML for 'Regions'
				var tabList = [{
					'id': 'tabBusqSimple',
					'label': 'Búsqueda Simple',
					'cont': simHTML
				},{
					'id': 'tabBusqAzanz',
					'label': 'Búsqueda Avanzada',
					'cont': avaHTML
				}];
				var tabHTML = Drupal.theme('createTabPanel', tabList);				
				$( '.view-content', this).append($('<div id="tabBusq" class="col-lg-8 col-md-8 col-sm-7 col-xs-12">' + tabHTML + '</div>'));

			});
			// Modify fields of Busqueda Panels
			$('form[id^="views-exposed-form-sedes2"] input').each( function() {
				$(this).addClass('form-control');
			});
			$('form[id^="views-exposed-form-sedes2"] select').each( function() {
				$(this).addClass('form-control');
			});
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-region"]' ).remove();			
			$('form[id^="views-exposed-form-sedes2"] .views-submit-button input').each( function() {
				$(this).addClass('btn btn-success');
				$(this).css('width', '69px');
			});
			$('form[id^="views-exposed-form-sedes2"] .views-reset-button input').each( function() {
				$(this).addClass('btn btn-success');
				$(this).css('width', '99px');
			});
			$('form[id^="views-exposed-form-sedes2"] input#edit-query').attr('placeholder', '¿Qué buscas?');

			// Avanzada
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-cat"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-subcat"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-nom"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] input[id="edit-nom"]' ).attr('placeholder', 'Nombre del anunciante');
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-act"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-mov"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-ven"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-pais"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-regions"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] input[id="edit-localidad"]' ).attr('placeholder', 'Localidad');
			// Advanced: Create panels
			$('form[id^="views-exposed-form-sedes2-busq-avan"] .views-exposed-form', context).once('despierta', function () {
				var avanHTML = '';
				avanHTML += '<div class="pull-left col-xs-12 col-md-4">'+
								'<label>¿Qué buscas?</label>'+
								$( 'div[id^="edit-cat-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-subcat-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-nom-wrapper"] .form-item', this ).html()+
							'</div>';
				avanHTML += '<div class="pull-left col-xs-12 col-md-4">'+
								'<label>¿Dónde?</label>'+
								$( 'div[id^="edit-pais-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-region-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-localidad-wrapper"] .form-item', this ).html()+
							'</div>';
				avanHTML += '<div class="pull-left col-xs-12 col-md-4">'+
								'<label>¿Características?</label>'+
								$( 'div[id^="edit-t-act-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-t-mov-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-t-ven-wrapper"] .form-item', this ).html()+
							'</div>';
				avanHTML += '<div class="pull-left col-xs-12">'+
								$( '.views-submit-button', this ).html()+
								$( '.views-reset-button', this ).html()+
							'</div>';
				$( '.views-exposed-widgets', this ).empty();
				$( '.views-exposed-widgets', this ).html(avanHTML);
				// Change pais code to label
				$('select[id="edit-pais"] > option', this).each(function(){
					var rcode2 = $(this).val();
					var rlabel = $( '#header select[id="sel-pais"] option[dp-pais-code="'+rcode2+'"]').val();
					$(this).text(rlabel);
				});
			});
			// Simple
			$('form[id^="views-exposed-form-sedes2-busq-simple"]', context).once('despierta', function () {
				Drupal.theme.prototype.modifySearchRegion();
			});			
			// Advanced
			$('form[id^="views-exposed-form-sedes2-busq-avan"] select[id="edit-pais"]', context).once('despierta', function () {
				Drupal.theme.prototype.modifySearchRegion();
			});


			/*
			* SEDES
			*/
			// Print new sedes view (Once)
			$(	'div[id="block-views-sedes-block"] .view-id-sedes.view-display-id-block, .view-id-sedes2').once("DOMSubtreeModified",function() {
				var subcats = {};
				var sedeHTML = "";

				// Jump in the case the session is not ready
				if ( jQuery.isEmptyObject(sessionStorage) || sessionStorage === undefined || sessionStorage.getItem('geolocation') === null ) {
					$(this).addClass('element-invisible');
					return;
				}

				// Content:
				if ( $('> div[class="view-content"]', this).length ) {
					// Create Object: Sedes
					var reportSedes = Drupal.theme.prototype.reportSedes($('.view-content', this));

					// Chech where we are...
					// in the frontpage: print all
					// in the category page: get sub-categories
					var tabAll = true;
					if ( urlVars['q'] !== undefined && urlVars['q'] !== "" && urlVars['q'].indexOf("directorio-verde") >= 0 ) {
						 tabAll = false;
					}

					// Print sedes list
					var sedeHTML = Drupal.theme('tabSedes', reportSedes, tabAll);
					$('> .view-content', this).append( $(sedeHTML) );
					$('> .view-content > div:not(.tab-despierta)', this).remove();

	 				// Event Click: sedes more info
					$('> .view-content', this).on( 'click', '.resultados .info.url', function() {
						// change to down (-> hide)
						if ( $('img',this).hasClass('more_info') ) {
							$('img',this).removeClass('more_info');
							$('img', this).rotate({ animateTo:0});
							$('span',this).html('+ info');
							$(this).closest('.media-bod').children('.masinfo').fadeOut(500);
							$('.subrayado', this).fadeOut(500);
							$(this).parents('article').animate({height: '140px'}, 500);
						}
						// change to up (-> show)
						else {
							$('img',this).addClass('more_info');
							$('img', this).rotate({ animateTo:180});
							$('span',this).html('- info');
							$(this).closest('.media-bod').children('.masinfo').fadeIn(500);
							// $(this).closest('.media-bod').children('.locinfo').css('display', 'block');
							$('.subrayado', this).fadeIn(500);
							$(this).parents('article').animate({height:'100%'}, 500);
						}
					});
					// Delete Paises en Venta
					$('> .view-content .p_serv', this).remove();
				}
				else { // NO RESULTS
					var noSedeHTML = '<div class="view-content">' + htmlNoResults + '</div>';
					$('> .view-filters', this).addClass('element-invisible');
					$('> .attachment .view-based-map', this).addClass('element-invisible');
					$(this).prepend( $(noSedeHTML) );
				}

				// Filter:
				// move elements and create a button that show/hide the elements
				if ( $('> .view-filters', this).length ) {
					$('> .view-filters', this).appendTo($(this));
					$('> .view-filters', this).prepend('<input type="button" class="load-sede-filter form-submit form-control btn btn-success" value="Cargar filtros">');
					$('> .view-filters ', this).on( 'click', '.load-sede-filter', function() {
						if ( $('form[id="views-exposed-form-sedes-block"]').hasClass('element-invisible') ) {
							$('form[id="views-exposed-form-sedes-block"]').removeClass('element-invisible');
						}
						else {
							$('form[id="views-exposed-form-sedes-block"]').addClass('element-invisible');
						}
					});
				}

			});

			/* Filter form: Sede */
			$('form[id="views-exposed-form-sedes-block"]', context).once('despierta', function () {
				var pais = $( '#header select[id="sel-pais"] option:selected').text();
				var pcode = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
				var region = $('#header select[id="sel-regions"] option:selected').text();
				var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
				// If user selects All regions
				if ( region == "Todas las regiones" ) {
					// delete redundance in regions, When we are in the category page:
					$('div[id="edit-field-sede-direccion-locality-selective-wrapper"] div[class*="form-item-edit-field-sede-direccion-locality-selective"],'+
						'div[id="edit-field-sede-direccion-administrative-area-selective-wrapper"] div[class*="form-item-edit-field-sede-direccion-administrative-area-selective"]', this).each( function() {
						var labregion = $('label', this).text();
						if ( allPaisRegionsObj[pcode] !== undefined ) {
							var id = labregion.toLowerCase();
							id = id.replace(/^\n*\s*/g,'');
							id = id.replace(/\n*\s*$/g,'');
							id = id.replace(/\s/g,'_');						
						}
					});	
				}
				// Remove description label
				$('div[class*="form-type-select"] div[class="description"]', this).remove();
				// Work with the filter form
				$(	'div[id="edit-field-sede-direccion-locality-selective-wrapper"], '+
					'div[id="edit-field-sede-direccion-administrative-area-selective-wrapper"], '+
					'div[id="edit-field-sede-tipo-actividad-tid-wrapper"], '+
					'div[id="edit-field-sede-tipo-movimiento-tid-wrapper"], '+
					'div[id="edit-field-sede-tipo-venta-tid-wrapper"], '+
					'div[id="edit-name-selective-wrapper"] ', this).once('despierta', function () {
						$(this).addClass('col-lg-6 col-md-6 col-s-12 col-sm-12 col-xs-12');
						$(' > label', this).wrap('<div class="ppal"></div>');
						$('.ppal', this).prepend( $('<input type="checkbox" id="all_filters">').change(function(event) {
							if ( $(this).is(':checked') ) {
								$(this).parent().siblings('.views-widget').find('input[type="checkbox"]').each(function(){
									$(this).prop('checked', true);
								});
							}
							else {
								$(this).parent().siblings('.views-widget').find('input[type="checkbox"]').each(function(){
									$(this).prop('checked', false);
								});
							}
						}) );
						// Check if all are checked
						$('#all_filters', this).prop('checked', true);
						$('.views-widget input[type="checkbox"]', this).each(function(){
							if ( !$(this).is(':checked') ) {
								$(this).parents('.views-widget').siblings('.ppal').find('input').prop('checked', false);
							}
						});
						// Change region code to label
						$( 'div[class*="form-item-edit-field-sede-direccion-administrative-area-selective"]', this ).each(function(){
							var rcode2 = $('input', this).val();
							var rlabel = $( '#header select[id="sel-regions"] option[dp-reg-code="'+rcode2+'"]').val();
							$('label', this).text(rlabel);
						});

				});
				// Capture change event
				$(this).change(function(event) {
					$('div[id="loading"]').removeClass('element-invisible');
				});
				// If Online is checheck Tipo de Venta change for online => filter
				$('div[id="edit-field-sede-tipo-venta-tid-wrapper"]', this).click(function(event) {
					var vType = "";
					$('input:checked', this).each( function() {
						// Establecimiento físico, Otros
						if ( $(this).val() == "1792" || $(this).val() == "1800" ) {
							vType += "fisico|";
						}
						// Venta Online, Alquiler online, Servicio Online, Servicio a domicilio, Venta telefónica, Reserva online, Reserva telefónica
						else if ( $(this).val() == "1793" || $(this).val() == "1794" || $(this).val() == "1795" || $(this).val() == "1796" || 
								  $(this).val() == "1797" || $(this).val() == "1798" || $(this).val() == "1799" ) {
							vType += "online|";
						}
					});
					if ( vType.indexOf("fisico") >= 0 ) {
						Drupal.theme.prototype.filterByRegionOnline('fisico');
					}
					else if ( vType.indexOf("online") >= 0 ) {
						Drupal.theme.prototype.filterByRegionOnline('online');
					}
					else {
						Drupal.theme.prototype.filterByRegionOnline();	
					}
				});				
			});


			/* Sede 'categories' */
			$('div[id="block-views-banners-block"]', context).once('despierta', function () {
				$(this).append('<hr>');
			});			


			/* Directorio Verde page */
			$('.view-despierta-directorio-verde', context).once('despierta', function () {
				$('div[class*="views-row"]', this).addClass("col-lg-4 col-md-4 col-s-6 col-sm-6 col-xs-12");
				$('div[class*="views-row"]', this).each( function() {
					$(this).wrapInner('<div class="fdoverde"></div>');
				});
				var otras = $('div[class*="views-row"]:contains("Más...")', this).get();
				$('div[class="view-content"]', this).append(otras);
				$('div[class*="views-field-field-imagen"] .field-content', this).each( function() {
					$(this).addClass('imgcateg');
				})
				$('div[class*="views-field-field-imagen"] img', this).each( function() {
					$(this).removeClass('img-responsive');
				})
			});


			/* Sede: Individual Page */
			$('div[id*="node-"].node-sede', context).once('despierta', function () {
				// Create Sedes Report
				var repSede = Drupal.theme.prototype.repSede( $('.content', this) );
				var cont = Drupal.theme('articleSede', repSede, "Todas");
				$(this).append('<section class="resultados">'+cont+'</section>');
				$('.resultados .info.url', this).remove();
				$('.resultados .masinfo', this).css('display', 'block');
				$('.resultados .media', this).css('height', 'auto');
				$('div[id*="node-"].node-sede .field-name-field-location .geofieldMap').prependTo('div[id*="node-"].node-sede .resultados .media .locinfo');
				$('.content', this).remove();
				$('#page-title').remove();				
			});

			/* Sede: Individual Page */
			$('.view-empresa-sedes', context).once('despierta', function () {
				if ( $('.view-content',this).length == 0 ) {
					$(this).append('<div class="view-content"><p>Actualmente, no hay ninguna sede registrada. Por favor, cree una mediante el menu "Opciones de gestión".</p></div>');
				}
				else {
					$('.view-content',this).prepend('<div class=""><a href="/despierta/?q=empresa/anadir/sede">Crear nueva asede</a></div>');
					$('.views-table', this).addClass("col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12");
					// $('.views-table', this).addClass("col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12");
					$('.views-table .views-field', this).each(function () {
						$(this).addClass("col-lg-3 col-md-3 col-s-3 col-sm-3 col-xs-3 text-center");
					});					
				}

			});


			/*
			 * FORMS PAGES
			*/			

			/* Contact form */
			$('form[id="contact-site-form"]', context).once('despierta', function () {
				$('input:not(.form-submit)', this).addClass("form-control");
				$('select', this).addClass("form-control");
				$('textarea', this).addClass("form-control");

				$('.form-item-name label[for="edit-name"]', this).contents().first()[0].textContent = "Nombre ";
				$('.form-item-name input[id="edit-name"]', this).attr('placeholder','Introduce el nombre');
				$('.form-item-mail label[for="edit-mail"]', this).contents().first()[0].textContent = "Correo electrónico ";
				$('.form-item-mail input[id="edit-mail"]', this).attr('placeholder','Introduce el e-mail');
				$('.form-item-message textarea[id="edit-message"]', this).attr('placeholder','Teclea su comentario');
				$('.form-item-message textarea[id="edit-message"]', this).css('resize', 'none');
				$('.form-item-cid label[for="edit-cid"]', this).contents().first()[0].textContent = "Motivo de la notificación ";
				$('.form-actions input[id="edit-submit"]', this).attr('value','Enviar');
				$('.form-actions input.form-submit', this).addClass("btn btn-success pull-left");
				

				var contHTML = '';
				contHTML += '<div class="form-horizontal cont-col1 col-lg-6 col-md-6 col-sm-6 col-xs-12">';
				contHTML += '</div>';
				contHTML += '<div class="form-horizontal cont-col2 col-lg-6 col-md-6 col-sm-6 col-xs-12">';
					contHTML += '<img src="sites/default/files/contactoxs.jpg">';
				contHTML += '</div>';
				contHTML += '<div class="form-group cont-row col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center clean">';
				contHTML += '</div>';
				$(this).append(contHTML);
				$('.form-item-name', this).appendTo('.cont-col1');
				$('.form-item-mail', this).appendTo('.cont-col1');
				$('.form-item-message', this).appendTo('.cont-col1');
				$('.captcha', this).appendTo('.cont-col1');
				$('.form-item-cid', this).prependTo('.cont-col2');
				$('.form-actions', this).appendTo('.cont-row');
			});


			/* Login form page */			
			$('form[id="user-login"]', context).once('despierta', function () {
				$('input:not(.form-submit)', this).addClass("form-control");
				$('input.form-submit', this).addClass("btn btn-success pull-right");
			});

			/* Pass form page */			
			$('form[id="user-pass"]', context).once('despierta', function () {
				$('input:not(.form-submit)', this).addClass("form-control");
				$('input.form-submit', this).addClass("btn btn-success pull-right");
			});

			/* Register form page */
			$('form[id="user-register-form"]', context).once('despierta', function () {
				$('input:not(.form-submit,.form-checkbox)', this).addClass("form-control");

				$('div[id="field-repetir-contrasena-add-more-wrapper"] .description', this).empty();
				$('input[id="edit-field-repetir-contrasena-und-0-pass1"]', this).attr('placeholder','Introduce la contraseña');
				$('input[id="edit-field-repetir-contrasena-und-0-pass2"]', this).attr('placeholder','Repite la contraseña');
				$('input[id="edit-field-nombre-razon-social-und-0-value"]', this).attr('placeholder','Introduce tu nombre de anunciante');
				
				$('#edit-legal legend', this).remove();
				var legalHTML = '<label class="option" for="edit-legal-accept">Acepto los <a href="/despierta/?q=legal">términos y condiciones</a> de nuestros servicios <span class="form-required" title="Este campo es obligatorio.">*</span></label>';
				$('label[for="edit-legal-accept"]').replaceWith(legalHTML);

				$('#edit-simplenews .fieldset-description', this).remove();

				$('input.form-submit', this).addClass("btn btn-success pull-right");
			});

			/* Sedes form page */
			$('form[id="sede-node-form"]', context).once('despierta', function () {
				$('input:not(.form-submit,.form-checkbox)', this).addClass("form-control");
				$('select:not(select[id^="edit-field-sede-pais-und-hierarchical-select-selects"])', this).addClass("form-control");

				$('input[id="edit-title"]', this).attr('placeholder','Introduce el nombre comercial como anunciante para esta Sede');
				$('input[id="edit-field-sede-descripcion-breve-und-0-value"]', this).attr('placeholder','Introduce una descripción breve de la entidad');
				$('input[id="edit-field-sede-descripcion-breve-und-0-value"]', this).css('resize', 'none');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).attr('placeholder','Incluye todas las palabras, productos y servicios con los que trabaja tu entidad para que ésta sea más fácil de localizar en nuestro Buscador Verde');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).css('resize', 'none');

				$('div[class^="term-reference-tree-button"]', this).css('cursor', 'pointer');

				$('input[id="edit-field-sede-email-und-0-email"]', this).attr('placeholder','Introduce un correo electrónico de tu Sede');
				$('input[id="edit-field-sede-web-und-0-value"]', this).attr('placeholder','www.tupagina.com');
				$('input[id="edit-field-sede-telefono-und-0-value"]', this).attr('placeholder','Introduce el teléfono de tu Sede');

				$('input[id="edit-field-sede-region-venta-und-hierarchical-select-dropbox-add"]', this).addClass("btn btn-success pull-right");

				$('input[id="edit-submit"]', this).addClass("btn btn-success pull-right");
				$('input[id="edit-preview"]', this).remove();
			});
			// Changes within 'Categorias/Subcategorias/Etiq'
			$('select[id^="edit-field-directorio-verde-und-hierarchical-select-selects"]').once("DOMSubtreeModified",function(){
				$('form[id="sede-node-form"] #edit-field-directorio-verde .hierarchical-select ').css('display', 'table');				
				$('form[id="sede-node-form"] #edit-field-directorio-verde select').addClass("form-control");
				$('form[id="sede-node-form"] #edit-field-directorio-verde input').addClass("btn btn-info");
				$('form[id="sede-node-form"] #edit-field-directorio-verde input').wrap('<div class="edit-field-sede-pais-button"></div>');
				$('form[id="sede-node-form"] #edit-field-directorio-verde table tr[class*="dropbox-is-empty"]').replaceWith('<td>Ninguna palabre clave seleccionada.</td>');				
			});
			$('form[id="sede-node-form"] #edit-field-directorio-verde .dropbox').once("DOMSubtreeModified",function(){
				$('table tr[class*="dropbox-entry"]', this).each( function() {
					if ( $('.hierarchical-select-item-separator', this).length == 0 ) {
						$('.dropbox-item.dropbox-selected-item', this).append('<span class="dropbox-item dropbox-selected-item"> (Todas las palabras clave) </span>');
					}
				});
			});			
			// Changes when the country of direction has been modified
			$('select[id^="edit-field-sede-direccion-und-0-country"]').once("DOMSubtreeModified",function(){
				$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] legend').remove();
				$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] input').addClass("form-control");
				$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] select').addClass("form-control");
				$('form[id="sede-node-form"] label[for*="edit-field-sede-direccion-und-0-country"]').html('País ');
				$('form[id="sede-node-form"] label[for*="edit-field-sede-direccion-und-0-thoroughfare"]').html('Dirección ');
				$('form[id="sede-node-form"] input[id*="edit-field-sede-direccion-und-0-thoroughfare"]').attr('placeholder','Introduce la dirección de la sede');
				$('form[id="sede-node-form"] label[for*="edit-field-sede-direccion-und-0-postal-code"]').html('Código Postal ');
				$('form[id="sede-node-form"] input[id*="edit-field-sede-direccion-und-0-postal-code"]').attr('placeholder','Introduce el código postal de la sede');
				$('form[id="sede-node-form"] label[for*="edit-field-sede-direccion-und-0-locality"]').html('Ciudad ');
				$('form[id="sede-node-form"] input[id*="edit-field-sede-direccion-und-0-locality"]').attr('placeholder','Introduce la ciudad de la sede');
				$('form[id="sede-node-form"] label[for*="edit-field-sede-direccion-und-0-administrative-area"]').html('Región ');
				$('form[id="sede-node-form"] input[id*="edit-field-sede-direccion-und-0-administrative-area"]').attr('placeholder','Introduce la región de la sede');
				$('form[id="sede-node-form"] div[class*="form-item-field-sede-direccion-und-0-premise"]').remove();
				$('form[id="sede-node-form"] div[class*="form-item-field-sede-direccion-und-0-dependent-locality"]').remove();
				// Direccion required if 'establecimiento fisico' is checked
				if ( $('form[id="sede-node-form"] input[id="edit-field-sede-tipo-venta-und-1792"]').is(':checked') ) {
					$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] .fieldset-description').each( function() {
						$(this).append(' <span class="form-required">*</span>');
					});
				}
			});
			// Changes for 'logo'
			$('div[id^="edit-field-sede-logo"]').once("DOMSubtreeModified",function(){
				$('input[id="edit-field-sede-logo-und-0-upload"], input[id="edit-field-sede-logo-und-0-remove-button"]', this).addClass("filestyle");
				$('input[id="edit-field-sede-logo-und-0-upload-button"], input[id="edit-field-sede-logo-und-0-remove-button"]', this).addClass("btn btn-info");
				$('input[id="edit-field-sede-logo-und-0-upload-button"]', this).attr('value','Subir Imagen');
				$('input[id="edit-field-sede-logo-und-0-remove-button"]', this).attr('value','Eliminar Imagen');
			});
			// Changes for 'Pais/regiones'
			$('select[id^="edit-field-sede-pais-und-hierarchical-select-selects"]').once("DOMSubtreeModified",function(){
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] div[class*="hierarchical-select"]').css('display', 'table');				
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] select').addClass("form-control");
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] input').addClass("btn btn-info");
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] input').wrap('<div class="edit-field-sede-pais-button"></div>');
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] table tr[class*="dropbox-is-empty"]').replaceWith('<td>Ningún país/región ha sido seleccionado.</td>');				
			});
			$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] .dropbox').once("DOMSubtreeModified",function(){
				$('table tr[class*="dropbox-entry"]', this).each( function() {
					if ( $('.hierarchical-select-item-separator', this).length == 0 ) {
						$('.dropbox-item.dropbox-selected-item', this).append('<span class="dropbox-item dropbox-selected-item"> (Todas las regiones) </span>');
					}
				});
			});


			/* User form page */
			$('form[id="user-profile-form"]', context).once('despierta', function () {
				$('#edit-timezone', this).remove();
				$('#edit-locale', this).remove();
				$('#edit-contact', this).remove();
				$('#edit-picture', this).remove();
				$('#edit-legal legend', this).remove();

					

				$('#edit-field-nombre-razon-social', this).appendTo('#edit-account');

				$('input:not(.form-submit,.form-checkbox)', this).addClass("form-control");
				$('input[id="edit-submit"]', this).addClass("btn btn-success pull-right");
				
			});

			/* Footer blocks */
			$('.view-despierta-pie', context).once('despierta', function () {
				$('img', this).each( function() {
					$(this).addClass('imgfooter');
				})
			});
			$('.view-frontpage-desc', context).once('despierta', function () {
				$('img', this).each( function() {
					$(this).addClass('imgeco');
				})
			});
			$('.region-triptych-first').addClass('col-md-4');
			$('.region-triptych-middle').addClass('col-md-4');
			$('.region-triptych-last').addClass('col-md-4');


			/*
			 * For functionality...
			 */
			 // hide
			 // Drupal.theme.prototype.hideSedesPanel();
			// show depending on...
			if ( 	$(context).prop("tagName") == "FORM" && context.context !== undefined &&
					$(context).attr('id') == "views-exposed-form-sedes-block"
			) {
				Drupal.theme.prototype.showSedesPanel();

				$('#tabSedes').tabCollapse({
					tabsClass: 'hidden-sm hidden-xs',
					accordionClass: 'visible-sm visible-xs'
				});
			}
			else {
				if ( $('div[id="block-views-sedes-block"]').length == 0 ) {
					$('div[id="loading"]').addClass('element-invisible');
				}
				$('div[id="page-wrapper"]').css('display', 'block');
			}

			/* Events even in the elements that have been created dynamically.
			 * Then, this part has to be at the end of code.
			 */
			// Active Busqueda tabs
			$('#tabBusq').delegate('ul a', 'click', function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			// Changes in the 'pais/region' options:
			// Has to be 'delegate' because it is created dynamically
			$(context).delegate('#header select[id="sel-pais"], #header select[id="sel-regions"]', 'change', function(event) {
				// country has been changed. rewrite 'region' options
				if ( $(this).attr('id') == "sel-pais" ) {
					var pais = $( 'option:selected', this ).text();
					var code = $('option:selected', this ).attr('dp-pais-code');
					var region = "";
					sessionStorage['country'] = pais;
					sessionStorage['code'] = code;
					sessionStorage['area'] = region;					
					var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, code);
					$( '#header div[class="sel-regions"]' ).replaceWith($regHTML);					
				}
				// region has been changed
				else if ( $(this).attr('id') == "sel-regions" ) {
					var region = $( 'option:selected', this ).text();
					if ( region == "Todas las regiones" ) { region = "" }
					sessionStorage['area'] = region;
				}

				// Apply 'pais/regions' options
				Drupal.theme.prototype.applyRegionOption();

				sessionStorage['geolocation'] = "local";
				$('#messages .nogeo').remove();

			});
			// Changes in the 'pais/region' options (Advances Search panel):
			$(context).delegate('form[id="views-exposed-form-sedes2-busq-avan"] #edit-pais', 'change', function(event) {
				Drupal.theme.prototype.modifySearchRegion();
			});
			// Add classes for the new 'sedes' pages
			$('#block-views-sedes-block .view-id-sedes > .view-content .tab-despierta .nav-tabs').addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12');
			$('#block-views-sedes-block .view-id-sedes > .view-content .tab-despierta .tab-content').addClass('col-lg-7 col-md-7 col-s-12 col-sm-12 col-xs-12 pull-left');
			$('#block-views-sedes-block .view-id-sedes > .attachment').addClass('col-lg-5 col-md-5  col-s-12 col-sm-12 col-xs-12 pull-right');
			$('#block-views-sedes-block .view-id-sedes > .view-filters').addClass('col-lg-5 col-md-5  col-s-12 col-sm-12 col-xs-12 pull-right');
			// none forever
			$('.ajax-progress-throbber').addClass('element-invisible');
			$('form[id="views-exposed-form-sedes-block"]').addClass('element-invisible');
			$('#block-views-sedes-block #edit-field-sede-direccion-locality-selective-wrapper').css('display', 'none');
			$('#block-views-sedes-block #edit-field-sede-direccion-administrative-area-selective-wrapper').css('display', 'none');
			$('#block-views-sedes-block #edit-field-sede-direccion-country-wrapper').css('display', 'none');
			$('#block-views-sedes-block #edit-field-sede-pais-tid-wrapper').css('display', 'none');
			$('#views-exposed-form-sedes2-busq-simple #edit-pais-wrapper').css('display', 'none');			
		} // end: attach of despierta theme
	};

})(jQuery);