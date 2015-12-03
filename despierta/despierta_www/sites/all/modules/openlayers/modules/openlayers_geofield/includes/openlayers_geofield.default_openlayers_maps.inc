<?php
/**
 * @file
 * Default maps.
 */

/**
 * Implements hook_default_maps().
 */
function openlayers_geofield_default_openlayers_maps() {
  $export = array();

  $ol_map = new stdClass();
  $ol_map->disabled = FALSE; /* Edit this to true to make a default map disabled initially */
  $ol_map->api_version = 1;
  $ol_map->machine_name = 'openlayers_geofield_map_geofield_widget';
  $ol_map->name = 'Openlayers Geofield: Widget map';
  $ol_map->description = '';
  $ol_map->factory_service = 'openlayers.Map:OLMap';
  $ol_map->options = array(
    'width' => 'auto',
    'height' => '300px',
    'contextualLinks' => 1,
    'provideBlock' => 1,
    'provideIframe' => 1,
    'view' => array(
      'center' => array(
        'lat' => '0',
        'lon' => '0',
      ),
      'rotation' => '0',
      'zoom' => '2',
    ),
    'layers' => array(
      0 => 'openlayers_layer_tile_mapquest_osm',
      1 => 'openlayers_geofield_layer_widget',
    ),
    'controls' => array(
      0 => 'openlayers_control_zoom',
      1 => 'openlayers_geofield_control_autozoom',
    ),
    'interactions' => array(
      0 => 'openlayers_interaction_dragpan',
    ),
    'components' => array(
      0 => 'openlayers_geofield_component_geofield_widget',
      1 => 'openlayers_geofield_component_zoom_to_source',
    ),
  );
  $export['openlayers_geofield_map_geofield_widget'] = $ol_map;

  $ol_map = new stdClass();
  $ol_map->disabled = FALSE; /* Edit this to true to make a default ol_map disabled initially */
  $ol_map->api_version = 1;
  $ol_map->machine_name = 'openlayers_geofield_map_geofield_formatter';
  $ol_map->name = 'Openlayers Geofield: Formatter Map';
  $ol_map->description = '';
  $ol_map->factory_service = 'openlayers.Map:OLMap';
  $ol_map->options = array(
    'width' => 'auto',
    'height' => '300px',
    'contextualLinks' => 1,
    'provideBlock' => 1,
    'provideIframe' => 1,
    'view' => array(
      'center' => array(
        'lat' => '0',
        'lon' => '0',
      ),
      'rotation' => '0',
      'zoom' => '2',
    ),
    'controls' => array(
      0 => 'openlayers_control_zoom',
      1 => 'openlayers_geofield_control_autozoom',
    ),
    'layers' => array(
      0 => 'openlayers_layer_tile_mapquest_osm',
      1 => 'openlayers_geofield_layer_formatter',
    ),
    'interactions' => array(
      0 => 'openlayers_interaction_doubleclickzoom',
      1 => 'openlayers_interaction_dragpan',
      2 => 'openlayers_interaction_mousewheelzoom',
    ),
    'components' => array(
      0 => 'openlayers_geofield_component_zoom_to_source',
      1 => 'openlayers_geofield_component_geofield_formatter',
    ),
  );
  $export['openlayers_geofield_map_geofield_formatter'] = $ol_map;

  return $export;
}