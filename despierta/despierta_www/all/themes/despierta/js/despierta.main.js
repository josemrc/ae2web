(function ($) {

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

})(jQuery);