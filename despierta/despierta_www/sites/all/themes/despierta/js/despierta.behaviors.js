(function ($) {

// Bug fixed: After travelling back in Firefox history, JavaScript won't run
// Adding this empty function, it works
window.onunload = function(){}

// Window Load
$(window).load(function () {
	// Reset form
	$('form[id="views-exposed-form-sedes-report-geo"]').trigger('reset');

	// Select specific 'pais/region/category'
	if ( definedGeoSessionVars() ) {
		if (
		sessionStorage['geolocation'] !== "true" || sessionStorage.getItem('geolocation') !== "true" || 
		sessionStorage['geolocation'] !== "local" || sessionStorage.getItem('geolocation') !== "local"
		) {
			var session = {};
			if ( sessionStorage['code'] !== undefined && sessionStorage['code'] !== null) { session.pcode = sessionStorage['code'] }
			if ( sessionStorage['area_code'] !== undefined && sessionStorage['area_code'] !== null) { session.rcode = sessionStorage['area_code'] }
			if ( sessionStorage['cat_code'] !== undefined && sessionStorage['cat_code'] !== null) { session.catcode = sessionStorage['cat_code'] }
			Drupal.theme.prototype.initHederPanel(session.pcode, session.rcode, session.catcode);
		}
		// The page is ready
		Drupal.theme.prototype.isReady();
	}
});


/**
* Global vars
*/
	//var despiertaTimeOut = 15000;
	var urlPaths = getUrlPaths();
	var htmlNoResults = '<div class="view-empty">'+
							'<div class="alert alert-warning" role="alert">'+
							'No hay entidades registradas en esta región, '+
							'si desea registrar su entidad acceda al menú de registro o, '+
							'si por el contrario quiere notificarnos la existencia de alguna, '+
							'póngase en contacto con nosotros'+
							'</div>'+
						'</section>';
	var smsNoGeo = '<section class="no-resultados">'+
							'<div class="alert alert-warning" role="alert">'+
								'Actualmente no tiene activado la geolocalización, o su navegador no lo permite. '+
								'Le recomentamos que lo active, o en su defecto, '+
								'seleccione el país y regiones mediante las opciones del panel superior derecho en la web.'+
							'</div>'+
						'</section>';
    var smsNoGeoTimeOut = '<section class="no-resultados">'+
                '<div class="alert alert-warning" role="alert">'+
                  'Problemas de geolocalización ajenos a la web. Se ha superado el tiempo de búsqueda localizando. '+
                  'Si persiste el problema, localice sus sedes modificando el panel superior derecho en la web.'+
                '</div>'+
              '</section>';
	var smsLocalating = '<div id="messages"><div class="section clearfix">'+
						'<div class="locating messages status">'+
							'Localizando su posición...'+
						'</div>'+
					'</div></div>';
	var noSedeRegistrada = '<div class="section clearfix"><div class="nosederegister messages status">'+
							'Actualmente, no hay ninguna sede registrada. Por favor, cree una mediante el menu "Opciones de gestión".'+
							'</div></div>';


/**
*
* GLOBAL functions.
* 
*/

/* New functions */
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
/* Read a page's GET URL variables and return them as an associative array. */
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
/* Geolocation */
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
/* Check Session */
	function definedGeoSessionVars() {
		if (
			!jQuery.isEmptyObject(sessionStorage) 			&& !sessionStorage !== undefined &&
			sessionStorage['geolocation'] !== undefined 	&& sessionStorage.getItem('geolocation') !== undefined &&
			sessionStorage['geolocation'] !== null 			&& sessionStorage.getItem('geolocation') !== null &&
			sessionStorage['code'] !== undefined 			&& sessionStorage.getItem('code') !== undefined && 
			sessionStorage['code'] !== null 				&& sessionStorage.getItem('code') !== null && 
			sessionStorage['code'] !== '' 					&& sessionStorage.getItem('code') !== '' && 
			sessionStorage['area_code'] !== undefined 		&& sessionStorage.getItem('area_code') !== undefined && 
			sessionStorage['area_code'] !== null 			&& sessionStorage.getItem('area_code') !== null && 
			sessionStorage['area_code'] !== '' 				&& sessionStorage.getItem('area_code') !== ''
		) {
			return true;
		}
		else {
			return false;
		}
	}
	function extractSessionVars() {
		var session = {};

		// Create REgion only in the case the 'Session' variables are ready.
		if ( definedGeoSessionVars() ) {
			if (
			sessionStorage['geolocation'] !== "true" || sessionStorage.getItem('geolocation') !== "true" || 
			sessionStorage['geolocation'] !== "local" || sessionStorage.getItem('geolocation') !== "local"
			) {
				if ( sessionStorage['code'] !== undefined && sessionStorage['code'] !== null) { session.pcode = sessionStorage['code'] }
				if ( sessionStorage['area_code'] !== undefined && sessionStorage['area_code'] !== null) { session.rcode = sessionStorage['area_code'] }
				if ( sessionStorage['cat_code'] !== undefined && sessionStorage['cat_code'] !== null) { session.catcode = sessionStorage['cat_code'] }
			}
		}
		else {
			return undefined ;
		}
		return session;	
	}


/**
*
* PROTOTYPE functions.
* 
*/

/* Redirect region location */
	Drupal.theme.prototype.createRegionURL = function (url) {
		Drupal.theme.prototype.isLoading(undefined, 0.5); // active loading page
		var location = '';
		var pcode = sessionStorage['code'];
		var rcode = sessionStorage['area_code'];
		var catcode = sessionStorage['cat_code'];
		var dcode = '';
		var searchkeys = '';
		if ( $('#header input[id="sel-search"]').val() !== '' ) {
			searchkeys = '&keys=' + encodeURI( $('#header input[id="sel-search"]').val() );
		}		
		if ( url !== undefined && url.length > 0 && ( url[0] === 'directorio-verde' || url[0] === 'busq' ) ) {
			location = '?q=' + url[0] + '/' + pcode + '/'+ rcode + '/' + catcode + searchkeys;
		}
		else if (url !== undefined && url.length === 0) { // frontpage
			catcode = 'all';
			location = '?q=busq' + '/' + pcode + '/'+ rcode + '/' + catcode + searchkeys;
		}
		else { // the rest of pages
			location = '?q=directorio-verde' + '/' + pcode + '/'+ rcode + '/' + catcode + searchkeys;	
		}
		return location;
	}
/* Is Ready the geolocation and the website? */
	Drupal.theme.prototype.isReady = function () {
		if ( definedGeoSessionVars() ) {
			if ( $('#loading').css('display') === "block" ) {
				$('#loading').css('display', 'none');
				if ( jQuery.isEmptyObject(sessionStorage) || sessionStorage === undefined || sessionStorage['geolocation'] === undefined || sessionStorage.getItem('geolocation') === undefined || sessionStorage.getItem('geolocation') === null ) {
					$('#loading').css('display', 'none');
					if ( $('#block-views-sedes-report-geo .view-sedes-report > .view-empty').length > 0 ) {
						$('#block-views-sedes-report-geo .view-sedes-report > .view-empty').html(smsNoGeoTimeOut);
					}
				}
			}
		}
	};
/* Active loading page */
	Drupal.theme.prototype.isLoading = function (context, opacity) {
		if ( $('#loading').css('display') === "none" ) {
			// when the root page has not 'home'
			if ( urlPaths === undefined || urlPaths.length === 0 ) {
				$('#loading').css('display', 'block');
			}
			if ( urlPaths !== undefined && urlPaths.length > 0 && ( (urlPaths[0] === 'directorio-verde' || urlPaths[0] === 'busq') && urlPaths.length >= 4 && urlPaths[3] !== '' ) ) {
				if ( context !== undefined && $(context).prop("tagName") === undefined && $(context).prop("tagName") !== "FORM" ) {
					$('#loading').css('display', 'block');
				}
				else if ( context === undefined ) {
					$('#loading').css('display', 'block');
				}
			}
			if ( opacity !== undefined ) {
				$('#loading .background').css('opacity', opacity);
			}
		}
	};
	// Change title adding the region
	Drupal.theme.prototype.getTitleRegion = function (title) {
 		var prefixtitle = title.substring(0, title.indexOf(" en "));
		if ( prefixtitle != "" ) { title = prefixtitle }
		var region = $('select[id="sel-regions"] option:selected').text();
		var pais = $('select[id="sel-pais"] option:selected').text();
		var rtitle = title;
		if ( region == "Todas las regiones" ) {
			rtitle += " en " + pais;
		}
		else if ( region !== "" ) {
			rtitle += " en " + region;
		}
		return rtitle;
	};
	// Change 'directorio-verde' menu
	Drupal.theme.prototype.changeLinkToRegion = function () {
		var pcode = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
		var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
		var dcode = $( '#header select[id="sel-categoria"] option:selected').attr('dp-cat-tid');
		rcode = ( rcode === undefined ) ? '-' : rcode;

		// change directorio-verde menu
		var $menu = $('#main-menu-links li[class^="menu"] a[href*="directorio-verde"]');
		var opath = $menu.attr('href');
		opath = opath.replace(/directorio-verde([^\$]*)$/g,'directorio-verde');
		var npath = opath + '/' + pcode + '/' + rcode ;
		$menu.attr('href', npath);

		// change URL from directorio-verde grid
		$('#block-views-categorias-block .view-categorias > .view-content .views-row').each(function() {
			var $menu = $('.field-content > a', this);
			var opath = $menu.attr('href');
			var opaths = opath.split('/');
			var catcode = opaths[opaths.length-1];
			var npath = opath.replace(/directorio-verde.*$/g,'directorio-verde'+'/'+pcode+'/'+rcode+'/'+catcode);
			$menu.attr('href', npath);
		});
	};

/**
*
* Functions for: Pais / Regions / Categories Panel.
* 
*/

/* Create Object: Pais - Regions */
	Drupal.theme.prototype.categoriasObj = function (elem) {
		var categorias = [];
		$('.views-row', elem).map( function () {
			var tid = $('.views-field-tid > .field-content',this).text();
			tid = tid.replace(/^\n*\s*/g,''); tid = tid.replace(/\n*\s*$/g,'');
			var name = $('.views-field-name > .field-content',this).text();
			name = name.replace(/^\n*\s*/g,''); name = name.replace(/\n*\s*$/g,'');
			categorias.push({
				'tid': tid,
				'name': name
			});
		});
		return categorias;
	};
/* Create Object: Pais - Regions */
	Drupal.theme.prototype.paisRegionesObj = function (elem) {
		var paises = {};
		$('div[class="region"]', elem).map( function () {
			var region = $(this).text();
			var pais = $(this).attr('dp-pais');
			var pcode = $(this).attr('dp-pais-code').toLowerCase();
			var rcode = $(this).attr('dp-region-code').toLowerCase();
			if ( paises[pcode] === undefined ) {
				paises[pcode] = {
					'name': pais,
					'regions': {}
				};
			}
			if ( paises[pcode].regions[rcode] === undefined ) {
				paises[pcode].regions[rcode] = {
					'name': region
				};
			}
		});
		return paises;
	};
	Drupal.theme.prototype.paisRegionesNameObj = function (elem) {
		var paises = {};
		$('div[class="region"]', elem).map( function () {
			var region = $(this).text().toLowerCase();
			region = region.replace(/^\n*\s*/g,'');
			region = region.replace(/\n*\s*$/g,'');
			var region_id = region;
			region_id = region_id.replace(/\s/g,'_');
			var pais = $(this).attr('dp-pais');
			var pcode = $(this).attr('dp-pais-code').toLowerCase();
			var rcode = $(this).attr('dp-region-code').toLowerCase();
			if ( paises[pcode] === undefined ) {
				paises[pcode] = {
					'name': pais,
					'regions': {}
				};
			}
			if ( paises[pcode].regions[region] === undefined ) {
				paises[pcode].regions[region] = {
					'code': rcode,
					'name': region
				};
			}
		});
		return paises;
	};	
/* Create the panel region */
	Drupal.theme.prototype.createRegionPanel = function (regions, categorias) {
		var pcode = '';
		var rcode = '';
		var catcode = '';
		// Create REgion only in the case the 'Session' variables are ready.
		if ( definedGeoSessionVars() ) {
			if (
			sessionStorage['geolocation'] !== "true" || sessionStorage.getItem('geolocation') !== "true" || 
			sessionStorage['geolocation'] !== "local" || sessionStorage.getItem('geolocation') !== "local"
			) {
				if ( sessionStorage['code'] !== undefined && sessionStorage['code'] !== null) { pcode = sessionStorage['code'] }
				if ( sessionStorage['area_code'] !== undefined && sessionStorage['area_code'] !== null) { rcode = sessionStorage['area_code'] }
				if ( sessionStorage['cat_code'] !== undefined && sessionStorage['cat_code'] !== null) { catcode = sessionStorage['cat_code'] }
			}
		}
		else {
			return ;
		}

// BEGIN-TEMPORAL:!!! BORRAR EN PRODUCCION
// var smsGeo = '<div class="section clearfix">'+
//         '<div class="nogeo messages status">'+
//           'Geolocalización: '+sessionStorage['geolocation']+'<br>'+
//           ' Country: '+sessionStorage['country']+'; '+
//           ' Country_code: '+sessionStorage['code']+';'+
//           ' Area: '+sessionStorage['area']+';'+
//           ' Area_code: '+sessionStorage['area_code']+';'+
//           ' Locality: '+sessionStorage['locality']+';'+
//           ' Address: '+sessionStorage['formatted_address']+
//         '</div>'+
//       '</div>';
// if ( $('#page-wrapper #messages').length === 0 ) {      
// $('#page-wrapper').prepend('<div id="messages">'+ smsGeo + '</div>');
// }
// else {
// $('#page-wrapper #messages').html(smsGeo);	
// }
// END-TEMPORAL:!!! BORRAR EN PRODUCCION


		// Create HTML for 'Paises'
		var html = Drupal.theme('paisSelectList', regions);
		if ( $('#header .region > .sel-pais').length === 0 ) {
			$( '#header .region' ).prepend('<div class="sel-pais">' + html + '</div>');
		}
		else {
			$( '#header .region > .sel-pais' ).html(html);
		}

		// Create HTML for 'Regions'
		var html = Drupal.theme('regionesSelectList', regions, pcode);
		if ( $('#header .region > .sel-regions').length === 0 ) {			
			$( '#header .region > div:nth-child(1)' ).after('<div class="sel-regions">' + html + '</div>');
		}
		else {
			$( '#header .region > .sel-regions' ).html(html);	
		}

		// Create HTML for 'Categorias'
		var html = Drupal.theme('categorySelectList', categorias);
		if ( $('#header .region > .sel-categoria').length === 0 ) {			
			$( '#header .region > div:nth-child(2)' ).after('<div class="sel-categoria">' + html + '</div>');
		}
		else {
			$( '#header .region > .sel-categoria' ).html(html);	
		}

		// Create HTML for 'Search' input text
		var html = Drupal.theme.prototype.searchSelectList();
		if ( $('#header .region > .sel-search').length === 0 ) {			
			$( '#header .region > div:nth-child(3)' ).after('<div class="sel-search">' + html + '</div>');
		}
		else {
			$( '#header .region > .sel-search' ).html(html);	
		}

		// Create HTML for 'Apply' Button
		var html = Drupal.theme.prototype.applySelectList();
		if ( $('#header .region > .sel-button').length === 0 ) {
			$( '#header .region > div:nth-child(4)' ).after('<div class="sel-button">' + html + '</div>');
		}
		else {
			$( '#header .region > .sel-button' ).html(html);	
		}

		// // Select specific 'pais/region/category'
		Drupal.theme.prototype.initHederPanel(pcode, rcode, catcode);

		// Create Buscador Verde Search Panel
		if ( $('#block-views-buscador-verde-busq-block').length > 0 ) {
			Drupal.theme.prototype.createBusqVerdePanel();
		}

		// change directorio-verde menu
		Drupal.theme.prototype.changeLinkToRegion();

		// Add hr if we are not in the frontpage
		// if ( urlPaths !== undefined && urlPaths.length > 0 && $('#header hr').length === 0 ) {
		// 	$('#header').append('<hr>');
		// }
		if ( urlPaths !== undefined && urlPaths.length === 0 ) {
console.log(urlPaths);
			$('#header hr').css('display', 'none');
		}

		// Remove 'Anunciate (Register)' link for all pages except in frontpage
		if ( urlPaths !== undefined && urlPaths.length > 0 ) {
			$('#header .block-welcome-username a[dp-class="unete"]').remove();
		}		
	};	
/* Create HTML select option */
	Drupal.theme.prototype.paisSelectList = function (paisRegions) {
		var selHTML = '<select id="sel-pais" class="round">';
		for (var pCode in paisRegions) {
			var pais = paisRegions[pCode].name;
			selHTML += '<option value="'+pais+'" dp-pais-code="'+pCode+'">' + pais + '</option>';
		}
		selHTML += '</select>';
		return selHTML;
	};
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, inCode) {
		var selHTML = '<select id="sel-regions" class="round">';		
		if ( inCode !== undefined && inCode !== "" && inCode !== "-" ) {
			selHTML += '<option value="-" dp-reg-code="-">Todas las regiones</option>';
			var code = inCode;
			for (var rCode in paisRegions[code].regions)  {
				var region = paisRegions[code].regions[rCode];
				selHTML += '<option value="'+rCode+'" dp-reg-code="'+rCode+'">'+region.name+'</option>';
			}
		}
		else {
			selHTML += '<option value="" dp-reg-code="-">Primero seleccione un país</option>';
		}
		selHTML += '</select>';
		return selHTML;
	};	
	Drupal.theme.prototype.categorySelectList = function (categorias) {
		var selHTML = '<select id="sel-categoria" class="round">';
		selHTML += '<option value="all" dp-cat-tid="all">Todas las categorías</option>';
		for ( var i=0; i < categorias.length; i++ ) {
			var cat = categorias[i];
			var tid = cat.tid;
			var name = cat.name;
			selHTML += '<option value="'+tid+'" dp-cat-tid="'+tid+'">' + name + '</option>';
		}
		selHTML += '</select>';
		return selHTML;
	};
	Drupal.theme.prototype.searchSelectList = function () {
		var selHTML = '<input type="text" id="sel-search" class="" value="" placeholder="¿Qué estás buscando?">';
		return selHTML;
	};
	Drupal.theme.prototype.applySelectList = function () {
		var selHTML = '<button id="sel-button" type="button" class="btn btn-success"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>';
		return selHTML;
	};
/* Select: Specific Pais - Region (for Geolocation) */
	Drupal.theme.prototype.initHederPanel = function (pcode,rcode,ccode) {
		if ( pcode !== undefined || pcode !== null || pcode !== "" ) {
			$('select[id="sel-pais"] > option[dp-pais-code="'+pcode+'"]').prop('selected', true);
		}
		if ( rcode !== undefined || rcode !== null || rcode !== "" ) {
			$('select[id="sel-regions"] > option[dp-reg-code="'+rcode+'"]').prop('selected', true);
		}
		else {
			$('select[id="sel-regions"] > option[value="-"]').prop('selected', true);
		}
		if ( ccode !== undefined || ccode !== null || ccode !== "" ) {
			$('select[id="sel-categoria"] > option[dp-cat-tid="'+ccode+'"]').prop('selected', true);
		}
		else {
			$('select[id="sel-categoria"] > option[value="all"]').prop('selected', true);
		}
		if ( $('#block-views-sedes-report-geo #edit-keys-wrapper input[id="edit-keys"]').val() !== '' ) {
			var text = $('#block-views-sedes-report-geo #edit-keys-wrapper input[id="edit-keys"]').val();
			$('input[id="sel-search"]').val(text);
		}
		else {
			$('input[id="sel-search"]').val('');
		}
	};
/* Create Buscador Verde */
	Drupal.theme.prototype.createBusqVerdePanel = function (context) {
		// Move 
		$('#block-views-buscador-verde-busq-block').appendTo( "#header .section" );

		// move logo and replace by reverse image
		$('#header #logo').prependTo('#header .region');
		$('#header #logo').addClass('front');
		var logo_img = $('#header #logo img').attr('src');
		logo_img = logo_img.replace(/\.png$/g,'_rev.png');
		$('#header #logo img').attr('src', logo_img);

		// create new 'buscador-verde-search' panel
		$('#block-views-buscador-verde-busq-block .content').append('<div class="buscador-verde-search"></div>');
		$('#header .region .sel-search').appendTo('#block-views-buscador-verde-busq-block .buscador-verde-search');
		$('#header .region .sel-regions').appendTo('#block-views-buscador-verde-busq-block .buscador-verde-search');
		$('#header .region .sel-button').appendTo('#block-views-buscador-verde-busq-block .buscador-verde-search');		
		$('#block-views-buscador-verde-busq-block .buscador-verde-search .sel-regions').prepend('<label for="sel-regions">Ubicación actual:</label>');
		$('#block-views-buscador-verde-busq-block .buscador-verde-search button#sel-button').text('Buscar');
		$('#block-views-buscador-verde-busq-block .buscador-verde-search button#sel-button span').remove();
		$('#header .region .sel-search').remove();
		$('#header .region .sel-regions').remove();
		$('#header .region .sel-button').remove();
		$('#header .region .sel-categoria').remove();

		// move background imgage
		var back_img = $('#block-views-buscador-verde-busq-block span.views-field-field-page-image img').attr('src');
		$('#header .section').css('background-image','url("'+back_img+'")');
		$('#header .section').addClass('buscador-verde');
		$('#block-views-buscador-verde-busq-block span.views-field-field-page-image').css('display', 'none');
	};

/**
*
* Functions for: SEDES Panel
* 
*/

	// Create report with a Sede
	Drupal.theme.prototype.repSede = function (elem, type) {
		var sede = {};
		// nid (only for Sedes view)
		if ( $('td[class$="views-field-nid"]', elem).length ) {
			var val = $('td[class$="views-field-nid"]', elem).text().replace(/\n*\s*/g,'');
			sede.nid = val;
		}
		// distance (only for Sedes view)
		if ( $('td[class$="views-field-field-geofield-distance"]', elem).length ) {
			var val = $('td[class$="views-field-field-geofield-distance"]', elem).text().replace(/\n*\s*/g,'');
			//sede.proximity = val;
			// NOTE: Now, does not work the geocoder proximity
			// SOLUTION: Use the "geoProximity" function!!
		}
		if ( $('td[class$="views-field-field-location"]', elem).length ) {
			var val = $('td[class$="views-field-field-location"]', elem).text().replace(/\n*\s*/g,'');
			if ( val !== undefined && val != "" ) {
				sede.location = jQuery.parseJSON( val );
				sede.proximity = geoProximity( parseFloat(sessionStorage['longitude']), parseFloat(sessionStorage['latitude']), sede.location.coordinates[0], sede.location.coordinates[1]);
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
		// type of sede: local or online
		if ( type !== undefined ) {
			sede.type = type;
		}

		return sede;
	};

	// // Create report with the list of Sedes
	Drupal.theme.prototype.reportSedes = function (elem, type) {
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
					var sede = Drupal.theme.prototype.repSede(tr, type);
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

	// Sort sedes by proximity
	Drupal.theme.prototype.sortSedesBy = function (sedesObj) {
		var pais = $( '#header select[id="sel-pais"] option:selected').text().toLowerCase();
		var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
		var region = $('#header select[id="sel-regions"] option:selected').text().toLowerCase();
		var sortable = [];
		var sortableBy = {
			local: [],
			online: []
		};
		// sort by proximity visitor position
		for (var nid in sedesObj) { sortable.push([nid, sedesObj[nid].proximity]) }
		sortable.sort(function(a, b) {return a[1] - b[1]});
		for ( var i=0; i < sortable.length; i++ ) {
			var nid = sortable[i][0];
			var sedeObj = sedesObj[nid];
			// 1. Check if sede has locality direction
			if ( sedeObj.type !== undefined && sedeObj.type === 'local' ) {
				sortableBy.local.push( sedeObj );
			}
			// 2. Check if sede works on country and the rest
			else {
				sortableBy.online.push( sedeObj );
			}
		}
		return sortableBy;
	};

	// Create tab list depending on type of view
	Drupal.theme.prototype.createTabHeader = function (inSedesObj) {				
		var tabHeader = {};
		for ( var nid in inSedesObj ) {
			var iSedeObj = inSedesObj[nid];
			if ( iSedeObj !== undefined && iSedeObj.cats !== undefined ) {
				for ( var cat in iSedeObj.cats ) {
					var sede = {};
					if ( iSedeObj.title !== undefined ) { sede.title = iSedeObj.title }
					if ( iSedeObj.nid !== undefined ) { sede.nid = iSedeObj.nid }
					if ( iSedeObj.type !== undefined ) { sede.type = iSedeObj.type }
					if ( iSedeObj.proximity !== undefined && iSedeObj.proximity != 0 ) { sede.proximity = iSedeObj.proximity }
					else { sede.proximity = 1000000 } // if its unique online shop, create a huge proximity to be on the bottom of list
					// Region view
					if ( tabHeader['Todas'] === undefined ) { tabHeader['Todas'] = {} }
					tabHeader['Todas'][nid] = sede;
					if ( urlPaths !== undefined && urlPaths.length > 3 && urlPaths[3] === 'all' ) {
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
		}
		return tabHeader;
	};

	// Create HTML: tab List
	Drupal.theme.prototype.tabSedes = function (inSedesObj) {
		var tabList = [];
		var todasTab = {};
		var endTab = {};

		var region = $('#header select[id="sel-regions"] option:selected').text();
		if ( region == "Todas las regiones" ) { regionlabel = 'país' }
		else { regionlabel = 'región' }

		// Create tab list depending on type of view
		var tabHeaders = Drupal.theme.prototype.createTabHeader(inSedesObj);
		var tabNames = Object.keys(tabHeaders).sort();
		for (var i=0; i < tabNames.length; i++ ) {
			var tname = tabNames[i];
			var tcont = "";
			var sortedSedes = Drupal.theme.prototype.sortSedesBy(tabHeaders[tname]);

			// 1. Sort by locality direcction (and proximity)
			if ( sortedSedes.local ) {
				var sedes = sortedSedes.local;
				if ( sedes.length > 0 ) {
					tcont += "<center><div class='sep-title'>Sedes que poseen un tienda en su "+regionlabel+"</div></center><hr>";
				}
				else {
					if ( sortedSedes.online && sortedSedes.online.length === 0 ) {
						tcont += "<center><div class='sep-title'>No hay Sedes que poseen un tienda en su "+regionlabel+"</div></center><hr>";						
					}
				}
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('articleSede', inSedesObj[nid], tname);
				}
			}
			// 2. Sort by country where works (and proximity)
			if ( sortedSedes.online ) {
				var sedes = sortedSedes.online;
				if ( sedes.length > 0 ) {
					tcont += "<center><div class='sep-title'>Sedes que trabajan <i>Online</i> para su "+regionlabel+"</div></center><hr>";
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
				if ( urlPaths !== undefined && urlPaths.length > 3 ) { label = label + ' (' + Object.keys(tabHeaders[tname]).length + ')' }
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

	// Create Object: num filtes
	Drupal.theme.prototype.numFilters = function (inCat, inSubcat, iSedeObj, report) {
		var nid = iSedeObj.nid;
			if ( iSedeObj !== undefined ) {
				if ( iSedeObj.t_act !== undefined ) {
					var filter_txt = iSedeObj.t_act;
					filter_txt = filter_txt.replace(/^\n*\s*/g,'');
					filter_txt = filter_txt.replace(/\n*\s*$/g,'');
					var filters = filter_txt.split(';');
					for (var i=0; i<filters.length; i++) {
						var filter = filters[i];
						filter = filter.replace(/^\n*\s*/g,'');
						filter = filter.replace(/\n*\s*$/g,'');						
						if ( report.t_act[filter] === undefined ) {
							report.t_act[filter] = {};
						}
						report.t_act[filter][nid] = 1;
					}
				}
				if ( iSedeObj.t_mov !== undefined ) {
					var filter_txt = iSedeObj.t_mov;
					filter_txt = filter_txt.replace(/^\n*\s*/g,'');
					filter_txt = filter_txt.replace(/\n*\s*$/g,'');
					var filters = filter_txt.split(';');
					for (var i=0; i<filters.length; i++) {
						var filter = filters[i];
						filter = filter.replace(/^\n*\s*/g,'');
						filter = filter.replace(/\n*\s*$/g,'');
						if ( report.t_mov[filter] === undefined ) {
							report.t_mov[filter] = {};
						}
						report.t_mov[filter][nid] = 1;
					}
				}
				if ( iSedeObj.t_vent !== undefined ) {
					var filter_txt = iSedeObj.t_vent;
					filter_txt = filter_txt.replace(/^\n*\s*/g,'');
					filter_txt = filter_txt.replace(/\n*\s*$/g,'');
					var filters = filter_txt.split(';');
					for (var i=0; i<filters.length; i++) {
						var filter = filters[i];
						filter = filter.replace(/^\n*\s*/g,'');
						filter = filter.replace(/\n*\s*$/g,'');
						if ( report.t_vent[filter] === undefined ) {
							report.t_vent[filter] = {};
						}
						report.t_vent[filter][nid] = 1;
					}
				}
				if ( iSedeObj.cats !== undefined && inCat !== undefined && inCat !== '' && inSubcat !== undefined && inSubcat !== '' ) {
					for ( var etiq in iSedeObj.cats[inCat][inSubcat] ) {
						if ( report.etiqs[etiq] === undefined ) {
							report.etiqs[etiq] = {};
						}
						report.etiqs[etiq][nid] = 1;
					}
				}
			}
	};
	Drupal.theme.prototype.getNumFilters = function (inSedesObj) {
		var report = {
			'Todas': {
				't_act': {},
				't_mov': {},
				't_vent': {},
				'etiqs': {}				
			}
		};
		for ( var nid in inSedesObj ) {
			var iSedeObj = inSedesObj[nid];
			if ( iSedeObj !== undefined ) {

				if ( iSedeObj.cats !== undefined ) {
					for ( var cat in iSedeObj.cats ) {
						if ( report[cat] === undefined ) {
							report[cat] = {
								't_act': {},
								't_mov': {},
								't_vent': {},
								'etiqs': {},
								'subcats': {}
							};
						}

						for ( var subcat in iSedeObj.cats[cat] ) {
							if ( report[cat].subcats[subcat] === undefined ) { report[cat].subcats[subcat] = {'t_act': {},'t_mov': {},'t_vent': {},'etiqs': {} }; }

							Drupal.theme.prototype.numFilters(cat, subcat, iSedeObj, report[cat].subcats[subcat]);

							Drupal.theme.prototype.numFilters(cat, subcat, iSedeObj, report[cat]);

							Drupal.theme.prototype.numFilters(cat, subcat, iSedeObj, report['Todas']);

						}
					}
				}

			}
		}
		return report;
	};
	Drupal.theme.prototype.countFilters = function (inRep) {
		var rep = {
			't_act': {},
			't_mov': {},
			't_vent': {},
			'etiqs': {}
		};
		if ( inRep.t_act !== undefined ) {
			for ( var filter in inRep.t_act ) {
				if ( rep.t_act[filter] === undefined ) { rep.t_act[filter] = 0 }
				rep.t_act[filter] += (Object.keys(inRep.t_act[filter])).length;
			}
		}
		if ( inRep.t_mov !== undefined ) {
			for ( var filter in inRep.t_mov ) {
				if ( rep.t_mov[filter] === undefined ) { rep.t_mov[filter] = 0 }
				rep.t_mov[filter] += (Object.keys(inRep.t_mov[filter])).length;
			}
		}
		if ( inRep.t_vent !== undefined ) {
			for ( var filter in inRep.t_vent ) {
				if ( rep.t_vent[filter] === undefined ) { rep.t_vent[filter] = 0 }
				rep.t_vent[filter] += (Object.keys(inRep.t_vent[filter])).length;
			}
		}
		if ( inRep.etiqs !== undefined ) {
			for ( var filter in inRep.etiqs ) {
				if ( rep.etiqs[filter] === undefined ) { rep.etiqs[filter] = 0 }
				rep.etiqs[filter] += (Object.keys(inRep.etiqs[filter])).length;
			}
		}
		return rep;
	};
	Drupal.theme.prototype.countNumFilters = function (inReport) {
		var report = {};
		var catall = false;
		if ( urlPaths !== undefined && urlPaths.length > 0 && ( urlPaths[3] === 'all' ) ) {
			catall = true;
		}
		for ( var cat in inReport ) {
			if ( catall === true ) {
				report[cat] = Drupal.theme.prototype.countFilters(inReport[cat]);
			}
			else {
				report['Todas'] = Drupal.theme.prototype.countFilters(inReport[cat]);
				for ( var subcat in inReport[cat].subcats ) {
					report[subcat] = Drupal.theme.prototype.countFilters(inReport[cat].subcats[subcat]);
				}
			}
		}
		return report;
	};
	
	// Add missing fitlers
	Drupal.theme.prototype.addMissingEtiquetas = function (numFilters) {
		if ( numFilters !== undefined ) {
			for ( var etiq in numFilters.etiqs ) {			
				if ( $('#edit-etiquetas-wrapper .form-item.form-type-bef-checkbox input[value="'+etiq+'"]').length === 0 ) {
					var etiqValue = etiq.toLowerCase();
					etiqValue = etiqValue.replace(/[éáűőúöüóíÉÁŰPŐÚÖÜÓÍ]/g,'-');
					etiqValue = etiqValue.replace(/\s/g,'-');
					var etiqHTML = '<div class="form-item form-type-bef-checkbox form-item-edit-etiquetas-'+etiqValue+'">'+
								'<input type="checkbox" name="etiquetas[]" id="edit-etiquetas-'+etiqValue+'" value="'+etiq+'">'+
								'<label class="option" for="edit-etiquetas-'+etiqValue+'"> '+etiq+'</label>'+
								'</div>';
					$('#edit-etiquetas-wrapper .bef-checkboxes').append(etiqHTML);

				}
			}			
		}
	};
	// Exposed filter moments
	Drupal.theme.prototype.exposedFilterMoment = function (context) {
		if ( $(context).prop("tagName") !== undefined && $(context).prop("tagName") === "FORM" ) {
			if ( context.length >= 1 && context.context !== undefined ) {

				// Check missing fitlers
				$('input[name="etiquetas[]"]', context.context).each( function() {
					if ( $(this).is(':checked') ) {
						var etiq = $(this).val();
						$('#edit-etiquetas-wrapper .form-item.form-type-bef-checkbox input[value="'+etiq+'"]').prop('checked', true);
					}
				});

				// Add into exposed form the category (tab) is active
				if ( $('input[name="catActive"]', context.context).val() !== undefined ) {
					var catActive = $('input[name="catActive"]', context.context).val();
					$('.nav-tabs a[aria-controls^="'+catActive+'"]').tab('show');
				}
				else {
					var catActive = $('#tabSedes.nav-tabs .active').text();
					$('#views-exposed-form-sedes-report-geo .views-exposed-form').prepend('<input name="catActive" type="hidden" value="'+catActive+'">');
				}
			}
		}
	};

	// Create HTML: num. filters
	Drupal.theme.prototype.addNumFilters = function (numFilters) {
		if ( numFilters !== undefined ) {
			$('#edit-field-sede-tipo-actividad-tid-wrapper label[for^="edit-field-sede-tipo-actividad-tid-"]').each( function() {			
				var filter_init = $(this).text();
				var filter = filter_init;
				filter = filter.replace(/^\n*\s*/g,'');
				filter = filter.replace(/\n*\s*$/g,'');
				filter = filter.replace(/\s*\(\d*\)$/g,'');
				var repFilter = numFilters.t_act[filter];
				if ( repFilter !== undefined && repFilter !== 0 ) {
					$(this).text(' '+filter+' ('+repFilter+')');
					$(this).parent().removeClass('element-invisible');
				}
				else {
					$(this).parent().addClass('element-invisible');
				}			
			});	
			$('#edit-field-sede-tipo-venta-tid-wrapper label[for^="edit-field-sede-tipo-venta-tid-"]').each( function() {			
				var filter_init = $(this).text();
				var filter = filter_init;
				filter = filter.replace(/^\n*\s*/g,'');
				filter = filter.replace(/\n*\s*$/g,'');
				filter = filter.replace(/\s*\(\d*\)$/g,'');
				var repFilter = numFilters.t_vent[filter];
				if ( repFilter !== undefined && repFilter !== 0 ) {
					$(this).text(' '+filter+' ('+repFilter+')');
					$(this).parent().removeClass('element-invisible');
				}
				else {
					$(this).parent().addClass('element-invisible');
				}			
			});
			$('#edit-field-sede-tipo-movimiento-tid-wrapper label[for^="edit-field-sede-tipo-movimiento-tid-"]').each( function() {			
				var filter_init = $(this).text();
				var filter = filter_init;
				filter = filter.replace(/^\n*\s*/g,'');
				filter = filter.replace(/\n*\s*$/g,'');
				filter = filter.replace(/\s*\(\d*\)$/g,'');
				var repFilter = numFilters.t_mov[filter];
				if ( repFilter !== undefined && repFilter !== 0 ) {
					$(this).text(' '+filter+' ('+repFilter+')');
					$(this).parent().removeClass('element-invisible');
				}
				else {
					$(this).parent().addClass('element-invisible');
				}			
			});
			$('#edit-etiquetas-wrapper label[for^="edit-etiquetas-"]').each( function() {			
				var filter_init = $(this).text();
				var filter = filter_init;
				filter = filter.replace(/^\n*\s*/g,'');
				filter = filter.replace(/\n*\s*$/g,'');
				filter = filter.replace(/\s*\(\d*\)$/g,'');
				var repFilter = numFilters.etiqs[filter];
				if ( repFilter !== undefined && repFilter !== 0 ) {
					$(this).text(' '+filter+' ('+repFilter+')');
					$(this).parent().removeClass('element-invisible');
				}
				else {
					$(this).parent().addClass('element-invisible');
				}
			});
		}
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
			labels += '<li role="presentation" class="'+active+' "><a href="#'+tab.id+'" aria-controls="'+tab.label+'" role="tab" data-toggle="tab">'+tab.label+'</a></li>';
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

			// console.log("settings");
			// console.log(settings);
			// console.log("context.behaviors");
			// console.log(context);
			// console.log("sessionStorage");
			// console.log(sessionStorage);
			// console.log("urlPaths");
			// console.log(urlPaths);


			// Get pcode & rcode from URL path
			if ( urlPaths !== undefined && urlPaths.length > 0 && (urlPaths[0] === 'directorio-verde' || urlPaths[0] === 'busq') ) {
				if ( urlPaths[1] !== undefined && urlPaths[1] !== "" ) {
					sessionStorage['code'] = urlPaths[1];
					if ( urlPaths[2] !== undefined && urlPaths[2] !== "" ) { sessionStorage['area_code'] = urlPaths[2] }
					else { sessionStorage['area_code'] = '-' }
					if ( urlPaths[3] !== undefined && urlPaths[3] !== "" ) { sessionStorage['cat_code'] = urlPaths[3] }
					else { sessionStorage['cat_code'] = '-' }
				}
				else {
					sessionStorage['code'] = '-';
					sessionStorage['area_code'] = '-';
				}
				//sessionStorage['geolocation'] = "local";
			}

			// Active loading page
			Drupal.theme.prototype.isLoading(context);

			// Check if geolocation and the website is ready after a time
			//setTimeout(Drupal.theme.prototype.isReady, despiertaTimeOut);

			// Get Taxonomy: regiones
			var allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('#block-views-tax-regiones-block .view-tax-regiones') );

			// Get Taxonomy: categorias
			var allCategoriasObj = Drupal.theme.prototype.categoriasObj( $('#block-views-categorias-names .view-content') );

			// Crete region panel
			Drupal.theme.prototype.createRegionPanel(allPaisRegionsObj, allCategoriasObj);


			// Exposed filters
			Drupal.theme.prototype.exposedFilterMoment(context);

			// Changes titles for multiple pages
			if ( urlPaths !== undefined && urlPaths.length > 0 ) {
				if ( urlPaths[0] === "legal" ) {
					// change title
					$('h1[id="page-title"]').text("Aviso legal");
				}
				else if ( urlPaths[0] === "usuario" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
				else if ( urlPaths[0] === "empresa" ) {
					// remove title
					$('h1[id="page-title"]').remove();
				}
			}

			/* Change Breadcrumb from URL */
			$('#breadcrumb', context).once('despierta', function () {
				// delete frontpage
				if ( urlPaths === undefined || urlPaths.length === 0 || urlPaths[0] === 'home' ) {
					$(this).remove();
				}
				else {
					if ( urlPaths.length > 0 ) {
						// delete for: empresa,usuario
						if ( urlPaths[0] == "usuario" || urlPaths[0] == "empresa" ) {
							$(this).remove();
						}
						else { 
							var out = '<div class="breadcrumb">';
							out += '<a href="/despierta/">Inicio</a>';
							var p = '';						
							for ( var i=1; i <= urlPaths.length; i++) {
								var n = urlPaths[i-1];
								if ( n != '' ) {
									p += (p == '')? n : '/'+n;
									n = n.replace(/-/g,' ');
									n = n.capitalizeFirstLetter();
									if ( i == urlPaths.length ) { out += ' - <span>'+n+'</span>' }
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
			$('#main-menu', context).once('despierta', function () {
				$('#main-menu-links').addClass('nav navbar-nav navbar-right');
				
				// add 'hoja' img
				$('#main-menu-links li[class^="menu"]').each(function() {
					$(this).append('<img class="hoja" src="sites/default/files/hoja.png">');					
				});

				// change directorio-verde menu
				Drupal.theme.prototype.changeLinkToRegion();
			});


			/*
			* SEDES
			*/
			// Print new sedes view (Once)
			$('#block-views-sedes-report-geo .view-display-id-geo', context).once('despierta', function () {
				var subcats = {};
				var sedeHTML = "";

				// Create report of Sedes:
				// 		with Gelocation Sedes
				var reportSedes = {};
				if ( $('> .view-content', this).length ) {
					reportSedes = Drupal.theme.prototype.reportSedes($('> .view-content', this), 'local');
				}
				// 		with Online Sedes (sent to Countries)
				if ( $('.view-display-id-online_pais > .view-content', this).length ) {
					var onlineSedes = Drupal.theme.prototype.reportSedes($('.view-display-id-online_pais .view-content', this), 'online');
					$('.view-display-id-online_pais > .view-content', this).addClass('element-invisible');
					// merge sedes if not already exist in local
					for ( var nid in onlineSedes ) {
						if ( reportSedes[nid] === undefined ) {
							reportSedes[nid] = onlineSedes[nid];
						}
					}
				}
				// 		with Online Sedes (sent to Local regions)
				if ( $('.view-display-id-online_reg > .view-content', this).length ) {
					var onlineSedes = Drupal.theme.prototype.reportSedes($('.view-display-id-online_reg .view-content', this), 'online');
					$('.view-display-id-online_reg > .view-content', this).addClass('element-invisible');
					// merge sedes if not already exist in local
					for ( var nid in onlineSedes ) {
						if ( reportSedes[nid] === undefined ) {
							reportSedes[nid] = onlineSedes[nid];
						}
					}
				}

				// Create Filter report from sedes grouping by Cat
				var reportFilters = {};
				if ( !$.isEmptyObject(reportSedes) ) {
					var sedesFilters = Drupal.theme.prototype.getNumFilters(reportSedes);
					reportFilters = Drupal.theme.prototype.countNumFilters(sedesFilters);
				}

				// Print Content:
				if ( !$.isEmptyObject(reportSedes) ) {

					// Print sedes list
					var sedeHTML = Drupal.theme('tabSedes', reportSedes);

					// replace when geolocation is empty but there are online
					if ( $('> .view-empty', this).length > 0 ) {
						$('> .view-empty', this).replaceWith( '<div class="view-content">'+sedeHTML+'</div>' );
					}
					else {
						$('> .view-content', this).append( $(sedeHTML) );
					}
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
							$('.subrayado', this).fadeIn(500);
							$(this).parents('article').animate({height:'100%'}, 500);
						}
					});
					// Delete Paises en Venta
					$('> .view-content .p_serv', this).remove();
				}
				else { // NO RESULTS
					$('> .view-filters', this).addClass('element-invisible');
					$('> .attachment .view-based-map', this).addClass('element-invisible');
					if ( urlPaths !== undefined && urlPaths.length > 0 && (urlPaths[0] === 'home' || urlPaths[0] === 'directorio-verde') ) {
						if ( urlPaths[1] === undefined || urlPaths[1] === "" || urlPaths[2] === undefined || urlPaths[2] === "" ) {
							if ( $('> .view-empty', this).length > 0 ) {
								$('> .view-empty', this).addClass('element-invisible');
							}
						}
					}					
				}

				// Filter:
				if ( $('> .view-filters', this).length > 0 && $('> .view-empty', this).length === 0 ) {
					// Add filter for current (tab)
					// Could be herence from the context
					var catActive;
					if ( $('#views-exposed-form-sedes-report-geo .views-exposed-form input[name="catActive"]').val() !== undefined ) {
						catActive = $('#views-exposed-form-sedes-report-geo .views-exposed-form input[name="catActive"]').val();
					} else {
						catActive = $('#tabSedes.nav-tabs .active').text();
					}
					catActive = catActive.replace(/^\n*\s*/g,'');
					catActive = catActive.replace(/\n*\s*$/g,'');
					catActive = catActive.replace(/\s*\(\d*\)$/g,'');
					Drupal.theme.prototype.addMissingEtiquetas(reportFilters[catActive]);
					Drupal.theme.prototype.addNumFilters(reportFilters[catActive]);
					// move elements and create a button that show/hide the elements										
					$('> .view-filters', this).appendTo($(this));
					$('> .view-filters', this).prepend('<input type="button" class="load-sede-filter form-submit form-control btn btn-success" value="Cargar filtros">');
					$('> .view-filters ', this).on( 'click', '.load-sede-filter', function() {
						if ( $('#views-exposed-form-sedes-report-geo').hasClass('element-invisible') ) {
							$('#views-exposed-form-sedes-report-geo').removeClass('element-invisible');
						}
						else {
							$('#views-exposed-form-sedes-report-geo').addClass('element-invisible');
						}
					});
				}

				// show panel
				$('#block-views-sedes-report-geo').fadeIn('slow');

				// Disable loading page
				if ( urlPaths !== undefined && urlPaths.length >= 4 && ( urlPaths[0] === 'home' || urlPaths[0] === 'directorio-verde' ) && urlPaths[3] !== '' ) {
					$('#loading').css('display', 'none');
				}

				// Change filters depending on tab
				$('#tabSedes.nav-tabs a').on('shown.bs.tab', function(event){
					var catActive = $(event.target).attr('aria-controls');
					catActive = catActive.replace(/^\n*\s*/g,'');
					catActive = catActive.replace(/\n*\s*$/g,'');
					catActive = catActive.replace(/\s*\(\d*\)$/g,'');					
					Drupal.theme.prototype.addMissingEtiquetas(reportFilters[catActive]);
					Drupal.theme.prototype.addNumFilters(reportFilters[catActive]);
					// init or change the value of actived category (tab)
					if ( $('#views-exposed-form-sedes-report-geo .views-exposed-form input[name="catActive"]').length === 0 ) {
						$('#views-exposed-form-sedes-report-geo .views-exposed-form').prepend('<input name="catActive" type="hidden" value="'+catActive+'">');
					}
					else {
						$('#views-exposed-form-sedes-report-geo .views-exposed-form input[name="catActive"]').val(catActive);						
					}
				});

			});

			/* Filter form: Sede */
			$('#views-exposed-form-sedes-report-geo', context).once('despierta', function () {
				var pais = $( '#header select[id="sel-pais"] option:selected').text();
				var pcode = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
				var region = $('#header select[id="sel-regions"] option:selected').text();
				var rcode = $( '#header select[id="sel-regions"] option:selected').attr('dp-reg-code');
				// If user selects All regions
				if ( region == "Todas las regiones" ) {
					// delete redundance in regions, When we are in the category page:
					$('#edit-field-sede-direccion-locality-selective-wrapper .form-item-edit-field-sede-direccion-locality-selective,'+
						'#edit-field-sede-direccion-administrative-area-selective-wrapper .form-item-edit-field-sede-direccion-administrative-area-selective', this).each( function() {
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
				$('.form-type-select .description', this).remove();
				// Work with the filter form
				$(	'#edit-field-sede-direccion-locality-selective-wrapper, '+
					'#edit-field-sede-direccion-administrative-area-selective-wrapper, '+
					'#edit-field-sede-tipo-actividad-tid-wrapper, '+
					'#edit-field-sede-tipo-movimiento-tid-wrapper, '+
					'#edit-field-sede-tipo-venta-tid-wrapper, '+
					'#edit-etiquetas-wrapper ', this).once('despierta', function () {
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
						$( '.form-item-edit-field-sede-direccion-administrative-area-selective', this ).each(function(){
							var rcode2 = $('input', this).val();
							var rlabel = $( '#header select[id="sel-regions"] option[dp-reg-code="'+rcode2+'"]').val();
							$('label', this).text(rlabel);
						});
				});
				// Capture change event
				$(this).change(function(event) {
					// loading
					Drupal.theme.prototype.isLoading(context, 0.3); // active loading page					
				});
			
			});

			/* Directorio Verde page */
			$('#block-views-categorias-block', context).once('despierta', function () {
				// Add subtitle
				$('> h2', this).after('<h4>Localiza todas las iniciativas que contribuyen al crecimiento sostenible de tu región</h4>');

				// 'Mas' Category at the end
				var otras = $('div[class*="views-row"]:contains("Más...")', this).get();
				$('div[class="view-content"]', this).append(otras);
				// style
				$('div[class*="views-row"]', this).addClass("col-lg-4 col-md-4 col-s-6 col-sm-6 col-xs-12");
				$('div[class*="views-row"]', this).each( function() {
					$(this).wrapInner('<div class="fdoverde"></div>');
					// rewrite with tax id					
					var tax_href = $('.views-field-name .field-content a', this).attr('href');
					$('.views-field-field-imagen .field-content a', this).attr('href', tax_href);
					// add class
					$('.views-field-field-imagen .field-content', this).addClass('imgcateg'); 
					// no img-responsive
					$('.views-field-field-imagen .field-content img', this).removeClass('img-responsive');
				});
			});
			$('.view-banners', context).once('despierta', function () {
				// change title including region
				var $oldtitle = $(this).parents('.block-views').find('h2');
				var q = Drupal.theme.prototype.getTitleRegion( $oldtitle.text() );
				//$('h1[id="page-title"]').html( q );
				// $oldtitle.remove();
				$oldtitle.replaceWith('<h1 class="title" id="page-title">'+q+'</h1>');

				$(this).append('<hr>');
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
					//$(this).append('<div class="view-content"><p>Actualmente, no hay ninguna sede registrada. Por favor, cree una mediante el menu "Opciones de gestión".</p></div>');
				if ( $('#main #messages .nosederegister').length === 0 ) {      
					$('#main').prepend('<div id="messages">'+noSedeRegistrada+'</div>');
				}
				else {
					$('#main #messages').html(noSedeRegistrada);	
				}

// BEGIN-TEMPORAL:!!! BORRAR EN PRODUCCION
// var smsGeo = '<div class="section clearfix">'+
//         '<div class="nogeo messages status">'+
//           'Geolocalización: '+sessionStorage['geolocation']+'<br>'+
//           ' Country: '+sessionStorage['country']+'; '+
//           ' Country_code: '+sessionStorage['code']+';'+
//           ' Area: '+sessionStorage['area']+';'+
//           ' Area_code: '+sessionStorage['area_code']+';'+
//           ' Locality: '+sessionStorage['locality']+';'+
//           ' Address: '+sessionStorage['formatted_address']+
//         '</div>'+
//       '</div>';
// if ( $('#page-wrapper #messages').length === 0 ) {      
// $('#page-wrapper').prepend('<div id="messages">'+ smsGeo + '</div>');
// }
// else {
// $('#page-wrapper #messages').html(smsGeo);	
// }
// END-TEMPORAL:!!! BORRAR EN PRODUCCION

				}
				else {
					$('.view-content',this).prepend('<div class=""><a href="/despierta/?q=empresa/anadir/sede">Crear nueva asede</a></div>');
					$('.views-table', this).addClass("col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12");
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
				contHTML += '<div class="col-lg-2 col-md-2 col-sm-2"></div>';
				contHTML += '<div class="form-horizontal cont-col1 col-lg-4 col-md-4 col-sm-4 col-xs-12">';
					contHTML += '<img src="sites/default/files/contactoxs.jpg">';
				contHTML += '</div>';
				contHTML += '<div class="form-horizontal cont-col2 col-lg-5 col-md-5 col-sm-5 col-xs-12">';
				contHTML += '</div>';
				contHTML += '<div class="form-group cont-row col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center clean">';
				contHTML += '</div>';
				$(this).append(contHTML);
				$('.form-item-cid', this).prependTo('.cont-col1');
				$('.form-item-name', this).appendTo('.cont-col2');
				$('.form-item-mail', this).appendTo('.cont-col2');
				$('.form-item-message', this).appendTo('.cont-col2');
				$('.captcha', this).appendTo('.cont-col2');
				$('.form-actions', this).appendTo('.cont-row');
			});


			/* Login form page */			
			$('form[id="user-login"]', context).once('despierta', function () {
				$('input:not(.form-submit,.form-checkbox)', this).addClass("form-control");
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
			$('.node-form.node-sede-form', context).once('despierta', function () {
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
				$(this).append('<span style="color: #f00">*</span> Campos obligatorios');
			});
			// Changes within 'Categorias/Subcategorias/Etiq'		
			$('select[id^="edit-field-directorio-verde-und-hierarchical-select-selects-0"],select[id^="edit-field-directorio-verde-und-hierarchical-select-selects-1"]').once("DOMSubtreeModified",function(){
				$('.node-form.node-sede-form #edit-field-directorio-verde .hierarchical-select ').css('display', 'table');				
				$('.node-form.node-sede-form #edit-field-directorio-verde select').addClass("form-control");
				$('.node-form.node-sede-form #edit-field-directorio-verde input').addClass("btn btn-info");
				$('.node-form.node-sede-form #edit-field-directorio-verde input').wrap('<div class="edit-field-sede-pais-button"></div>');
				$('.node-form.node-sede-form #edit-field-directorio-verde table tr[class*="dropbox-is-empty"]').replaceWith('<td>Ninguna palabre clave seleccionada.</td>');
			});
			$('input[id^="edit-field-directorio-verde-und-hierarchical-select-dropbox-add"]').once("DOMSubtreeModified",function(){
				$(this).css('display', 'none');
			});
			$('select[id^="edit-field-directorio-verde-und-hierarchical-select-selects-2"]').once("DOMSubtreeModified",function(){
				$('input[id^="edit-field-directorio-verde-und-hierarchical-select-dropbox-add"]').css('display', 'block');
			});
			$('.node-form.node-sede-form #edit-field-directorio-verde .dropbox').once("DOMSubtreeModified",function(){
				$('.dropbox-remove', this)
				$('table tr[class*="dropbox-entry"]', this).each( function() {
					if ( $('.hierarchical-select-item-separator', this).length == 0 ) {
						$('.dropbox-item.dropbox-selected-item', this).append('<span class="dropbox-item dropbox-selected-item"> (Todas las palabras clave) </span>');
					}
				});
			});		
			// Changes when the country of direction has been modified
			$('select[id^="edit-field-sede-direccion-und-0-country"]').once("DOMSubtreeModified",function(){
				$('.node-form.node-sede-form div[id="edit-field-sede-direccion"] legend').remove();
				$('.node-form.node-sede-form div[id="edit-field-sede-direccion"] input').addClass("form-control");
				$('.node-form.node-sede-form div[id="edit-field-sede-direccion"] select').addClass("form-control");
				$('.node-form.node-sede-form label[for*="edit-field-sede-direccion-und-0-country"]').html('País ');
				$('.node-form.node-sede-form label[for*="edit-field-sede-direccion-und-0-thoroughfare"]').html('Dirección ');
				$('.node-form.node-sede-form input[id*="edit-field-sede-direccion-und-0-thoroughfare"]').attr('placeholder','Introduce la dirección de la sede');
				$('.node-form.node-sede-form label[for*="edit-field-sede-direccion-und-0-postal-code"]').html('Código Postal ');
				$('.node-form.node-sede-form input[id*="edit-field-sede-direccion-und-0-postal-code"]').attr('placeholder','Introduce el código postal de la sede');
				$('.node-form.node-sede-form label[for*="edit-field-sede-direccion-und-0-locality"]').html('Ciudad ');
				$('.node-form.node-sede-form input[id*="edit-field-sede-direccion-und-0-locality"]').attr('placeholder','Introduce la ciudad de la sede');
				$('.node-form.node-sede-form label[for*="edit-field-sede-direccion-und-0-administrative-area"]').html('Región ');
				$('.node-form.node-sede-form input[id*="edit-field-sede-direccion-und-0-administrative-area"]').attr('placeholder','Introduce la región de la sede');
				$('.node-form.node-sede-form div[class*="form-item-field-sede-direccion-und-0-premise"]').remove();
				$('.node-form.node-sede-form div[class*="form-item-field-sede-direccion-und-0-dependent-locality"]').remove();
				// Direccion required if 'establecimiento fisico' is checked
				if ( $('.node-form.node-sede-form input[id="edit-field-sede-tipo-venta-und-1792"]').is(':checked') ) {
					$('.node-form.node-sede-form div[id="edit-field-sede-direccion"] .fieldset-description').each( function() {
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
				$('.node-form.node-sede-form div[id="edit-field-sede-pais"] div[class*="hierarchical-select"]').css('display', 'table');				
				$('.node-form.node-sede-form div[id="edit-field-sede-pais"] select').addClass("form-control");
				$('.node-form.node-sede-form div[id="edit-field-sede-pais"] input').addClass("btn btn-info");
				$('.node-form.node-sede-form div[id="edit-field-sede-pais"] input').wrap('<div class="edit-field-sede-pais-button"></div>');
				$('.node-form.node-sede-form div[id="edit-field-sede-pais"] table tr[class*="dropbox-is-empty"]').replaceWith('<td>Ningún país/región ha sido seleccionado.</td>');				
			});
			$('.node-form.node-sede-form div[id="edit-field-sede-pais"] .dropbox').once("DOMSubtreeModified",function(){
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
			$('.region-triptych-first').addClass('col-md-4');
			$('.region-triptych-middle').addClass('col-md-4');
			$('.region-triptych-last').addClass('col-md-4');
			// $('#footer-columns', context).once('despierta', function () {
			// 	if ( $('#footer-wrapper .section hr').length === 0 ) {
			// 		$('#footer-wrapper .section').prepend('<hr>');
			// 	}
			// });


			/**
			*
			* Events even in the elements that have been created dynamically.
			* Then, this part has to be at the end of code.
			* 
			*/			
			/* Active Busqueda tabs */
			$('#tabBusq').delegate('ul a', 'click', function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			/* Changes in the 'pais/region' options. Has to be 'delegate' because it is created dynamically */
			$(context).delegate('#header select[id="sel-pais"]', 'change', function(event) {
				// country has been changed. rewrite 'region' options
				var pais = $('option:selected', this).text();
				var pcode = $('option:selected', this).attr('dp-pais-code');
				var rcode = '-';
				var region = '';
				var catcode = $('#header select[id="sel-categoria"] option:selected').attr('dp-cat-tid');
				sessionStorage['country'] = pais;
				sessionStorage['code'] = pcode;
				sessionStorage['area'] = region;
				sessionStorage['area_code'] = rcode;
				sessionStorage['cat_code'] = catcode;
				sessionStorage['geolocation'] = "local";
				sessionStorage['locality'] = '-';
				sessionStorage['area_2'] = '-';
				sessionStorage['formatted_address'] = '-';

				var html = Drupal.theme('regionesSelectList', allPaisRegionsObj, pcode);
				$( '#header .sel-regions').replaceWith('<div class="sel-regions">' + html + '</div>');				
				$('#block-views-buscador-verde-busq-block .buscador-verde-search .sel-regions').prepend('<label for="sel-regions">Ubicación actual:</label>');

				// change directorio-verde menu
				Drupal.theme.prototype.changeLinkToRegion();
			});
			$(context).delegate('#header select[id="sel-regions"]', 'change', function(event) {
				// region has been changed
				var pcode = $('#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
				var region = $('option:selected', this).text();
				var rcode = $('option:selected', this).attr('dp-reg-code');
				if ( region === "Todas las regiones" ) { region = ""; rcode = '-' }
				var catcode = $('#header select[id="sel-categoria"] option:selected').attr('dp-cat-tid');
				sessionStorage['area'] = region;
				sessionStorage['area_code'] = rcode;
				sessionStorage['cat_code'] = catcode;
				sessionStorage['geolocation'] = "local";
				sessionStorage['locality'] = '-';
				sessionStorage['area_2'] = '-';
				sessionStorage['formatted_address'] = '-';

				// change directorio-verde menu
				Drupal.theme.prototype.changeLinkToRegion();
			});	
			$(context).delegate('#header select[id="sel-categoria"]', 'change', function(event) {
				// category has been changed
				var catcode = $('option:selected', this).attr('dp-cat-tid');
				sessionStorage['cat_code'] = catcode;

				// change directorio-verde menu
				Drupal.theme.prototype.changeLinkToRegion();
			});
			/* 'Search' using the Header Panel */
			$(context).delegate('#header input[id="sel-search"]', 'keypress', function(event) {
				if ( event.which == 13 ) {
					window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);
				}
			});	
			$(context).delegate('#header button[id="sel-button"]', 'click', function(event) {
				window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);
			});	
			$(context).delegate('#header .buscador-verde-search button[id="sel-button"]', 'click', function(event) {
				// Create new location based on pais/region/cat
				// Redirect region location if it is not 'buscador verde'
				window.location.href = Drupal.theme.prototype.createRegionURL(urlPaths);
			});	
			$(context).delegate('#header .buscador-verde-search .sel-regions > label', 'click', function(event) {
				// $('#header .buscador-verde-search select[id="sel-regions"]').click();
				var element = $('#header .buscador-verde-search select[id="sel-regions"]')[0];
				if (document.createEvent) { // all browsers
					var e = document.createEvent("MouseEvents");
					e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					element.dispatchEvent(e);
				} else if (element.fireEvent) { // ie
					element.fireEvent("onmousedown");
				}
			});	

			// Add classes for the new 'sedes' pages
			$('#block-views-sedes-report-geo .view-sedes-report > .view-content .tab-despierta .nav-tabs').addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12');
			$('#block-views-sedes-report-geo .view-sedes-report > .view-content .tab-despierta .tab-content').addClass('col-lg-7 col-md-7 col-s-12 col-sm-12 col-xs-12 pull-left');
			$('#block-views-sedes-report-geo .view-sedes-report > .attachment').addClass('col-lg-5 col-md-5  col-s-12 col-sm-12 col-xs-12 pull-right');
			$('#block-views-sedes-report-geo .view-sedes-report > .view-filters').addClass('col-lg-5 col-md-5  col-s-12 col-sm-12 col-xs-12 pull-right');

			// Display none forever			
			$('.ajax-progress-throbber').addClass('element-invisible');
			$('#block-views-sedes-report-geo #edit-keys-wrapper').css('display', 'none');
			if ( $(context).prop("tagName") === undefined && $(context).prop("tagName") != "FORM" ) {
				$('#views-exposed-form-sedes-report-geo').addClass('element-invisible');
			}
			else {
				$('#views-exposed-form-sedes-report-geo').removeClass('element-invisible');	
			}

		} // end: attach of despierta theme
	};

})(jQuery);