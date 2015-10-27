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
					sedHTML += '<div class="row"><p class="text-right col-xs-4">Etiquetas:</p><p class="col-xs-8">' + Object.keys(sedeObj.etiqs).join(',') + '</p></div>';

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

				$(document).undelegate('.resultados .info.url', 'click', function(){
 alert("undelegate");
});
			// Print new sedes view (Once)			
			$('.view-id-sedes .view-content').once("DOMSubtreeModified",function(){
				$(this).hide();

				// $('.resultados .info.url', this).off('click', function() { alert("KK") });

				// Create Object: Sedes
				var sedesObj = Drupal.theme.prototype.sedesObj(this);


				// Create HTML
				var $sedeHTML = Drupal.theme('sedeArticle', sedesObj);
				$(this).html($sedeHTML);

				$(this).show();
			});

			// $('.view-id-sede', context).once('despierta', function () {
			// 	//$(this).hide();

			// 	// Create Object: Sedes
			// 	var sedesObj = Drupal.theme.prototype.sedesObj(this);

			// 	// Create HTML
			// 	var $sedeHTML = Drupal.theme('sedeArticle', sedesObj);
			// 	$(this).html($sedeHTML);

			// 	//
			// });

 			// Event Click: sedes more info
 			// Delegate event because jQuery loses all bindings on elements that are added after loading. 
			$( document ).delegate( '.resultados .info.url', 'click', function(){
			// $( '.view-id-sedes .view-content' ).delegate( '.resultados .info.url', 'click', function(){
			// $( document ).on( 'click', '.view-id-sedes .view-content .resultados .info.url', function(e) {
			// $( '.view-id-sedes .view-content .resultados .info.url' ).live('click', function(){
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
		}
	};

})(jQuery);