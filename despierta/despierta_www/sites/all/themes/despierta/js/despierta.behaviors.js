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
					t_act: "",
					t_mov: "",
					t_vent: "",
					cat: {},
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
				var sedesObj = {};
				$('.view-id-sedes', context).once('despierta', function () {
					// $(this).hide();

					// Create Object: Sedes
					sedesObj = Drupal.theme.prototype.sedesObj(this);

					// $(this).show();
				});

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


// 			$('.view-id-sedes', context).once('despierta', function () {
// 				// $(this).hide();

// 				// Create Object: Sedes
// 				var sedesObj = Drupal.theme.prototype.sedesObj(this);
// console.log(sedesObj);
				
// 				// Create Object: Sedes
// 				sedesObj = Drupal.theme.prototype.sedesObj(this);

// 				// // Create HTML for 'Paises'
// 				// var $paisHTML = Drupal.theme('paisSelectList', paisRegionsObj);
// 				// $(this).html($paisHTML);

// 				// // WARNING: HARD-CORE!!
// 				// // Create HTML for 'Regions'
// 				// var $regHTML = Drupal.theme('regionesSelectList', paisRegionsObj, "España");
// 				// $(this).append($regHTML);
// 				// Drupal.theme.prototype.selectPaisRegion("España", "Madrid");

// 				// $(this).show();
// 			});
			

		}
	};

})(jQuery);