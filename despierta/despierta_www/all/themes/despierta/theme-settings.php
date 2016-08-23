<?php

/**
 * @file
 * Theme settings file for the despierta theme.
 */

require_once dirname(__FILE__) . '/template.php';

/**
 * Implements hook_form_FORM_alter().
 */
function despierta_form_system_theme_settings_alter(&$form, $form_state) {
  // You can use this hook to append your own theme settings to the theme
  // settings form for your subtheme. You should also take a look at the
  // 'extensions' concept in the Omega base theme.
}
function despierta_form_user_register_alter(&$form, &$form_state, $form_id) {
  $form['account']['name']['#title'] = t('Full name');
  // perform other changes here
}