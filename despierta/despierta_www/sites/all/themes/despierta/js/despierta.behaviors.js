(function ($) {

  /**
   * Global vars
   */
	var allPaisRegionsObj = {};
	var currentPosition = {};

	// if (localStorage['region'] == "Todas las regiones") { localStorage['region'] = "" }

	// Warning!! HARD-CORE
	if (localStorage['pais'] === undefined || localStorage['pais'] == "") { localStorage['pais'] = "España" }
	if (localStorage['region'] === undefined || localStorage['region'] == "") { localStorage['region'] = "Madrid" }
    
    // Get current position
    if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(getPosition, getPositionError);
	}
	//if ( navigator.geolocation && $('div[class*="view-display-id-block_regiones"]').length ) {
		// navigator.geolocation.getCurrentPosition(foundLocation, foundLocationError);
	// }			

	var htmlNoResults = '<section class="no-resultados">'+
							'<div class="alert alert-warning" role="alert">'+
							'No hay entidades registradas en esta región, '+
							'si desea registrar su entidad acceda al menú de registro o, '+
							'si por el contrario quiere notificarnos la existencia de alguna, '+
							'póngase en contacto con nosotros'+
							'</div>'+
						'</section>';

  /**
   *
   * Global functions.
   * 
   */
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

  /**
   *
   * Geolocation.
   * 
   */
	function proxDistance(lon1, lat1, lon2, lat2) {
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
	function getPosition(position) {
// console.log("getPosition");
		var lat = position.coords.latitude;
		var long = position.coords.longitude;
		var latlng = lat + ',' + long;
		currentPosition = {
			long: long,
			lat: lat,
			latlng: latlng,
			sensor: true,
		}
	}
	function getPositionError(msg) {
		console.log(msg);
	}


	function foundLocation(position) {
// console.log("foundLocation");
// console.log(position);
// console.log(currentPosition);
		var lat = position.coords.latitude;
		var long = position.coords.longitude;
		var latlng = lat + ',' + long;
		currentPosition = {
			long: long,
			lat: lat,
			latlng: latlng,
			sensor: true,
		}
		jQuery.ajax({			
			url: 'http://maps.googleapis.com/maps/api/geocode/json',
			data: currentPosition,
			dataType: 'json',
			async: false,
		})
		.done(function( data ) {
// console.log( data );
			if ( !jQuery.isEmptyObject(data) && jQuery.isArray(data.results) && data.results[0] && data.results[0].address_components ) {
				var address = data.results[0].address_components;
				for ( var i=0; i < address.length; i++ ) {
					var geoloc = address[i];
					if ( jQuery.isArray(geoloc.types) && geoloc.types[0] ) {
						var type = geoloc.types[0];
						if ( type == "locality" ) {
							var locality = geoloc.long_name;
// console.log( locality );
						}
						else if ( type == "country" ) {
							var country = geoloc.long_name;
// console.log( country );
						}
					}

				}
			}
		})
		.fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});						


	}

  /**
   *
   * Global functions.
   * 
   */
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

	// Apply changes when 'pais/region' panel is modified (or active)
	Drupal.theme.prototype.applyRegionOption = function (pais, region) {
		var regquery = "";
		if ( region != "" ) { regquery = pais + ',' + region }
		else { regquery = pais }

		// Change title in 'Directorio verde' and 'Categories' pages
		if ( $( 'div[id="block-views-sedes-block-cat"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}
		if ( $( 'div[class*="view-despierta-directorio-verde"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}

		// Chages the filter forms!!! (Regiones and Category)			
		if ( $( 'div[id="block-views-sedes-block-regiones"]' ).length ) {
			$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).val(regquery);
			$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]').change();
		}
		// 'sedes category'
		else if ( $( 'div[id="block-views-sedes-block-cat"]' ).length ) {
			$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]' ).val(pais);
			$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]').change();
		}
	};

  /**
   *
   * Pais / Regions functions.
   * 
   */

	// Create Object: Pais - Regions
	Drupal.theme.prototype.paisRegionesObj = function (elem) {
		var paises = {};
		$('.region', elem).map( function () {
			var region = $(this).text();
			var pais = $(this).attr('dp-pais');
			var used = "false";
			if ( ($(this).attr('dp-used') !== undefined) && ($(this).attr('dp-used') !== "") ) { used = "true" }
			if ( paises[pais] === undefined ) {
				paises[pais] = {
					'name': pais,
					'enable': used,
					'regions': {}
				};
			}
			if ( paises[pais].regions[region] === undefined ) {
				paises[pais].regions[region] = {
					'name': region,
					'enable': used
				};
			}
			// paises[pais].regions.push({
			// 	'name': region,
			// 	'enable': used
			// });
			if ( used === "true" ) { paises[pais].enable = used }
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
		for (var pname in paisRegions) {
			var pais = paisRegions[pname];
			var disabled = "";
			// var disabled = ( pais.enable === "false" ) ? "disabled" : "";
			selHTML += '<option value="'+pname+'" '+disabled+' >' + pname + '</option>';
		}
		selHTML += '</select>';
		return $('<div class="sel-pais">' + selHTML + '</div>');
	};
	// Create HTML select option
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, pais) {
		var selHTML = '<select id="sel-regions">';		
		selHTML += '<option value="">Todas las regiones</option>';
		if ( pais !== "" ) {
			for (var idx in paisRegions[pais].regions)  {
				var region = paisRegions[pais].regions[idx];
				var disabled = "";
				// var disabled = ( region.enable === "false" ) ? "disabled" : "";
				selHTML += '<option value="'+region.name+'" '+disabled+' >'+region.name+'</option>';
			}
		}
		selHTML += '</select>';
		return $('<div class="sel-regions">' + selHTML + '</div>');
	};
	// Select: Specific Pais - Region (for Geolocation)
	// Eg, Drupal.theme.prototype.selectPaisRegion("Honduras", "Napo");
	Drupal.theme.prototype.selectPaisRegion = function (pais, region) {
		if ( pais !== undefined || pais !== null || pais !== "" ) {
			$('select[id="sel-pais"] > option[value="'+pais+'"]').prop('selected', true);
		}
		if ( region !== undefined || region !== null || region !== "" ) {
			$('select[id="sel-regions"] > option[value="'+region+'"]').prop('selected', true);
		}
	}; 

  /**
   *
   * Sedes / Subcategories.
   * 
   */

	// Sedes has to be group by Nid
	Drupal.theme.prototype.sedesObj = function (elem) {
		var sedes = {};
		$('table', elem).each( function (i, table) {
			var nid = $('caption:first', table).text().replace(/ /g,'');
			if ( sedes[nid] === undefined ) {
				var sede = {
					cat: {},
					subcats: {},
					etiqs: {},
				};
				$('tbody > tr', table).map( function (j, tr) {
					var cat = "";
					var subcat = "";
					$('td', tr).map( function (k, td) {
						if ( k == 1 ) { // title
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.title = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 2 ) { // logo
							sede.logo = $('img', td).attr('src').replace(/\n*\s*/g,'');
						}
						else if ( k == 3 ) { // desc. breve
							sede.descb = $(td).text();
						}
						else if ( k == 4 ) { // desc. completa
							sede.descc = $(td).text();
						}
						else if ( k == 5 ) { // direccion
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.direccion = val;
						}
						else if ( k == 6 ) { // CP
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.cp = val;
						}
						else if ( k == 7 ) { // city
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.city = val;
						}						
						else if ( k == 8 ) { // country
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.country = val;
						}						
						else if ( k == 9 ) { // email							
							sede.email = $('a', td).text().replace(/\n*\s*/g,'');
						}
						else if ( k == 10 ) { // web
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.web = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 11 ) { // tlf
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.tlf = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 12 ) { // tipo actividad
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_act = val;
						}
						else if ( k == 13 ) { // tipo movimiento
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_mov = val;
						}
						else if ( k == 14 ) { // tipo venta
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_vent = val;
						}
						else if ( k == 15 ) { // Categoria
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							val = val.replace(/Categoria:\s*/g,'');
							if ( sede[cat] === undefined ) { sede.cat = {} }
							if ( sede.cat[val] === undefined ) { sede.cat[val] = {} }
							cat = val;
						}
						else if ( k == 16 ) { // Sub-Categoria
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							if ( sede.cat[cat][val] === undefined ) { sede.cat[cat][val] = [] }
							subcat = val;
						}
						else if ( k == 17 ) { // Etiquetas
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.cat[cat][subcat].push( val );
							if ( sede.etiqs[val] === undefined ) { sede.etiqs[val] = 1 }
						}
						else if ( k == 19 ) { // Location (Address)
							var val;
							val = jQuery.parseJSON( $(td).text() );
							sede.location = val;
							if ( !jQuery.isEmptyObject(currentPosition) ) {
								var prox = proxDistance(currentPosition.long, currentPosition.lat, val.coordinates[0], val.coordinates[1]);
								if ( prox !== undefined ) {
									sede.proximity = prox;
								}
							}
							else {
								// if (navigator.geolocation) {
								// 	navigator.geolocation.getCurrentPosition(foundLocation, foundLocationError);
								// }
								// else {
								// 	console.log('not supported');
								// }
							}
						}
					});
				});
				sedes[nid] = sede;			
			}
		});
		return sedes;
	};

	// Create Sedes group
	Drupal.theme.prototype.sedesGroups = function (elem) {
		var sedesGroups = {};
		$('.view-grouping', elem).each( function (i, table) {
			var sedeGroup = $('.view-grouping-header', this).text();
			sedeGroup = sedeGroup.replace(/Categoria\:\s*/g,'');
			sedeGroup = sedeGroup.replace(/Subcategoria\:\s*/g,'');
			var sedesObj = Drupal.theme.prototype.sedesObj($('.view-grouping-content', this));
			sedesGroups[sedeGroup] = sedesObj;
		});
		return sedesGroups;
	};

	// Extract the number of subcategories
	Drupal.theme.prototype.getNumSubCategories = function(sedesObj) {
		var subcats = {};
		for ( var subcat in sedesObj ) {
			subcats[subcat] = Object.keys(sedesObj[subcat]).length;
		}
		return subcats;
	};
	
	// Create HTML: tab List
	Drupal.theme.prototype.tabSedes = function (sedesObj, tabAll) {
		var tabList = [];
		if ( tabAll === true ) {
			var msedeObj = {};
			for (var key in sedesObj ) {
				var sedeObj = sedesObj[key];
				jQuery.extend(msedeObj,sedeObj);
			}
			tabList.push({
				'id': 'todas',
				'label': 'Todas',
				'cont': Drupal.theme('sedeArticle', msedeObj)
			});
		}
		var endTab = {};
		var keys = Object.keys(sedesObj).sort();
		for (var i=0; i < keys.length; i++ ) {
			var key = keys[i];
			var sedeObj = sedesObj[key];
			var label = key.replace(/^[^\:]*\:\s*/g,'');
			var id = label.replace(/[\s\,]/g,'_');
			if ( id == "Otras_categorías" ) {
				endTab = {
					'id': id,
					'label': label,
					'cont': Drupal.theme('sedeArticle', sedeObj)
				}
			}
			else {
				tabList.push({
					'id': id,
					'label': label,
					'cont': Drupal.theme('sedeArticle', sedeObj)
				});
			}
		}
		if ( !jQuery.isEmptyObject(endTab) ) { tabList.push(endTab) }
		var tabHTML = Drupal.theme('createTabPanel', tabList, "tabSedes");
		return tabHTML;
	};

	// Create HTML: article
	Drupal.theme.prototype.sedeArticle = function (sedesObj) {
		// sort by proximity
		var sortable = [];
		for (var nid in sedesObj) { sortable.push([nid, sedesObj[nid].proximity]) }
		sortable.sort(function(a, b) {return a[1] - b[1]});
		var sedHTML = '<section class="resultados">';
		// for ( var nid in sedesObj ) {
		for ( var i=0; i < sortable.length; i++ ) {
			var nid = sortable[i][0];

			var sedeObj = sedesObj[nid];
			sedHTML += '<article class="media ">';

			sedHTML += '<div class="media-bod col-lg-12 col-md-12 col-s-12 col-sm-12 col-xs-12 prici">';

				sedHTML += '<div class="logoempresa col-lg-2 col-md-2 col-sm-2 col-s-2 col-xs-2">';
					sedHTML += '<img class="media-object" src="' + sedeObj.logo + '">';
				sedHTML += '</div>';
				
				sedHTML += '<div class="allinfo col-lg-5 col-md-5 col-sm-5 col-s-9 col-xs-9">';
					sedHTML += '<h2>' + sedeObj.title + '<div class="info url"><span>+ info</span>';
						sedHTML += '<img class="ico_flecha" src="sites/default/files/ico_flecha.png">';
					sedHTML += '</div></h2>';
					sedHTML += '<div class="inform text-justify clean"><p class="desc_breve">' + sedeObj.descb + '</p></div>';
				sedHTML += '</div>';

				sedHTML += '<div class="col-lg-5 col-md-5 col-sm-5 col-s-12 col-xs-12 text-right pull-right">';
					var dircompl = '';
					var cp = '';
					if ( sedeObj.direccion !== undefined && sedeObj.direccion != "" ) { dircompl = 'Dirección: '+sedeObj.direccion }
					if ( sedeObj.city !== undefined && sedeObj.city != "" ) { cp += sedeObj.city }
					if ( sedeObj.cp !== undefined && sedeObj.cp != "" ) { cp += ' ('+sedeObj.cp+')' }
					if ( sedeObj.country !== undefined && sedeObj.country != "" ) { cp += ' '+sedeObj.country }
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
					for ( var c in sedeObj.cat ) {
						var subcats = Object.keys(sedeObj.cat[c]).join(', ');
						cats += c + ' (' + subcats + '); ';
					}
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de movimiento:</p><p>' + sedeObj.t_mov + '</p></div>';
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Descripción:</p><p>' + sedeObj.descc + '</p></div>';
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de actividad:</p><p>' + sedeObj.t_act + '</p></div>';
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de venta:</p><p>' + sedeObj.t_vent + '</p></div>';
					// sedHTML += '<div class="row"><p class="text-left col-xs-4">Categorías:</p><p>' + cats + '</p></div>';
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Etiquetas:</p><p>' + Object.keys(sedeObj.etiqs).join('; ') + '</p></div>';

				sedHTML += '</div>';
			sedHTML += '</div> <!-- media-bod -->';

			sedHTML += '</article>';
		}
		sedHTML += '</section>';

		sedHTML = '<div class="view-content">'+sedHTML+'</div>';
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

			// Changes titles for multiple pages
			// var urlVars = Drupal.theme.prototype.getUrlVars();
			var urlVars = getUrlVars();
			if ( urlVars['q'] == "legal" ) {
				// change title
				$('h1[id="page-title"]').text("Aviso legal");
			}
			else if ( urlVars['q'] == "usuario/login" ) {
				// remove title
				$('h1[id="page-title"]').remove();
			}
			else if ( urlVars['q'] == "usuario/recuperar" ) {
				// remove title
				$('h1[id="page-title"]').remove();
			}
			else if ( urlVars['q'] == "empresa/registro" ) {
				// remove title
				$('h1[id="page-title"]').remove();
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

			

			/* Pais/Regiones View */
			$('div[id="block-views-tax-regiones-block"]', context).once('despierta', function () {

// 				if (	localStorage['pais'] === undefined || localStorage['pais'] == "" || 
// 						localStorage['region'] === undefined || localStorage['region'] == ""
// 				 ) {
// 				 	getLocation();
// 					//Get current geoposition
// // 			    	if (navigator.geolocation) {
// // console.log("navigator");
// // $.when( navigator.geolocation.getCurrentPosition ).then(function( data ) {
// // console.log(data);
// // 	foundLocation();
// // });				
// 					// }
// 				}

				// Create Object: Pais - Regions
				allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('.view-regiones', this) );

				// Create HTML for 'Paises'
				var $paisHTML = Drupal.theme('paisSelectList', allPaisRegionsObj);
				$( '#header .region' ).prepend($paisHTML);

				// Create HTML for 'Regions'
				var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, localStorage['pais']);
				$( '#header .region > div:nth-child(1)' ).after($regHTML);

				// Delete
				$('div[id="block-views-tax-regiones-block"]').remove();

				// Save 'localStorage' into 'options'
				Drupal.theme.prototype.selectPaisRegion(localStorage['pais'], localStorage['region']);
				
				// Apply 'pais/regions' options
				Drupal.theme.prototype.applyRegionOption(localStorage['pais'], localStorage['region']);

			});


			/* Search panel / Sedes in the frontpage */
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
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-regiones"]' ).remove();
			$('form[id^="views-exposed-form-sedes2"] .views-submit-button input').each( function() {
				$(this).addClass('btn btn-success');
				$(this).css('width', '69px');
			});
			$('form[id^="views-exposed-form-sedes2"] input#edit-query').attr('placeholder', '¿Qué buscas?');
			$('form[id^="views-exposed-form-sedes2"] input#edit-field-sede-direccion-locality').attr('placeholder', 'Localidad (Opcional)');


			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-cat"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-subcat"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-nom"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] input[id="edit-nom"]' ).attr('placeholder', 'Nombre del anunciante');
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-act"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-mov"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-t-ven"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-pais"]' ).remove();
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-reg"]' ).remove();
			// Create panels
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
								$( 'div[id^="edit-reg-wrapper"] .form-item', this ).html()+
							'</div>';
				avanHTML += '<div class="pull-left col-xs-12 col-md-4">'+
								'<label>¿Características?</label>'+
								$( 'div[id^="edit-t-act-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-t-mov-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-t-ven-wrapper"] .form-item', this ).html()+
							'</div>';
				avanHTML += '<div class="pull-left col-xs-12">'+
								$( '.views-submit-button', this ).html()+
							'</div>';
				$( '.views-exposed-widgets', this ).empty();
				$( '.views-exposed-widgets', this ).html(avanHTML);
			});	
			
			/* Printing Sedes: 'Regiones' and 'Categories' */
			// Print new sedes view (Once)
			$(	'div[id="block-views-sedes-block-regiones"] .view-id-sedes, '+
				'div[id="block-views-sedes-block-cat"] .view-id-sedes, '+
				'.view-id-sedes2').once("DOMSubtreeModified",function(){
				var subcats = {};
				var sedeHTML = "";

				if ( $('.view-content', this).length ) {
					// Create Object: Sedes
					var sedesGroups = Drupal.theme.prototype.sedesGroups($('.view-content', this));

					// Extract num. sub-categories
					var tabAll = false
					if ( $(this).parents('div[id="block-views-sedes-block-regiones"]').length != 0 ) {
						tabAll = true;
					}
					// When we are in the category page:
					// get sub-categories
					if ( $(this).parents('div[id="block-views-sedes-block-cat"]').length != 0 ) {
						subcats = Drupal.theme.prototype.getNumSubCategories(sedesGroups);
					}

					// Create HTML
					var sedeHTML = Drupal.theme('tabSedes', sedesGroups, tabAll);
					$('.view-content', this).remove();
					$('div[id="block-views-geolocalization-block"]').removeClass('element-invisible');
				}
				// NO RESULTS
				else {
					sedeHTML = '<div class="view-content">' + htmlNoResults + '</div>';
					$('.view-filters', this).addClass('element-invisible');
					$('div[id="block-views-geolocalization-block"]').addClass('element-invisible');
				}
				// Print sedes list
				$(this).append( $(sedeHTML) );

				// Print num. sub-cagtegories				
				$('ul[id="tabSedes"] a').map( function () {
					var val = $(this).text();
					val = val.replace(/^\s*/g,'');
					val = val.replace(/\s*$/g,'');
					val = val.replace(/\s*\(\d*\)\s*$/g,'');
					if ( !jQuery.isEmptyObject(subcats) ) {
						var num = 0;
						if ( subcats[val] !== undefined ) { num = subcats[val] }
						$(this).contents().last().remove();
						$ ( this ).append( val+" ("+num+")" );
					}
				});

	 			// Event Click: sedes more info
				$('.view-content', this).on( 'click', '.resultados .info.url', function() {
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
				$('div[id="block-views-ver-tax-block"]').css('display', 'block');
				$('div[id="block-views-sedes-block-regiones"]').css('display', 'block');
				$('div[id="block-views-sedes-block-cat"]').css('display', 'block');
				$('div[id="block-views-sedes-block-subcat"]').css('display', 'block');
			});

			/* Filter form: Sede 'categories' */
			$('div[id="block-views-exp-sedes-block-cat"]', context).once('despierta', function () {
				$(this).addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12');
				// $('div[id="block-views-sedes-block-cat"] .view-id-sedes section[class^="resultados"]').addClass('col-lg-5 col-md-5 col-sm-12 col-xs-12 pull-right');
			});

			// Delete redundance in regions, When we are in the category page:
			$('form[id="views-exposed-form-sedes-block-cat"] div[id="edit-regions-wrapper"]', context).once('despierta', function () {
				var pais = $('select[id="sel-pais"] option:selected').text();
				var region = $('select[id="sel-regions"] option:selected').text();
				$('div[class*="form-item-edit-regions"]', this).each( function() {
					var labregion = $('label[for*="edit-regions"]', this).text();
					if ( allPaisRegionsObj[pais] !== undefined ) {
						if ( allPaisRegionsObj[pais].regions[labregion] === undefined ) {
							$(this).remove();
						}
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
				var otras = $('div[class*="views-row"]:contains("Otras categorías")', this).get();
				$('div[class="view-content"]', this).append(otras);
				$('div[class*="views-field-field-imagen"] .field-content', this).each( function() {
					$(this).addClass('imgcateg');
				})
				$('div[class*="views-field-field-imagen"] img', this).each( function() {
					$(this).removeClass('img-responsive');
				})
			});


			/* Sede Page */
			$('div[class*="node-sede"]', context).once('despierta', function () {				
				// $('div[class*="field-name-field-location"]', this).remove();
			});


			/*
			 * FORMS PAGES
			*/			

			/* Contact form */
			$('form[id="contact-site-form"]', context).once('despierta', function () {
				$('input:not(.form-submit)', this).addClass("form-control");
				$('select', this).addClass("form-control");
				$('textarea', this).addClass("form-control");

				$('label[for="edit-name"]', this).contents().first()[0].textContent = "Nombre ";
				$('input[id="edit-name"]', this).attr('placeholder','Introduce el nombre');
				$('label[for="edit-mail"]', this).contents().first()[0].textContent = "Correo electrónico ";
				$('input[id="edit-mail"]', this).attr('placeholder','Introduce el e-mail');
				$('div[class*="form-item-subject"]', this).remove();
				$('textarea[id="edit-message"]', this).attr('placeholder','Teclea su comentario');
				$('textarea[id="edit-message"]', this).css('resize', 'none');
				$('label[for="edit-cid"]', this).contents().first()[0].textContent = "Motivo de la notificación ";
				$('input[id="edit-submit"]', this).attr('value','Enviar');
				$('input.form-submit', this).addClass("btn btn-success pull-left");
				

				var contHTML = '<div class="form-horizontal col-lg-6 col-md-6 col-sm-6 col-xs-12">';
				contHTML += '</div>';
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
				var legalHTML = '<label class="option" for="edit-legal-accept"><strong>Acepto los</strong> <a href="/despierta/?q=legal">los términos y condiciones</a> de nuestros servicios <span class="form-required" title="Este campo es obligatorio.">*</span></label>';
				$('label[for="edit-legal-accept"]').replaceWith(legalHTML);
				$('input.form-submit', this).addClass("btn btn-success pull-right");
			});

			/* Sedes form page */
			$('form[id="sede-node-form"]', context).once('despierta', function () {
				$('input:not(.form-submit,.form-checkbox)', this).addClass("form-control");
				$('select:not(select[id^="edit-field-sede-pais-und-hierarchical-select-selects"])', this).addClass("form-control");

				$('input[id="edit-title"]', this).attr('placeholder','Introduce el nombre comercial como anunciante para esta Sede');
				$('textarea[id="edit-field-sede-descripcion-breve-und-0-value"]', this).attr('placeholder','Introduce una descripción breve de la entidad');
				$('textarea[id="edit-field-sede-descripcion-breve-und-0-value"]', this).css('resize', 'none');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).attr('placeholder','Incluye todas las palabras, productos y servicios con los que trabaja tu entidad para que ésta sea más fácil de localizar en nuestro Buscador Verde');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).css('resize', 'none');

				$('div[class^="term-reference-tree-button"]', this).css('cursor', 'pointer');

				$('input[id="edit-field-sede-logo-und-0-upload"]', this).addClass("filestyle");
				$('input[id="edit-field-sede-logo-und-0-upload-button"]', this).attr('value','Subir Imagen');
				$('input[id="edit-field-sede-logo-und-0-upload-button"]', this).addClass("btn btn-info");

				$('input[id="edit-field-sede-email-und-0-email"]', this).attr('placeholder','Introduce un correo electrónico de tu Sede');
				$('input[id="edit-field-sede-web-und-0-value"]', this).attr('placeholder','www.tupagina.com');
				$('input[id="edit-field-sede-telefono-und-0-value"]', this).attr('placeholder','Introduce el teléfono de tu Sede');

				$('input[id="edit-field-sede-region-venta-und-hierarchical-select-dropbox-add"]', this).addClass("btn btn-success pull-right");

				$('input[id="edit-submit"]', this).addClass("btn btn-success pull-right");
				$('input[id="edit-preview"]', this).remove();
			});
			$('select[id^="edit-field-sede-direccion-und-0-country"]').once("DOMSubtreeModified",function(){
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
				$('form[id="sede-node-form"] div[id="edit-field-sede-tipo-venta"] input:checked').each( function() {
					if ( $(this).siblings().text().indexOf("Establecimiento físico") !== -1 ) {
						$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] label').each( function() {
							$(this).append('<span class="form-required">*</span>');
						});
					}
				});
			});
			$('select[id^="edit-field-sede-pais-und-hierarchical-select-selects"]').once("DOMSubtreeModified",function(){
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] div[class*="hierarchical-select"]').css('display', 'table');				
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] select').addClass("form-control");
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] input').addClass("btn btn-info");
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] input').wrap('<div class="edit-field-sede-pais-button"></div>');
				$('form[id="sede-node-form"] div[id="edit-field-sede-pais"] table tr[class*="dropbox-is-empty"]').replaceWith('<td>Ningún país/región ha sido seleccionado.</td>');
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

			/* Show and Hide */
			// hide
			$('div[id="block-views-ver-tax-block"]').css('display', 'none');
			$('div[class*="view-display-id-block_cat"]').css('display', 'none');
			$('form[id="views-exposed-form-sedes-block-cat"]').css('display', 'none');
			$('div[class*="view-display-id-block_regiones"]').css('display', 'none');

			// show depending on...
			if ( 	$(context).prop("tagName") == "FORM" && context.context !== undefined &&					
					($(context).attr('id') == "views-exposed-form-sedes-block-regiones" ||
					$(context).attr('id') == "views-exposed-form-sedes-block-cat" )
			) {
				$('div[id="loading"]').css('display', 'none');
				$('div[class*="view-display-id-block_cat"]').fadeIn('slow');
				$('form[id="views-exposed-form-sedes-block-cat"]').fadeIn('slow');
				$('div[class*="view-display-id-block_regiones"]').fadeIn('slow');
				$('div[class*="view-geolocalization"]').removeClass('element-invisible');
				$('ul[id="tabSedes"]').addClass('pull-left col-lg-12 col-md-12 col-sm-12 col-xs-12');
				$('#tabSedes').tabCollapse({
					tabsClass: 'hidden-sm hidden-xs',
					accordionClass: 'visible-sm visible-xs'
				});
				// hide filter forms
				$('form[id="views-exposed-form-sedes-block-regiones"]').addClass('element-invisible');
				$('form[id="views-exposed-form-sedes-block-cat"] div[id="edit-pais-wrapper"]').addClass('element-invisible');
			}
			else {
				if ( $( ".flower-loader" ).length == 0 ) {
					$('div[id="block-views-sedes-block-cat"]').prepend('<div id="loading"><p>Cargando...</p><div class="flower-loader"></div></div>');
					$('div[id="block-views-sedes-block-regiones"]').prepend('<div id="loading"><p>Cargando...</p><div class="flower-loader"></div></div>');
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
			// Changes in the 'pais/region' options.
			// Has to be 'delegate' because it is created dynamically
			$(context).delegate('#header select[id="sel-pais"], #header select[id="sel-regions"]', 'change', function(event) {
				// Display none 'sede' list
				$('div[id="block-views-sedes-block-cat"]').css('display', 'none');

				if ( $(this).attr('id') == "sel-pais" ) {
					var pais = $( 'option:selected', this ).text();
					var region = "";
					localStorage['pais'] = pais;
					localStorage['region'] = region;
					
					var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, pais);
					$( '#header div[class="sel-regions"]' ).replaceWith($regHTML);					
				}
				else if ( $(this).attr('id') == "sel-regions" ) {
					var region = $( 'option:selected', this ).text();
					if ( region == "Todas las regiones" ) { region = "" }
					localStorage['region'] = region;					
				}
				// It is useful??
				// event.stopPropagation();

				// Apply 'pais/regions' options
				Drupal.theme.prototype.applyRegionOption(localStorage['pais'], localStorage['region']);
			});
			// Add classes for the new 'sedes' pages
			$('div[id="block-views-sedes-block-regiones"] .view-id-sedes section[class^="resultados"]').addClass('col-lg-7 col-md-7 col-sm-7 col-xs-12');
			$('div[id="block-views-sedes-block-cat"] .view-id-sedes section[class^="resultados"]').addClass('col-lg-7 col-md-7 col-sm-7 col-xs-12');


		} // end: attach 
	};

})(jQuery);