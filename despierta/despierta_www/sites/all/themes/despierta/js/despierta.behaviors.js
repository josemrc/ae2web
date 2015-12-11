(function ($) {

  /**
   * Global vars
   */
	var allPaisRegionsObj = {};
	var allSedes = {};
	var visitorLocation = {};	
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
		$('div[id="loading"]').removeClass('element-invisible');
		$('div[id="block-views-ver-tax-block"]').css('display', 'none');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="view-filters"]').css('display', 'none');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="view-content"]').css('display', 'none');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="attachment"]').addClass('element-invisible');
		// none forever
		$('div[id="block-views-sedes-block"] div[id="edit-field-sede-direccion-country-wrapper"]').css('display', 'none');
		$('div[id="block-views-sedes-block"] div[id="edit-field-sede-venta-pais-reg-wrapper"]').css('display', 'none');
	};
	Drupal.theme.prototype.showSedesPanel = function () {
		$('div[id="loading"]').addClass('element-invisible');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="view-content"]').fadeIn('slow');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="view-filters"]').fadeIn('slow');
		$('div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"] > div[class*="attachment"]').removeClass('element-invisible');
	};

	// Apply changes when 'pais/region' panel is modified (or active)
	Drupal.theme.prototype.applyRegionOption = function () {

		// hide panels
		Drupal.theme.prototype.hideSedesPanel();

		// create query 'pais/region'
		var regquery = "";
		var pais = $( '#header select[id="sel-pais"] option:selected').text();
		var code = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
		var region = $( '#header select[id="sel-regions"] option:selected').text();
		if ( region == "Todas las regiones" ) { region = "" }
		if ( region != "" ) { regquery = pais + ',' + region }
		else { regquery = pais }

		// Sedes pages:
		// Chages the filter forms of Sedes!!!
		if ( $( 'form[id="views-exposed-form-sedes-block"]' ).length ) {
			$('form[id="views-exposed-form-sedes-block"] select[id="edit-field-sede-direccion-country"] > option[value="'+code+'" ').prop('selected', true);
			var lreg = region.toLowerCase();
			$( 'form[id="views-exposed-form-sedes-block"] div[id="edit-field-sede-direccion-locality-selective-wrapper"] div[class*="form-type-bef-checkbox"]').each(function(){
				if ( lreg != "" && $(' > input', this).attr('value').toLowerCase() == lreg ) {
					$(' > input', this).prop( "checked", true );
				} else {
					$(' > input', this).prop( "checked", false );
				}
			});
			if ( regquery != "" ) {
				$('form[id="views-exposed-form-sedes-block"] div[id="edit-field-sede-venta-pais-reg-wrapper"] input[id="edit-field-sede-venta-pais-reg"]').val(regquery);				
			}
			$('form[id="views-exposed-form-sedes-block"] div[id="edit-field-sede-direccion-locality-selective-wrapper"] input').change();
		}
		// Change title in 'Directorio verde' and 'Categories' pages
		if ( $( 'div[id="block-views-sedes-block"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}
		if ( $( 'div[class*="view-despierta-directorio-verde"]' ).length ) {
			var q = Drupal.theme.prototype.getTitleRegion( $('h1[id="page-title"]').text() );
			$('h1[id="page-title"]').html( q );
		}

		// Simple search:
		// Copy regions in the search panels (if apply)
		if ( $('form[id="views-exposed-form-sedes2-busq-simple"]').length ) {
			var $options = $('select[id="sel-regions"] > option').clone();
			$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-regions"] > option').remove();
			$('form[id="views-exposed-form-sedes2-busq-simple"] select[id="edit-regions"]').append($options);
		}
		// Add pais into 
		if ( $('form[id="views-exposed-form-sedes2-busq-simple"]').length ) {
			var pais = $('select[id="sel-pais"] option:selected').text();
			$('form[id="views-exposed-form-sedes2-busq-simple"] input[id="edit-pais"]').val(pais);
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
				var rid = region.toLowerCase();
				rid = rid.replace(/^\n*\s*/g,'');
				rid = rid.replace(/\n*\s*$/g,'');
				rid = rid.replace(/\s/g,'_');
				paises[code].regions[rid] = {
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
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, code) {
		var selHTML = '<select id="sel-regions">';		
		selHTML += '<option value="All">Todas las regiones</option>';
		if ( code !== "" ) {
			for (var idx in paisRegions[code].regions)  {
				var region = paisRegions[code].regions[idx];
				selHTML += '<option value="'+region.name+'" >'+region.name+'</option>';
			}
		}
		selHTML += '</select>';
		return $('<div class="sel-regions">' + selHTML + '</div>');
	};
	// Select: Specific Pais - Region (for Geolocation)
	// Eg, Drupal.theme.prototype.selectPaisRegion("Honduras", "Napo");
	Drupal.theme.prototype.selectPaisRegion = function (cPosition) {
		var code = cPosition['code'];
		var pais = cPosition['country'];
		var region = cPosition['locality'];
		if ( code !== undefined || code !== null || code !== "" ) {
			$('select[id="sel-pais"] > option[dp-pais-code="'+code+'"]').prop('selected', true);
		}
		if ( region !== undefined || region !== null || region !== "" ) {
			$('select[id="sel-regions"] > option[value="'+region+'"]').prop('selected', true);
		}
		return { 'pais': pais, 'region': region }
	}; 

  /**
   *
   * Sedes
   * 
   */

	// Create Sedes group
	Drupal.theme.prototype.sedesReport = function (elem) {
		var sedesReport = {};
		$('.view-grouping', elem).map( function (i, group) {
			var cat = $('.view-grouping-header', this).text();
			cat = cat.replace(/Categoria\:\s*/g,'');
			$( 'table', group ).map( function (i, table) {
				var subcat = $('caption:first', table).text();
				subcat = subcat.replace(/Subcategoria\:\s*/g,'');
				subcat = subcat.replace(/\n*\s*$/g,'');
				$('tbody > tr', table).map( function (j, tr) {
					var sede = {};
					var nid = "";
					var proximity = "";
					if ( $('td[class$="views-field-nid"]', tr).length ) {
						var val = $('td[class$="views-field-nid"]', tr).text().replace(/\n*\s*/g,'');
						nid = val;
						sede.nid = nid;
					}
					if ( $('td[class$="views-field-field-geofield-distance"]', tr).length ) {
						//var val = $('td[class$="views-field-field-geofield-distance"]', tr).text().replace(/\n*\s*/g,'');
						//sede.proximity = val;
					}
					if ( $('td[class$="views-field-field-location"]', tr).length ) {
						var val = $('td[class$="views-field-field-location"]', tr).text().replace(/\n*\s*/g,'');
						if ( val !== undefined && val != "" ) {
							sede.location = jQuery.parseJSON( val );
							sede.proximity = geoProximity( parseFloat(localStorage['longitude']), parseFloat(localStorage['latitude']), sede.location.coordinates[0], sede.location.coordinates[1]);
						}
					}
					if ( $('td[class$="views-field-title"]', tr).length ) {
						var val = $('td[class$="views-field-title"] > a', tr).text().replace(/\n*\s*/g,'');
						sede.title = val;
					}
					if ( $('td[class$="views-field-field-sede-logo"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-logo"] > img', tr).attr('src').replace(/\n*\s*/g,'');
						sede.logo = val;
					}
					if ( $('td[class$="views-field-field-sede-descripcion-breve"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-descripcion-breve"]', tr).text();
						val = val.replace(/^\n*\s*/g,'');
						val = val.replace(/\n*\s*$/g,'');
						sede.descb = val;
					}
					if ( $('td[class$="views-field-field-sede-descripcion-completa"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-descripcion-completa"]', tr).text();
						val = val.replace(/^\n*\s*/g,'');
						val = val.replace(/\n*\s*$/g,'');
						sede.descc = val;
					}
					if ( $('td[class$="views-field-field-sede-direccion-thoroughfare"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-direccion-thoroughfare"]', tr).text();
						val = val.replace(/^\s*/g,'');
						val = val.replace(/\s*$/g,'');
						val = val.replace(/\s*,\s*/g,', ');
						sede.direccion = val;
					}
					if ( $('td[class$="views-field-field-sede-direccion-postal-code"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-direccion-postal-code"]', tr).text().replace(/\n*\s*/g,'');
						sede.cp = val;
					}
					if ( $('td[class$="views-field-field-sede-direccion-locality"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-direccion-locality"]', tr).text();
						val = val.replace(/^\s*/g,'');
						val = val.replace(/\s*$/g,'');
						sede.locality = val;
					}
					if ( $('td[class$="views-field-field-sede-direccion-country"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-direccion-country"]', tr).text();
						val = val.replace(/^\s*/g,'');
						val = val.replace(/\s*$/g,'');
						sede.country = val;
					}
					if ( $('td[class$="views-field-field-sede-email"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-email"]', tr).text().replace(/\n*\s*/g,'');
						sede.email = val;
					}
					if ( $('td[class$="views-field-field-sede-web"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-web"]', tr).text().replace(/\n*\s*/g,'');
						sede.web = val;
					}
					if ( $('td[class$="views-field-field-sede-telefono"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-telefono"]', tr).text().replace(/\n*\s*/g,'');
						sede.tlf = val;
					}
					if ( $('td[class$="views-field-field-sede-tipo-actividad"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-tipo-actividad"]', tr).text();
						sede.t_act = val;
					}
					if ( $('td[class$="views-field-field-sede-tipo-movimiento"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-tipo-movimiento"]', tr).text();
						sede.t_mov = val;
					}
					if ( $('td[class$="views-field-field-sede-tipo-venta"]', tr).length ) {
						var val = $('td[class$="views-field-field-sede-tipo-venta"]', tr).text();
						sede.t_vent = val;
					}
					if ( $('td[class$="views-field-field-sede-pais"]', tr).length ) {
						var val = "";
						$('td[class$="views-field-field-sede-pais"] .lineage-item', tr).each(function(){ val += ';'+$(this).text(); });
						sede.p_serv = val;
					}
					if ( sedesReport[nid] === undefined ) {
						sedesReport[nid] = sede;
						sedesReport[nid].cats = {};
					}

					// concatenate 'directorio-verde' values (cat > subcat > etiqs)
					if ( $('td[class$="sede-etiq"]', tr).length ) {
						var val = $('td[class$="sede-etiq"]', tr).text();
						val = val.replace(/^\n*\s*/g,'');
						val = val.replace(/\n*\s*$/g,'');
						if ( sedesReport[nid].cats[cat] === undefined ) { sedesReport[nid].cats[cat] = {} }
						if ( sedesReport[nid].cats[cat][subcat] === undefined ) { sedesReport[nid].cats[cat][subcat] = {} }
						sedesReport[nid].cats[cat][subcat][val] = 1;
					}
				});
			});
		});
		return sedesReport;
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
				if ( iSedeObj.country != undefined ) { sede.country = iSedeObj.country.toLowerCase() }
				if ( iSedeObj.proximity != undefined ) { sede.proximity = iSedeObj.proximity }
				if ( iSedeObj.p_serv != undefined ) { sede.p_serv = iSedeObj.p_serv.toLowerCase() }
				// Region view
				if ( tabAll === true ) {
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
		var region = $('#header select[id="sel-regions"] option:selected').text().toLowerCase();
		var sortable = [];
		var sortableBy = {
			'locality': [],
			'country': [],
			'title': []
		};
		// sort by proximity visitor position
		for (var nid in sedesObj) { sortable.push([nid, sedesObj[nid].proximity]) }
		sortable.sort(function(a, b) {return a[1] - b[1]});
		for ( var i=0; i < sortable.length; i++ ) {
			var nid = sortable[i][0];
			var sedeObj = sedesObj[nid];		
			// 1. Check if sede has locality direction
			if ( sedeObj.locality != "" && ( sedeObj.locality == region ) ) {
				sortableBy.locality.push( sedeObj );
			}
			// 2. Check if sede has country direction
			else if ( sedeObj.country != "" && ( sedeObj.country == pais ) ) {
				sortableBy.country.push( sedeObj );
			}
			// 3. Check if sede works on locality
			else if ( sedeObj.p_serv != "" && ( sedeObj.p_serv.indexOf(';'+region) >=0 )) {
				sortableBy.title.push( sedeObj );
			}
			// 4. Check if sede works on country and the rest
			else {
				sortableBy.title.push( sedeObj );
			}
		}
		return sortableBy;
	};

	// Create HTML: tab List
	Drupal.theme.prototype.tabSedes = function (inSedesObj, tabAll) {
		var tabList = [];
		var todasTab = {};
		var endTab = {};
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
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('sedeArticle', inSedesObj[nid], tname);
				}
			}
			// 2. Sort by country direction (and proximity)
			if ( sortedSedes.country ) {
				var sedes = sortedSedes.country;
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('sedeArticle', inSedesObj[nid], tname);
				}
			}
			// 3. Sort by country where works (and proximity)
			if ( sortedSedes.title ) {
				var sedes = sortedSedes.title;
				for (var j=0; j < sedes.length; j++ ) {
					var nid = sedes[j].nid;
					tcont += Drupal.theme('sedeArticle', inSedesObj[nid], tname);
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
	Drupal.theme.prototype.sedeArticle = function (sedeObj, iCat) {
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

			sedHTML += '<div class="col-lg-5 col-md-5 col-sm-5 col-s-12 col-xs-12 text-right pull-right">';
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
				sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de movimiento:</p><p>' + sedeObj.t_mov + '</p></div>';
				sedHTML += '<div class="row"><p class="text-left col-xs-4">Descripción:</p><p>' + sedeObj.descc + '</p></div>';
				sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de actividad:</p><p>' + sedeObj.t_act + '</p></div>';
				sedHTML += '<div class="row"><p class="text-left col-xs-4">Tipo de venta:</p><p>' + sedeObj.t_vent + '</p></div>';
				if ( cats != "" ) {
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Categorías:</p><p>' + cats + '</p></div>';
				}
				if ( etiqs != "" ) {
					sedHTML += '<div class="row"><p class="text-left col-xs-4">Etiquetas:</p><p>' + etiqs + '</p></div>';					
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
			else if ( urlVars['q'].indexOf("user") >= 0 ) {
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

			
			/*
			 * SELECTORS:
			 */


			/* Pais/Regiones View */
			$('div[id="block-views-tax-regiones-block"]', context).once('despierta', function () {

				// Add the visitor location into 'localStorage' (if not exist)
				visitorLocation['country'] = $('div[id="block-views-visitor-location-block"] div[class$="views-field-country"] > span[class="field-content').text();
				visitorLocation['code'] = $('div[id="block-views-visitor-location-block"] div[class$="views-field-country-code"] > span[class="field-content').text();
				visitorLocation['locality'] = $('div[id="block-views-visitor-location-block"] div[class$="views-field-locality"] > span[class="field-content').text();
				visitorLocation['latitude'] = $('div[id="block-views-visitor-location-block"] div[class$="views-field-latitude"] > span[class="field-content').text();
				visitorLocation['longitude'] = $('div[id="block-views-visitor-location-block"] div[class$="views-field-longitude"] > span[class="field-content').text();
				if (jQuery.isEmptyObject(localStorage) || localStorage === undefined ||
					localStorage['country'] === undefined || localStorage['country'] == "" ||
					localStorage['locality'] === undefined || localStorage['locality'] == ""
				) {
					localStorage['country'] = visitorLocation['country'];
					localStorage['code'] = visitorLocation['code'];
					localStorage['locality'] = visitorLocation['locality'];
					localStorage['latitude'] = visitorLocation['latitude'];
					localStorage['longitude'] = visitorLocation['longitude'];
				}

				// Create Object: Pais - Regions
				allPaisRegionsObj = Drupal.theme.prototype.paisRegionesObj( $('.view-tax-regiones', this) );

				// Create HTML for 'Paises'
				var $paisHTML = Drupal.theme('paisSelectList', allPaisRegionsObj);
				$( '#header .region' ).prepend($paisHTML);

				// Create HTML for 'Regions'
				var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, localStorage['code']);
				$( '#header .region > div:nth-child(1)' ).after($regHTML);

				// Save 'localStorage' into 'options'
				Drupal.theme.prototype.selectPaisRegion(localStorage);
				
				// Apply 'pais/regions' options
				Drupal.theme.prototype.applyRegionOption();

				// Delete: tax_regions and visitor location Views
				$('div[id="block-views-tax-regiones-block"]').remove();
				$('div[id="block-views-visitor-location-block"]').remove();
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
			$( 'form[id^="views-exposed-form-sedes2"] label[for="edit-regions"]' ).remove();
			$('form[id^="views-exposed-form-sedes2"] .views-submit-button input').each( function() {
				$(this).addClass('btn btn-success');
				$(this).css('width', '69px');
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
			$( 'form[id^="views-exposed-form-sedes2"] input[id="edit-loc"]' ).attr('placeholder', 'Localidad');
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
								$( 'div[id^="edit-regions-wrapper"] .form-item', this ).html()+
								$( 'div[id^="edit-loc-wrapper"] .form-item', this ).html()+
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
				$('select[id="edit-regions"]', this).attr('disabled', 'disabled');
			});
			// Simple
			$('form[id^="views-exposed-form-sedes2-busq-simple"]', context).once('despierta', function () {
				// hide 'pais' field
				$('div[id="edit-pais-wrapper"]', this).addClass('element-invisible');
				// Field the 'pais' for simple search
				var pais = $('select[id="sel-pais"] option:selected').text();
				$('input[id="edit-pais"]', this).val(pais);
			});

			
			/* Printing Sedes */
			// Print new sedes view (Once)
			$(	'div[id="block-views-sedes-block"] div[class*="view-id-sedes"][class*="view-display-id-block"], '+
				'.view-id-sedes2').once("DOMSubtreeModified",function() {
				var subcats = {};
				var sedeHTML = "";

				// Content:
				if ( $('> div[class="view-content"]', this).length ) {
					// Create Object: Sedes
					var sedesReport = Drupal.theme.prototype.sedesReport($('.view-content', this));

					// Chech where we are...
					// in the frontpage: print all
					// in the category page: get sub-categories
					var tabAll = true;
					if ( urlVars['q'] !== undefined && urlVars['q'] !== "" && urlVars['q'].indexOf("directorio-verde") >= 0 ) {
						tabAll = false;
					}

					// Print sedes list
					var sedeHTML = Drupal.theme('tabSedes', sedesReport, tabAll);
					$('> div[class*="view-content"]', this).append( $(sedeHTML) );
					$('> div[class="view-content"] > div:not([class="tab-despierta"])', this).remove();

	 				// Event Click: sedes more info
					$('> div[class*="view-content"]', this).on( 'click', '.resultados .info.url', function() {
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
				}
				else { // NO RESULTS
					var noSedeHTML = '<div class="view-content">' + htmlNoResults + '</div>';
					$(this).prepend( $(noSedeHTML) );
				}

				// Filter:
				// move elements
				if ( $('> div[class*="view-filters"]', this).length ) {
					var $filters = $('> div[class*="view-filters"]', this).clone();
					$('> div[class*="view-filters"]', this).remove();
					$(this).append($filters);
				}

			});


			/* Filter form: Sede */
			$('form[id="views-exposed-form-sedes-block"]', context).once('despierta', function () {
				var pais = $( '#header select[id="sel-pais"] option:selected').text();
				var code = $( '#header select[id="sel-pais"] option:selected').attr('dp-pais-code');
				var region = $('#header select[id="sel-regions"] option:selected').text();
				// If user selects All regions
				if ( region == "Todas las regiones" ) {
					// delete redundance in regions, When we are in the category page:
					$('div[id="edit-field-sede-direccion-locality-selective-wrapper"] div[class*="form-item-edit-field-sede-direccion-locality-selective"]', this).each( function() {
						var labregion = $('label', this).text();
						if ( allPaisRegionsObj[code] !== undefined ) {
							var id = labregion.toLowerCase();
							id = id.replace(/^\n*\s*/g,'');
							id = id.replace(/\n*\s*$/g,'');
							id = id.replace(/\s/g,'_');						
							if ( allPaisRegionsObj[code].regions[id] === undefined ) {
								$(this).remove();
							}
						}
					});	
				}
				else { // If we have already selected region
					// hide exposed filter of regions
					$('div[id="edit-field-sede-direccion-locality-selective-wrapper"]', this).addClass('element-invisible');
				}
				// Remove description label
				$('div[class*="form-type-select"] div[class="description"]', this).remove();
				// Work with the filter form
				$(	'div[id="edit-field-sede-direccion-locality-selective-wrapper"], '+
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
				});
				// Capture change event
				$(this).change(function(event) {
					$('div[id="block-views-sedes-block"] .view-id-sedes > .view-content').css('opacity', '0.2');
					$('div[id="block-views-sedes-block"] .view-id-sedes > .attachment').css('opacity', '0.2');
					$('div[id="block-views-sedes-block"] .view-id-sedes > .view-filters').css('opacity', '0.5');
					$('div[id="loading"]').removeClass('element-invisible');
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
				$('input[id="edit-field-sede-descripcion-breve-und-0-value"]', this).attr('placeholder','Introduce una descripción breve de la entidad');
				$('input[id="edit-field-sede-descripcion-breve-und-0-value"]', this).css('resize', 'none');
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
				$('form[id="sede-node-form"] div[class*="form-item-field-sede-direccion-und-0-premise"]').remove();
				$('form[id="sede-node-form"] div[class*="form-item-field-sede-direccion-und-0-dependent-locality"]').remove();
				if ( $( 'option:selected', this ).text().indexOf("Ninguno") == -1 ) {
					var regHTML = '<div class="form-item form-type-select form-item-field-sede-direccion-und-0-administrative-area">'+
									'<label for="edit-field-sede-direccion-und-0-administrative-area">Región </label>'+
									'<select class="state form-select form-control" autocomplete="address-level1" id="edit-field-sede-direccion-und-0-administrative-area" name="field_sede_direccion[und][0][administrative_area]">'+
									'</select></div>';
					$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] .addressfield-container-inline').append(regHTML);
					var classes = $('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] div[class*="addressfield-container"]').attr('class');
					var regExp = /country\-([^)]+)/;
					var matches = regExp.exec(classes);
					if ( matches.length > 1 ) {
						var code = matches[1];
						var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, code);
						$options = $('option:not([value="All"])', $regHTML).clone();
						$('form[id="sede-node-form"] .form-item-field-sede-direccion-und-0-administrative-area').remove();
						$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] .addressfield-container-inline').append(regHTML);							
						$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] select[id="edit-field-sede-direccion-und-0-administrative-area"]').append($options);
					}
				}
				// Direccion required if 'establecimiento fisico' is checked
				if ( $('form[id="sede-node-form"] input[id="edit-field-sede-tipo-venta-und-1792"]').is(':checked') ) {
					$('form[id="sede-node-form"] div[id="edit-field-sede-direccion"] .fieldset-description').each( function() {
						$(this).append(' <span class="form-required">*</span>');
					});
				}
			});
			// Changes for 'Pais/regiones' where sell
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
			 // hide
			 Drupal.theme.prototype.hideSedesPanel();

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
					localStorage['country'] = pais;
					localStorage['code'] = code;
					localStorage['locality'] = region;					
					var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, code);
					$( '#header div[class="sel-regions"]' ).replaceWith($regHTML);					
				}
				// region has been changed
				else if ( $(this).attr('id') == "sel-regions" ) {
					var region = $( 'option:selected', this ).text();
					if ( region == "Todas las regiones" ) { region = "" }
					localStorage['locality'] = region;
				}

				// Apply 'pais/regions' options
				Drupal.theme.prototype.applyRegionOption();
			});

			// Changes in the 'pais/region' options (Advances Search panel):
			$(context).delegate('form[id="views-exposed-form-sedes2-busq-avan"] select[id="edit-pais"]', 'change', function(event) {
				var pais = $( 'option:selected', this ).text();
				var code = $( '#header select[id="sel-pais"] option[value="'+pais+'"]').attr('dp-pais-code');
				var $options;
				if ( pais != "Elige el país" && pais != "" && pais != undefined ) {
					var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, code);
					$options = $('option', $regHTML).clone();
					$('form[id="views-exposed-form-sedes2-busq-avan"] select[id="edit-regions"]').removeAttr('disabled');
				}
				else {
					$options = $('<option value="All">Elige una región</option>');
				}
				$('form[id="views-exposed-form-sedes2-busq-avan"] select[id="edit-regions"] > option').remove();
				$('form[id="views-exposed-form-sedes2-busq-avan"] select[id="edit-regions"]').append($options);
			});
			// Add classes for the new 'sedes' pages
			$('div[id="block-views-sedes-block"] .view-id-sedes > div[class*="view-content"] div[class="tab-despierta"] ul[class*="nav-tabs"]').addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12');
			$('div[id="block-views-sedes-block"] .view-id-sedes > div[class*="view-content"] div[class="tab-despierta"] div[class*="tab-content"]').addClass('col-lg-7 col-md-7 col-s-12 col-sm-12 col-xs-12 pull-left');
			$('div[id="block-views-sedes-block"] .view-id-sedes > div[class*="attachment"]').addClass('col-lg-5 col-md-5  col-s-12 col-sm-12 col-xs-12 pull-right');
			$('div[id="block-views-sedes-block"] .view-id-sedes > div[class="view-filters"]').addClass('col-lg-5 col-md-5 col-s-12 col-sm-12 col-xs-12 pull-right');
			$('.ajax-progress-throbber').addClass('element-invisible');

		} // end: attach of despierta theme
	};

})(jQuery);