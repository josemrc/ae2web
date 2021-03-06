<?php
/**
 * @file
 * This file holds main views functions for the openlayers_views module.
 *
 * @ingroup openlayers
 */

/**
 * Implements hook_views_plugins().
 */
function openlayers_views_views_plugins() {
  return array(
    'display' => array(
      'openlayers' => array(
        'title' => t('Openlayers Data'),
        'help' => t('Data for Openlayers maps.'),
        'handler' => 'openlayers_views_plugin_display_openlayers',
        'path' => drupal_get_path('module', 'openlayers_views') . '/views',
        'uses hook menu' => FALSE,
        'use ajax' => FALSE,
        'use pager' => TRUE,
        'accept attachments' => FALSE,
        'admin' => t('Openlayers Data'),
      ),
    ),
    'style' => array(
      'openlayers_source_vector' => array(
        'title' => t('Openlayers Vector Data Overlay'),
        'help' => t('Provides Data to Power an Openlayers map.'),
        'handler' => 'openlayers_views_plugin_style_source_vector',
        'path' => drupal_get_path('module', 'openlayers_views') . '/views',
        'uses fields' => TRUE,
        'uses row plugin' => TRUE,
        'uses options' => TRUE,
        'uses grouping' => TRUE,
        'type' => 'openlayers',
        'even empty' => TRUE,
      ),
      'openlayers_map_views' => array(
        'title' => t('Openlayers Views Map'),
        'help' => t('Provides a map based on a views configureation.'),
        'handler' => 'openlayers_views_plugin_map_views',
        'uses fields' => TRUE,
        'uses row plugin' => TRUE,
        'uses options' => TRUE,
        // 'uses grouping' => TRUE,
        'even empty' => TRUE,
        'type' => 'normal',
      ),
    ),
  );
}
