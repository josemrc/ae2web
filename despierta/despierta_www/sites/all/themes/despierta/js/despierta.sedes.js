(function ($) {

/**
* Global vars
*/
	var urlPaths = getUrlPaths();

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
					// Region view
					if ( tabHeader['Todas'] === undefined ) { tabHeader['Todas'] = {} }
					tabHeader['Todas'][nid] = sede;
					//if ( urlPaths !== undefined && urlPaths.length > 0 && ( urlPaths[0] === 'home' || urlPaths[0] === 'busqueda-simple' || urlPaths[0] === 'busqueda-avanzada' ) ) {
console.log("urlPaths");
console.log(urlPaths);
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
		var home = false;
		if ( urlPaths !== undefined && urlPaths.length > 0 && ( urlPaths[0] === 'home' ) ) {
			home = true;
		}
		for ( var cat in inReport ) {
			if ( home === true ) {
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

				// Search Panels:
				// Modify the region value for Simple Search
				if ( $(context.context).attr('id') === 'views-exposed-form-sedes2-busq-simple' ) {
					var rcode = $('select[id="edit-region"] option:selected', context.context).attr('dp-reg-code');
					$('form[id="views-exposed-form-sedes2-busq-simple"] #edit-region > option[value="'+rcode+'"]').prop('selected', true);
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

})(jQuery);