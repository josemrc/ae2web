(function ($) {
  /**
   * Global vars
   */
	var allPaisRegionsObj = {};
	if (localStorage['region'] == "Todas las regiones") { localStorage['region'] = "" }

	// Warning!! HARD-CORE
	if (localStorage['pais'] === undefined || localStorage['pais'] == "") { localStorage['pais'] = "España" }
	if (localStorage['region'] === undefined || localStorage['region'] == "") { localStorage['region'] = "Madrid" }

	var htmlNoResults = '<section class="resultados col-lg-6 col-md-10 col-xs-10"><div class="alert alert-info" role="alert">No hay resultados para ésta búsqueda</div><nav><ul class="pagination"></ul></nav></section>';

	// Var that controls every block is ready after changes
	var waitFlag = {
		'regions': 'wait',
	};
			var waitApp = (function () {
				var pleaseWaitDiv = $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><p>Cargando...</p><div class="flower-loader"></div></div>');
				return {
					showPleaseWait: function() {
console.log('showPleaseWait');
console.log(waitFlag);
						if ( !jQuery.isEmptyObject(waitFlag) ) {
							// $('div[id="page-wrapper"]').css('display','none');
							pleaseWaitDiv.modal('show');
						}
					},
					hidePleaseWait: function () {
console.log('hidePleaseWait');
console.log(waitFlag);
						if ( jQuery.isEmptyObject(waitFlag) ) {
							$('div[id="page-wrapper"]').css('display','block');
							pleaseWaitDiv.modal('hide');
						}
					},
			    };
			})();

 //  /**
 //   *
 //   * Global functions.
 //   * 
 //   */

	// // Read a page's GET URL variables and return them as an associative array.
	// function getUrlVars () {
	// 	var vars = [], hash;
	// 	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

	// 	for(var i = 0; i < hashes.length; i++) {
	// 		hash = hashes[i].split('=');
	// 		vars[hash[0]] = decodeURIComponent( hash[1] );
	// 	}
	// 	return vars;
	// }
	// $(window).load(function() {
	// 	var urlVars = getUrlVars();
	// 	if ( urlVars['q'] == "legal" ) {
	// 		// change title
	// 		$('h1[id="page-title"]').text("Aviso legal");
	// 	}
	// 	else if ( urlVars['q'] == "usuario/login" ) {
	// 		// remove title
	// 		$('h1[id="page-title"]').remove();
	// 	}
	// 	else if ( urlVars['q'] == "usuario/recuperar" ) {
	// 		// remove title
	// 		$('h1[id="page-title"]').remove();
	// 	}
	// 	else if ( urlVars['q'] == "empresa/registro" ) {
	// 		// remove title
	// 		$('h1[id="page-title"]').remove();
	// 	}
		
	// 	// Display none 'sede' list
	// 	$('div[id="block-views-ver-tax-block"]').css('display', 'none');
	// 	// $('div[id="block-views-sedes-block-regiones"]').css('display', 'none');
	// 	// $('div[id="block-views-sedes-block-cat"]').css('display', 'none');
	// 	$('div[id="block-views-sedes-block-subcat"]').css('display', 'none');
	// });

  /**
   *
   * Global functions.
   * 
   */
	// Read a page's GET URL variables and return them as an associative array.
	Drupal.theme.prototype.getUrlVars = function (elem) {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars[hash[0]] = decodeURIComponent( hash[1] );
		}
		return vars;
	}

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
					'regions': []
				};
			}
			paises[pais].regions.push({
				'name': region,
				'enable': used
			});
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
			var disabled = ( pais.enable === "false" ) ? "disabled" : "";
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
				var disabled = ( region.enable === "false" ) ? "disabled" : "";
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

	// Create Object: SedesTabs
	Drupal.theme.prototype.sedesGroups = function (elem) {
		var sedesGroups = {};
		$('.view-grouping', elem).each( function (i, table) {
			var sedeGroup = $('.view-grouping-header', this).text();
			var sedesObj = Drupal.theme.prototype.sedesObj($('.view-grouping-content', this));
			sedesGroups[sedeGroup] = sedesObj;
		});
		return sedesGroups;
	};
	

	// Sedes has to be group by Nid
	Drupal.theme.prototype.sedesObj = function (elem) {
		var sedes = {};
		$('table', elem).each( function (i, table) {
			var nid = $('caption:first', table).text().replace(/ /g,'');
			if ( sedes[nid] === undefined ) {
				var sede = {
					title: "",
					logo: "",
					descb: "",
					descc: "",
					email: "",
					web: "",
					tlf: "",
					region: "",
					t_act: "",
					t_mov: "",
					t_vent: "",
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
						else if ( k == 5 ) { // email							
							sede.email = $('a', td).text().replace(/\n*\s*/g,'');
						}
						else if ( k == 6 ) { // web
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.web = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 7 ) { // tlf
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.tlf = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 8 ) { // pais/region
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.region = val.replace(/\n*\s*/g,'');
						}
						else if ( k == 9 ) { // tipo actividad
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_act = val;
						}
						else if ( k == 10 ) { // tipo movimiento
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_mov = val;
						}
						else if ( k == 11 ) { // tipo venta
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							sede.t_vent = val;
						}
						else if ( k == 12 ) { // Categoria
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							if ( sede.cat[val] === undefined ) { sede.cat[val] = {} }
							cat = val;
						}
						else if ( k == 13 ) { // Sub-Categoria
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							if ( sede.cat[cat][val] === undefined ) { sede.cat[cat][val] = [] }
							subcat = val;
						}
						else if ( k == 14 ) { // Etiquetas
							var val;
							if ( $('a', td).length ) { val = $('a', td).text() }
							else { val = $(td).text() }
							val = val.replace(/\n*/g,'');
							val = val.replace(/^\s*/g,'');
							val = val.replace(/\s*$/g,'');
							sede.cat[cat][subcat].push( val );
							if ( sede.etiqs[val] === undefined ) { sede.etiqs[val] = 1 }
						}
					});
				});
				sedes[nid] = sede;			
			}
		});
		return sedes;
	};

	// Extract the number of subcategories
	Drupal.theme.prototype.getNumSubCategories = function(sedesObj, inCat) {
		var subcats = {};
		for ( var nid in sedesObj ) {
			var sede = sedesObj[nid];
			if ( inCat !== undefined ) {
				for ( var sname in sede.cat[inCat] ) {
						if ( subcats[sname] === undefined ) { subcats[sname] = 1 }
						else { subcats[sname] += 1 }
				}
			}
			else {
				for ( var cname in sede.cat ) {
					for ( var sname in sede.cat[cname] ) {
						if ( subcats[sname] === undefined ) { subcats[sname] = 1 }
						else { subcats[sname] += 1 }
					}
				}
			}
		}
		return subcats;
	};
	
	// Create HTML: tab List
	Drupal.theme.prototype.tabSedes = function (sedesObj) {
		var tabList = [];
		var keys = Object.keys(sedesObj).sort();
		for (var i=0; i < keys.length; i++ ) {
			var key = keys[i];
			var sedeObj = sedesObj[key];
			var label = key.replace(/^[^\:]*\:\s*/g,'');
			var id = label.replace(/\s/g,'_');
			tabList.push({
				'id': id,
				'label': label,
				'cont': Drupal.theme('sedeArticle', sedeObj)
			});
		}
		var tabHTML = Drupal.theme('createTabPanel', tabList, "tabSedes");
		return tabHTML;
	};

	// Create HTML: article
	Drupal.theme.prototype.sedeArticle = function (sedesObj) {
		var sedHTML = '<section class="col-lg-7 col-md-7 col-sm-7 col-xs-12 resultados">';
		for ( var nid in sedesObj ) {
			var sedeObj = sedesObj[nid];
			sedHTML += '<article class="media ">';

			sedHTML += '<div class="logoempresa col-lg-2 col-md-3 col-sm-3 col-xs-3">';
			sedHTML += '<img class="media-object" src="' + sedeObj.logo + '">';
			sedHTML += '</div>';

			sedHTML += '<div class="media-bod col-lg-10 col-md-9 col-sm-9 col-xs-12 prici">';
				sedHTML += '<div class="col-md-6 col-sm-6 col-xs-12">';
					sedHTML += '<h2>' + sedeObj.title + '<div class="info url"><span>+ info</span>';
						sedHTML += '<img class="ico_flecha" src="sites/default/files/ico_flecha.png">';
					sedHTML += '</div></h2>';
					sedHTML += '<div class="inform  text-justify clean"><p class="desc_breve">' + sedeObj.descb + '</p></div>';
				sedHTML += '</div>';
				sedHTML += '<div class="col-md-6 col-sm-6 col-xs-12 text-right">';
					sedHTML += '<p class="direccion"></p>';
					sedHTML += '<p><img class="ico" src="sites/default/files/ico_tlfno.png"><a class="url" href="tel:">' + sedeObj.tlf + '</a></p>';
					sedHTML += '<p><img class="ico" src="sites/default/files/ico_email.png"><a class="url" href="mailto:">' + sedeObj.email + '</a></p>';
					sedHTML += '<p class="ult"><img class="ico" src="sites/default/files/ico_url.png"><a class="url" href="www.despierta.org" target="_blank" rel="nofollow">' + sedeObj.web + '</a></p>';
				sedHTML += '</div>';
				sedHTML += '<div class="clean subrayado col-md-12"></div>';
				sedHTML += '<div class="clean masinfo col-md-12">';
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Tipo de venta:</p><p class="col-xs-8">' + sedeObj.t_vent + '</p></div>';
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Tipo de actividad:</p><p class="col-xs-8">' + sedeObj.t_act + '</p></div>';
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Tipo de movimiento:</p><p class="col-xs-8">' + sedeObj.t_mov + '</p></div>';
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Descripción:</p><p class="col-xs-8">' + sedeObj.descc + '</p></div>';
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Etiquetas:</p><p class="col-xs-8">' + Object.keys(sedeObj.etiqs).join(', ') + '</p></div>';

				sedHTML += '</div>';
			sedHTML += '</div> <!-- media-bod -->';

			sedHTML += '</article>';
		}
		sedHTML += '</section>';


// <article class="media ">
// 	
		


// 		<div class="col-md-6 col-sm-6 col-xs-12 text-right">
// 			<p class="direccion"></p>
			
			
// 			<!-- <p class="enlacemapa"><a href="" target="_blank"><img class="ico mapa" src="http://www.despierta.org/images/ico_mapa.png">Ver mapa</a></p>-->
// 			<p class="imgmapa enlacemapa">
// 				<!-- <img class="mapa" src="http://www.despierta.org/images/mapa.jpg">-->
// 				<!--  -->
// 			</p>
// 			<!-- <p><img class="ico" src="http://www.despierta.org/images/ico_tlfno.png"><a class="url" href="tel:"></a></p> -->
			
// 			<!-- <p><img class="ico" src="http://www.despierta.org/images/ico_email.png"><a class="url" href="mailto:"></a></p> -->
			
// 			<!-- <p class="ult"><img class="ico" src="http://www.despierta.org/images/ico_url.png"><a class="url" href="<p class="ult"><img class="ico" src="http://www.despierta.org/images/ico_url.png"><a class="url" href="www.despierta.org" target="_blank" rel="nofollow">www.despierta.org</a></p>"><p class="ult"><img class="ico" src="http://www.despierta.org/images/ico_url.png"><a class="url" href="www.despierta.org" target="_blank" rel="nofollow">www.despierta.org</a></p></a></p> -->
// 			<p class="ult"><img class="ico" src="http://www.despierta.org/images/ico_url.png"><a class="url" href="www.despierta.org" target="_blank" rel="nofollow">www.despierta.org</a></p>
// 		</div>


// 		<!--
// 		<div class="resumen"></div>
// 		<div class="location_info">
// 			<ul>
// 				<li>Direcci&oacute;n: </li>
// 				<li>Provincia: </li>
// 				<li>&iquest;Sucursal principal?: </li>
// 			</ul>
// 		</div>
// 		<div class="expandido">
// 			<p></p>
// 			<h4>Tipo de venta</h4>
// 			<ul>
// 				<li>Venta online.</li>
// 				<li>Establecimiento físico</li>
// 				<li>Servicio a domicilio</li>
// 				<li>Venta mayorista.</li>
// 				<li>Servicio online</li>
// 				<li>Alquiler online.</li>
// 				<li>Venta telefónica.</li>
// 				<li>Reserva online.</li>
// 				<li>Reserva telefónica.</li>
// 				<li>Otros</li>
// 			</ul>
// 			<div class="datossede">
// 				<p>web de la empresa</p>
// 				<p>email de esta sede</p>
// 				<p>tel&eacute;fono de la sede</p>
// 			</div>
// 			<div class="sellos">
// 				<img width="100" src="http://www.despierta.org/images/stamps/sello1.jpg"/>
// 				<img width="100" src="http://www.despierta.org/images/stamps/sello1.jpg"/>
// 				<img width="100" src="http://www.despierta.org/images/stamps/sello1.jpg"/>
// 			</div>
// 		</div>-->

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
			// By using the 'context' variable we make sure that our code only runs on
			// the relevant HTML. Furthermore, by using jQuery.once() we make sure that
			// we don't run the same piece of code for an HTML snippet that we already
			// processed previously. By using .once('foo') all processed elements will
			// get tagged with a 'foo-processed' class, causing all future invocations
			// of this behavior to ignore them.

			// waitApp.showPleaseWait();

			var urlVars = Drupal.theme.prototype.getUrlVars();
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

			/* Pais/Regiones View */
			$('div[id="block-views-tax-regiones-block"]', context).once('despierta', function () {
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

				// Active 'Sedes' views with initial pais/regions
				// 'sedes regions'
				Drupal.theme.prototype.selectPaisRegion(localStorage['pais'], localStorage['region']);
				if ( $( 'div[id="block-views-sedes-block-regiones"]' ).length ) {
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-pais"]' ).val(localStorage['pais']);
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).val(localStorage['region']);
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]').change();					
				}
				// 'sedes category'
				else if ( $( 'div[id="block-views-sedes-block-cat"]' ).length ) {
					$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]' ).val(localStorage['pais']);
					$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]').change();
				}
				// 'sedes sub-category'
				else if ( $( 'div[id="block-views-sedes-block-subcat"]' ).length ) {
					$( 'form[id="views-exposed-form-sedes-block-subcat"] input[id="edit-pais"]' ).val(localStorage['pais']);
					$( 'form[id="views-exposed-form-sedes-block-subcat"] input[id="edit-pais"]').change();
				}
				delete waitFlag['regions'];
				// waitApp.hidePleaseWait();
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
			
			/* Printing 'sedes' of 'Regiones' and 'Categories' (and 'Subcategories') */
			// Print new sedes view (Once)
			$(	'div[id="block-views-sedes-block-regiones"] .view-id-sedes, '+
				'div[id="block-views-sedes-block-cat"] .view-id-sedes, '+
			  	'div[id="block-views-sedes-block-subcat"] .view-id-sedes,'+
			  	'.view-id-sedes2'
			).once("DOMSubtreeModified",function(){
				var subcats = {};
				var sedeHTML = "";

				if ( $('.view-content', this).length ) {
					// Create Object: Sedes
					// var sedesObj = Drupal.theme.prototype.sedesObj($('.view-content', this));
					var sedesGroups = Drupal.theme.prototype.sedesGroups($('.view-content', this));

					// Add num. sedes within sub-categories
					var cat = "";
					if ( $('.view-ver-tax h3').length ) {
						cat = $( '.view-ver-tax h3' ).text();
						$( '.view-ver-tax h3' ).replaceWith('<p><span class="cat-title">' + cat + '</span></p>');					
					}
					else if ( $('.view-ver-tax span.cat-title').length ) {
						cat = $( '.view-ver-tax span.cat-title' ).text();
					}
					// Extract num. sub-categories
					//subcats = Drupal.theme.prototype.getNumSubCategories(sedesGroups, cat);

					// Create HTML
					var sedeHTML = Drupal.theme('tabSedes', sedesGroups);
					//sedeHTML = 	'<div id="tabBusq" class="col-lg-12 col-md-12 col-sm-12 col-xs-12">' + sedeHTML + '</div>';
					$('.view-content', this).remove();

				}
				// NO RESULTS
				else {
					sedeHTML = '<div class="view-content">' + htmlNoResults + '</div>';
					$('.view-filters', this).addClass('element-invisible');
				}
				// Print sedes list
				$(this).append( $(sedeHTML) );

				// Print num. sub-cagtegories
				$('.view-ver-tax a').map( function () {
					var val = $(this).text();
					val = val.replace(/^\s*/g,'');
					val = val.replace(/\s*$/g,'');
					val = val.replace(/\s*\(\d*\)\s*$/g,'');
					var num = 0;
					if ( !jQuery.isEmptyObject(subcats) && subcats[val] !== undefined ) { num = subcats[val] }
					$(this).contents().last().remove();
					$ ( this ).append( val+" ("+num+")" );
				});

	 			// Event Click: sedes more info
				$('.view-content', this).on( 'click', '.resultados .info.url', function() {
					if ( $('img',this).hasClass('more_info') ) { // change to down (-> hide)
						$('img',this).removeClass('more_info');
						$('img', this).rotate({ animateTo:0});
						$('span',this).html('+ info');
						$(this).closest('.media-bod').children('.masinfo').fadeOut(500);
						$(this).parents('article').animate({height: '120px'}, 500);
					}
					else { // change to up (-> show)
						$('img',this).addClass('more_info');
						$('img', this).rotate({ animateTo:180});
						$('span',this).html('- info');
						$(this).closest('.media-bod').children('.masinfo').fadeIn(500);
						$(this).parents('article').animate({height:'100%'}, 500);
					}
				});
				$('div[id="block-views-ver-tax-block"]').css('display', 'block');
				$('div[id="block-views-sedes-block-regiones"]').css('display', 'block');
				$('div[id="block-views-sedes-block-cat"]').css('display', 'block');
				$('div[id="block-views-sedes-block-subcat"]').css('display', 'block');
			});
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

				$('input[id="edit-title"]', this).attr('placeholder','Introduce el nombre comercial como anunciante para esta Sede');
				$('textarea[id="edit-field-sede-descripcion-breve-und-0-value"]', this).attr('placeholder','Introduce una descripción breve de la entidad');
				$('textarea[id="edit-field-sede-descripcion-breve-und-0-value"]', this).css('resize', 'none');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).attr('placeholder','Incluye todas las palabras, productos y servicios con los que trabaja tu entidad para que ésta sea más fácil de localizar en nuestro Buscador Verde');
				$('textarea[id="edit-field-sede-descripcion-completa-und-0-value"]', this).css('resize', 'none');

				$('div[class^="term-reference-tree-button"]', this).css('cursor', 'pointer');

				$('input[id="edit-field-sede-logo-und-0-upload"]', this).addClass("filestyle");
				$('input[id="edit-field-sede-logo-und-0-upload-button"]', this).attr('value','Subir Imagen');

				$('input[id="edit-field-sede-region-venta-und-hierarchical-select-dropbox-add"]', this).addClass("btn btn-success pull-right");

				$('input[id="edit-submit"]', this).addClass("btn btn-success pull-right");
				$('input[id="edit-preview"]', this).remove();				
			});


			/* Add clasess for multiple elements */
			$('.view-despierta-directorio-verde', context).once('despierta', function () {
				$('img', this).each( function() {
					$(this).addClass('imgcateg');
				})
			});
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
			// Hide filter elements of 'Paises' within "Directorio verde" pages
			$('form[id="views-exposed-form-sedes-block-regiones"]', context).once('despierta', function () {
				$(this).addClass('element-invisible');
			});
			$('form[id="views-exposed-form-sedes-block-cat"] div[id="edit-pais-wrapper"]', context).once('despierta', function () {
				$(this).addClass('element-invisible');
			});
			$('form[id="views-exposed-form-sedes-block-subcat"] div[id="edit-pais-wrapper"]', context).once('despierta', function () {
				$(this).addClass('element-invisible');
			});
			$('.region-triptych-first').addClass('col-md-4');
			$('.region-triptych-middle').addClass('col-md-4');
			$('.region-triptych-last').addClass('col-md-4');

			/* Events */
			// Display none 'sede' list
			$('div[id="block-views-ver-tax-block"]').css('display', 'none');
			// $('div[id="block-views-sedes-block-regiones"]').css('display', 'none');
			// $('div[id="block-views-sedes-block-cat"]').css('display', 'none');
			$('div[id="block-views-sedes-block-subcat"]').css('display', 'none');

			// Event: Create regions when pais changes
			$( '#header select[id="sel-pais"]' ).change( function(event) {
				// Display none 'sede' list
				$('div[id="block-views-sedes-block-cat"]').css('display', 'none');
				$('div[id="block-views-sedes-block-subcat"]').css('display', 'none');

				var pais = $( 'option:selected', this ).text();
				var region = "";
				if ( pais == "Todos los paises" ) { pais = "" }	
				localStorage['pais'] = pais;
				localStorage['region'] = region;
				
				var $regHTML = Drupal.theme('regionesSelectList', allPaisRegionsObj, pais);
				$( '#header div[class="sel-regions"]' ).replaceWith($regHTML);

				// If we are in frontapge  page => Select given 'pais'
				if ( $( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-pais"]' ).length ) {
					event.stopPropagation();
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).val(region);
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-pais"]' ).val(pais);
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-pais"]' ).change();
				}
				// If we are in categories of 'directorio-verde' page => Select given 'pais'
				else if ( $( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]' ).length ) {
					event.stopPropagation();
					$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]' ).val(pais);
					$( 'form[id="views-exposed-form-sedes-block-cat"] input[id="edit-pais"]' ).change();
				}
				// If we are in sub-categories of 'directorio-verde' page => Select given 'pais'
				else if ( $( 'form[id="views-exposed-form-sedes-block-subcat"] input[id="edit-pais"]' ).length ) {
					event.stopPropagation();
					$( 'form[id="views-exposed-form-sedes-block-subcat"] input[id="edit-pais"]' ).val(pais);
					$( 'form[id="views-exposed-form-sedes-block-subcat"] input[id="edit-pais"]' ).change();
				}
			});
			$( '#header select[id="sel-regions"]' ).change( function(event) {
				var region = $( 'option:selected', this ).text();
				if ( region == "Todas las regiones" ) { region = "" }
				localStorage['region'] = region;
				// If we are in frontapge  page => Select given 'pais'
				if ( $( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).length ) {
					event.stopPropagation();
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).val(region);
					$( 'form[id="views-exposed-form-sedes-block-regiones"] input[id="edit-region"]' ).change();
				}
				// If we are in categories of 'directorio-verde' page => Select given 'pais'
				else if ( $( 'form[id="views-exposed-form-sedes-block"] input[id="edit-pais"]' ).length ) {
					event.stopPropagation();
					$( 'form[id="views-exposed-form-sedes-block"] input[id="edit-pais"]' ).val(region);
					$( 'form[id="views-exposed-form-sedes-block"] input[id="edit-pais"]' ).change();
				}
			});
			// Active Busqueda tabs
			$('#tabBusq').delegate('ul a', 'click', function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			// $(document).ready(function() {
			//     $(".tabbable.responsive").resptabs(); 
			// });
			// fakewaffle.responsiveTabs(['xs', 'sm']);
		    // $('.js-example').bootstrapResponsiveTabs({
		    //   minTabWidth: 80,
		    //   maxTabWidth: 150
		    // });
			$('#tabSedes').tabCollapse({
			    tabsClass: 'hidden-sm hidden-xs',
			    accordionClass: 'visible-sm visible-xs'
			});

			waitApp.hidePleaseWait();

		}
	};

})(jQuery);