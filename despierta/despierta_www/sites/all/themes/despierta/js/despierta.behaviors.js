(function ($) {
  /**
   * Global vars
   */
  var paisRegionsObj = {};

  /**
   * The recommended way for producing HTML markup through JavaScript is to write
   * theming functions. These are similiar to the theming functions that you might
   * know from 'phptemplate' (the default PHP templating engine used by most
   * Drupal themes including Omega). JavaScript theme functions accept arguments
   * and can be overriden by sub-themes.
   *
   * In most cases, there is no good reason to NOT wrap your markup producing
   * JavaScript in a theme function.
   */

  /**
   *
   * Pais / Regions functions.
   * 
   */

	// Create Object: Pais - Regions
	Drupal.theme.prototype.paisRegionesObj = function (elem) {
		var regions = {};
		$('.region', elem).map( function () {
			var region = $(this).text();
			var pais = $(this).attr('dp-pais');
			if ( regions[pais] === undefined ) {
				regions[pais] = [];
			}
			regions[pais].push(region)
		});
		return regions;
	};
	// Create HTML select option
	Drupal.theme.prototype.paisSelectList = function (paisRegions) {
		var selHTML = '<select>';
		for (var pais in paisRegions)  {
			selHTML += '<option value="'+pais+'">'+pais+'</option>';
		}
		selHTML += '</select>';
		return $('<div id="sel-pais">' + selHTML + '</div>');
	};
	// Create HTML select option
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, pais) {
		var selHTML = '<select>';
		for (var idx in paisRegions[pais])  {
			var region = paisRegions[pais][idx];
			selHTML += '<option value="'+region+'">'+region+'</option>';
		}
		selHTML += '</select>';
		return $('<div id="sel-regions">' + selHTML + '</div>');
	};
	// Select: Specific Pais - Region (for Geolocation)
	// Eg, Drupal.theme.prototype.selectPaisRegion("Honduras", "Napo");
	Drupal.theme.prototype.selectPaisRegion = function (pais, region) {
		if (typeof pais !== 'undefined' || pais !== null) {
			$('#sel-pais > select option[value="'+pais+'"]').prop('selected', true);
		}
		if (typeof region !== 'undefined' || region !== null) {
			$('#sel-regions > select option[value="'+region+'"]').prop('selected', true);
		}
	}; 

  /**
   *
   * Sedes / Subcategories.
   * 
   */

	// Create Object: Sedes
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
	
	// Create HTML article
	Drupal.theme.prototype.sedeArticle = function (sedesObj) {
		var sedHTML = '<section class="resultados col-lg-9 col-md-12 col-xs-12">';
		for ( var nid in sedesObj ) {
			var sedeObj = sedesObj[nid];
			sedHTML += '<article class="media ">';

			sedHTML += '<div class="logoempresa col-lg-2 col-md-3 col-sm-3 col-xs-4">';
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


		return $( sedHTML );
	};	


  /**
   *
   * Busqueda Panel (Frontpage).
   * 
   */
	// Create HTML tab (jQuery)
	Drupal.theme.prototype.busquedaTabPanel = function (simHTML, avaHTML) {
		var tabHTML = '<ul class="nav nav-tabs" role="tablist">';
		tabHTML += '<li role="presentation" class="active"><a href="#tabBusqSimple" aria-controls="tabBusqSimple" role="tab" data-toggle="tab">Búsqueda Simple</a></li>';
		tabHTML += '<li role="presentation"><a href="#tabBusqAzanz" aria-controls="tabBusqAzanz" role="tab" data-toggle="tab">Búsqueda Avanzada</a></li>';
		tabHTML += '</ul>';
		tabHTML += '<div class="tab-content">';
  		tabHTML += '<div role="tabpanel" class="tab-pane active" id="tabBusqSimple">' + simHTML + '</div>';
  		tabHTML += '<div role="tabpanel" class="tab-pane" id="tabBusqAzanz">' + avaHTML +'</div>';
  		tabHTML += '</div>';
		return $('<div id="tabBusq" class="col-lg-8 col-md-8 col-sm-7 col-xs-12">' + tabHTML + '</div>');
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

			$('.view-regiones', context).once('despierta', function () {
				$(this).hide();

				// Create Object: Pais - Regions
				paisRegionsObj = Drupal.theme.prototype.paisRegionesObj(this);
				
				// Create HTML for 'Paises'
				var $paisHTML = Drupal.theme('paisSelectList', paisRegionsObj);
				$(this).html($paisHTML);

				// WARNING: HARD-CORE!!
				// Create HTML for 'Regions'
				var $regHTML = Drupal.theme('regionesSelectList', paisRegionsObj, "España");
				$(this).append($regHTML);
				Drupal.theme.prototype.selectPaisRegion("España", "Madrid");

				$(this).show();
			});

			// Event: Create regions when pais changes
			$( "#sel-pais" ).change( function() {
				var $regHTML = Drupal.theme('regionesSelectList', paisRegionsObj, $( "#sel-pais option:selected" ).text());
				$('#sel-regions').replaceWith($regHTML);
			});

			// Add new class for regions
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

			// Add num. sedes within sub-categories
			$('.view-ver-tax', context).once('despierta', function () {
				
				// Print new sedes view
				var sedesObj = Drupal.theme.prototype.sedesObj($('.view-id-sedes', context));

				// Change css category
				var cat = $( 'h3', this ).text();
				$( 'h3', this ).replaceWith('<p><span>' + cat + '</span></p>');

				// Extract num. sub-categories
				var subcats = Drupal.theme.prototype.getNumSubCategories(sedesObj, cat);

				// Add num sedes for each subcategory
				$('a', this).map( function () {
					var val = $(this).text();
					val = val.replace(/^\s*/g,'');
					val = val.replace(/\s*$/g,'');
					var num = 0;
					if ( subcats[val] !== undefined ) { num = subcats[val] }
					$ ( this ).append( " ("+num+")" );
				});
			});

			// Print new sedes view (Once)			
			$('.view-id-sedes .view-content').once("DOMSubtreeModified",function(){
				$(this).hide();

				// Create Object: Sedes
				var sedesObj = Drupal.theme.prototype.sedesObj(this);

				// Create HTML
				var $sedeHTML = Drupal.theme('sedeArticle', sedesObj);
				$(this).html($sedeHTML);

	 			// Event Click: sedes more info
				$( this ).on( 'click', '.resultados .info.url', function() {
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

				$(this).show();
			});


			// Create Busqueda Panel
			$('.view-id-frontpage_busqueda', context).once('despierta', function () {

				// Extract simple search
				var simHTML = $( '#block-custom-search-blocks-1' ).html();
				$( '#block-custom-search-blocks-1' ).remove();

				// Extract advanced search
				// var avaHTML = $( '.view-id-sedes2 .view-filters' ).html();
				var avaHTML = $( '#block-views-exp-sedes2-page-1' ).html();				
				$( '#block-views-exp-sedes2-page-1' ).remove();

				// Create HTML for 'Regions'
				var $tabHTML = Drupal.theme('busquedaTabPanel', simHTML, avaHTML);
				$( '.view-content', this).append($tabHTML);

			});
			
			// Active Busqueda tabs
			$('#tabBusq').delegate('ul a', 'click', function(e) {
				e.preventDefault();
				$(this).tab('show');
			});

		}
	};

})(jQuery);



// <div class="col-lg-8 col-md-8 col-sm-7 col-xs-12">
// 		<h1>Tu buscador verde</h1>
// 		<p><span id="simple" class="seleccionada">Búsqueda simple</span><span id="avanzada" class="noseleccionada">Búsqueda avanzada</span></p>
// 		<form id="simplesearch" action="/busqueda" method="get" class="form-inline" role="form" style="display: block;">
// 			<div class="form-group">
// 				<input type="text" name="qs" placeholder="¿Qué buscas?" class="form-control" autofocus="autofocus" size="25">
// 			</div>
// 			<div class="form-group">
// 				<select id="provinceBasic" class="form-control" name="province"><option value="">Todas las regiones</option><option value="2593109">Andalucía</option><option value="3336899">Aragón</option><option value="3114710">Asturias</option><option value="2593110">Canarias</option><option value="3336898">Cantabria</option><option value="3336900">Castilla y León</option><option value="2593111">Castilla-La Mancha</option><option value="3336901">Cataluña</option><option value="2519582">Ceuta</option><option value="2593112">Extremadura</option><option value="3336902">Galicia</option><option value="2521383">Islas Baleares</option><option value="3336897">La Rioja</option><option value="3117732" selected="">Madrid</option><option value="6362988">Melilla</option><option value="2513413">Murcia</option><option value="3115609">Navarra</option><option value="3336903">País Vasco</option><option value="2593113">Valencia</option></select>
// 			</div>
// 			<div class="form-group">
// 				<input id="cityBasic" data-provide="typeahead" type="text" name="city" placeholder="Localidad (Opcional)" class="form-control typeahead" autocomplete="off">
// 			</div>
// 			<input id="cityBasic_id" type="hidden" name="city_id" value="">
// 			<input type="hidden" name="country_code" id="country_code" value="ES">
// 			<div id="padrebuscar" class="col-xs-12">
// 				<div id="buscar" class="col-xs-2 row">
// 					<button class="btn btn-success" type="submit">Buscar</button>
// 				</div>
// 				<div id="avisobuscar" class="miancho">
// 					Estamos realizando los últimos ajustes de nuestro localizador. Pronto encontrarás todas las alternativas de consumo a un sólo clic. ¡Arrancamos en septiembre!
// 				</div>
// 			</div>
// 		</form>
// 		<div class="iconos limpia" style="display: block;">
// 			<a href="directorio-de-empresas/alimentacion" title="Alimentación"><img src="http://www.despierta.org/images/icoalimentacion.png" alt="Alimentación"></a>
// 			<a class="interior" href="directorio-de-empresas/hogar-energia" title="Hogar y energía"><img src="http://www.despierta.org/images/icohogar.png" alt="Hogar"></a>
// 			<a class="interior" href="directorio-de-empresas/huerto-jardin" title="Huerto y jardín"><img src="http://www.despierta.org/images/icohuerto.png" alt="Huerto y jardín"></a>
// 			<a class="interior" href="directorio-de-empresas/salud-bienestar" title="Salud y bienestar"><img src="http://www.despierta.org/images/icosalud.png" alt="Salud"></a>
// 			<a class="interior" href="directorio-de-empresas/transporte" title="Transporte"><img src="http://www.despierta.org/images/icotransporte.png" alt="Transporte"></a>
// 			<a class="interior" href="directorio-de-empresas/ecoturismo" title="Ecoturismo"><img src="http://www.despierta.org/images/icoecoturismo.png" alt="Ecoturismo"></a>
// 			<a class="interior" href="directorio-de-empresas/reciclaje" title="Reciclaje"><img src="http://www.despierta.org/images/icoreciclaje.png" alt="Reciclaje"></a>
// 			<a class="interior" href="directorio-de-empresas/ropa-complementos" title="Moda"><img src="http://www.despierta.org/images/icomoda.png" alt="Moda"></a>
// 			<a href="/directorio-de-empresas/otras" title=""><img class="Otras categorí,as" src="http://www.despierta.org/images/icootras.png" alt="Otras"></a>
// 		</div>
// 		<form id="completesearch" action="/busqueda-avanzada" method="get" class="form-horizontal col-lg-12" style="display: none;">
// 			<div class="pull-left col-xs-12 col-md-4">
// 				<label>¿Qué buscas?</label>
// 				<select id="category" name="category" class="form-control">
// 					<option value="">Elige una categoría</option><option value="1">Alimentación</option><option value="2">Hogar y energía</option><option value="3">Huerto y jardín</option><option value="7">Reciclaje</option><option value="8">Ropa y complementos</option><option value="4">Salud y bienestar</option><option value="5">Transporte</option><option value="6">Turismo y aventura</option><option value="9">Otras categorías</option>
// 				</select>
// 				<select id="subcategory" name="subcategory" class="form-control" disabled="">
// 					<option value="">Elige una categoría</option>
// 				</select>
// 				<input id="enterprise_name" type="text" class="form-control" value="" name="enterprise_name" placeholder="Nombre del anunciante">
// 			</div>
// 			<div class="pull-left col-xs-12 col-md-4">
// 				<label>¿Dónde?</label>
// 				<select id="pais" name="pais" class="form-control">
// 					<option value="">Elige el país</option>
// 				</select>
// 				<select id="province" name="province" class="form-control">
// 					<option value="">Todas las regiones</option><option value="2593109">Andalucía</option><option value="3336899">Aragón</option><option value="3114710">Asturias</option><option value="2593110">Canarias</option><option value="3336898">Cantabria</option><option value="3336900">Castilla y León</option><option value="2593111">Castilla-La Mancha</option><option value="3336901">Cataluña</option><option value="2519582">Ceuta</option><option value="2593112">Extremadura</option><option value="3336902">Galicia</option><option value="2521383">Islas Baleares</option><option value="3336897">La Rioja</option><option value="3117732" selected="">Madrid</option><option value="6362988">Melilla</option><option value="2513413">Murcia</option><option value="3115609">Navarra</option><option value="3336903">País Vasco</option><option value="2593113">Valencia</option>
// 				</select>
// 				<input id="city" data-provide="typeahead" type="text" name="city" placeholder="Localidad" class="form-control typeahead" readonly="readonly" autocomplete="off">
// 				<input id="city_id" type="hidden" name="city_id" value="">
// 			</div>
// 			<div class="pull-left col-xs-12 col-md-4">
// 				<label>¿Características?</label>
// 				<select id="tipo" name="tipo" class="form-control">
// 					<option value="">Elige el tipo de entidad</option><option value="6">Agrupación comercial</option><option value="2">Asociación</option><option value="4">Autónomo</option><option value="1">Empresa</option><option value="3">Organización</option><option value="5">Tienda o comercio</option>
// 				</select>
// 				<select id="actividad" name="actividad" class="form-control">
// 					<option value="">Elige una actividad</option><option value="4">Agencia o tour-operador turístico</option><option value="3">Alquiler o venta al cliente final (minorista)</option><option value="2">Distribuidor mayorista</option><option value="1">Fabricante/Productor</option><option value="6">Otros</option>
// 				</select>
// 				<select id="tipoventa" name="tipoventa" class="form-control">
// 					<option value="">Elige un tipo de venta</option><option value="1">Establecimiento físico</option><option value="2">Venta online</option><option value="6">Alquiler online</option><option value="8">Reserva online</option><option value="5">Servicio online</option><option value="3">Servicio a domicilio</option><option value="7">Venta telefónica</option><option value="9">Reserva telefónica</option><option value="10">Otros</option>
// 				</select>
// 			</div>
// 			<div class="pull-left col-xs-12">
// 				<button class="btn btn-success" type="submit">Buscar</button>
// 			</div>
// 		</form>
// 	</div>