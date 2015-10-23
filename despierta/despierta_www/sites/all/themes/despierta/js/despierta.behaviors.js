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
		$.each( paisRegions, function(pais,regions) {
		selHTML += '<option value="'+pais+'">'+pais+'</option>';  		
		})
		selHTML += '</select>';
		return $('<div id="sel-pais">' + selHTML + '</div>');
	};
	// Create HTML select option
	Drupal.theme.prototype.regionesSelectList = function (paisRegions, pais) {
		var selHTML = '<select>';
		$.each( paisRegions[pais], function(idx,region) {
		selHTML += '<option value="'+region+'">'+region+'</option>';
		})
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

		}
	};

})(jQuery);