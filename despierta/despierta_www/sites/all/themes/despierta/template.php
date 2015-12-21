<?php

/**
 * Registers overrides for various functions.
 *
 */
function despierta_theme() {
  $items = array();
    
  $items['user'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'despierta') . '/templates',
    'template' => 'user-login',
    'preprocess functions' => array(
       'despierta_preprocess_user_login'
    ),
  );
  $items['user_login'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'despierta') . '/templates',
    'template' => 'user-login',
    'preprocess functions' => array(
       'despierta_preprocess_user_login'
    ),
  );
  $items['user_register_form'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'despierta') . '/templates',
    'template' => 'user-register-form',
    'preprocess functions' => array(
      'despierta_preprocess_user_register_form'
    ),
  );
  $items['user_pass'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'despierta') . '/templates',
    'template' => 'user-pass',
    'preprocess functions' => array(
      'despierta_preprocess_user_pass'
    ),
  ); 
  $items['user_profile_form'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'despierta') . '/templates',
    'template' => 'user-profile-edit',
    'preprocess functions' => array(
      'despierta_preprocess_user_profile_form'
    ),
  );  
  return $items;
}

/**
 * Add body classes if certain regions have content.
 */
function despierta_preprocess_html(&$variables) {  
  if (!empty($variables['page']['featured'])) {
    $variables['classes_array'][] = 'featured';
  }

  if (!empty($variables['page']['triptych_first'])
    || !empty($variables['page']['triptych_middle'])
    || !empty($variables['page']['triptych_last'])) {
    $variables['classes_array'][] = 'triptych';
  }

  if (!empty($variables['page']['footer_firstcolumn'])
    || !empty($variables['page']['footer_secondcolumn'])
    || !empty($variables['page']['footer_thirdcolumn'])
    || !empty($variables['page']['footer_fourthcolumn'])) {
    $variables['classes_array'][] = 'footer-columns';
  }

  // Add conditional stylesheets for IE
  drupal_add_css(path_to_theme() . '/css/ie.css', array('group' => CSS_THEME, 'browsers' => array('IE' => 'lte IE 7', '!IE' => FALSE), 'preprocess' => FALSE));
  drupal_add_css(path_to_theme() . '/css/ie6.css', array('group' => CSS_THEME, 'browsers' => array('IE' => 'IE 6', '!IE' => FALSE), 'preprocess' => FALSE));
}

/**
 * Override or insert variables into the page template for HTML output.
 */
function despierta_process_html(&$variables) {
  // Hook into color.module.
  if (module_exists('color')) {
    _color_html_alter($variables);
  }
}

/**
 * Override or insert variables into the page template.
 */
function despierta_process_page(&$variables) {
  // Hook into color.module.
  if (module_exists('color')) {
    _color_page_alter($variables);
  }
  // Always print the site name and slogan, but if they are toggled off, we'll
  // just hide them visually.
  $variables['hide_site_name']   = theme_get_setting('toggle_name') ? FALSE : TRUE;
  $variables['hide_site_slogan'] = theme_get_setting('toggle_slogan') ? FALSE : TRUE;
  if ($variables['hide_site_name']) {
    // If toggle_name is FALSE, the site_name will be empty, so we rebuild it.
    $variables['site_name'] = filter_xss_admin(variable_get('site_name', 'Drupal'));
  }
  if ($variables['hide_site_slogan']) {
    // If toggle_site_slogan is FALSE, the site_slogan will be empty, so we rebuild it.
    $variables['site_slogan'] = filter_xss_admin(variable_get('site_slogan', ''));
  }
  // Since the title and the shortcut link are both block level elements,
  // positioning them next to each other is much simpler with a wrapper div.
  if (!empty($variables['title_suffix']['add_or_remove_shortcut']) && $variables['title']) {
    // Add a wrapper div using the title_prefix and title_suffix render elements.
    $variables['title_prefix']['shortcut_wrapper'] = array(
      '#markup' => '<div class="shortcut-wrapper clearfix">',
      '#weight' => 100,
    );
    $variables['title_suffix']['shortcut_wrapper'] = array(
      '#markup' => '</div>',
      '#weight' => -99,
    );
    // Make sure the shortcut link is the first item in title_suffix.
    $variables['title_suffix']['add_or_remove_shortcut']['#weight'] = -100;
  }
}

/**
 * Implements hook_preprocess_maintenance_page().
 */
function despierta_preprocess_maintenance_page(&$variables) {
  // By default, site_name is set to Drupal if no db connection is available
  // or during site installation. Setting site_name to an empty string makes
  // the site and update pages look cleaner.
  // @see template_preprocess_maintenance_page
  if (!$variables['db_is_active']) {
    $variables['site_name'] = '';
  }
  drupal_add_css(drupal_get_path('theme', 'despierta') . '/css/maintenance-page.css');
}

/**
 * Override or insert variables into the maintenance page template.
 */
function despierta_process_maintenance_page(&$variables) {
  // Always print the site name and slogan, but if they are toggled off, we'll
  // just hide them visually.
  $variables['hide_site_name']   = theme_get_setting('toggle_name') ? FALSE : TRUE;
  $variables['hide_site_slogan'] = theme_get_setting('toggle_slogan') ? FALSE : TRUE;
  if ($variables['hide_site_name']) {
    // If toggle_name is FALSE, the site_name will be empty, so we rebuild it.
    $variables['site_name'] = filter_xss_admin(variable_get('site_name', 'Drupal'));
  }
  if ($variables['hide_site_slogan']) {
    // If toggle_site_slogan is FALSE, the site_slogan will be empty, so we rebuild it.
    $variables['site_slogan'] = filter_xss_admin(variable_get('site_slogan', ''));
  }
}

/**
 * Override or insert variables into the node template.
 */
function despierta_preprocess_node(&$variables) {
  if ($variables['view_mode'] == 'full' && node_is_page($variables['node'])) {
    $variables['classes_array'][] = 'node-full';
  }
}

/**
 * Override or insert variables into the block template.
 */
function despierta_preprocess_block(&$variables) {
  // In the header region visually hide block titles.
  if ($variables['block']->region == 'header') {
    $variables['title_attributes_array']['class'][] = 'element-invisible';
  }
}

/**
 * Implements theme_menu_tree().
 */
function despierta_menu_tree($variables) {
  return '<ul class="menu clearfix">' . $variables['tree'] . '</ul>';
}

/**
 * Implements theme_field__field_type().
 */
function despierta_field__taxonomy_term_reference($variables) {
  $output = '';

  // Render the label, if it's not hidden.
  if (!$variables['label_hidden']) {
    $output .= '<h3 class="field-label">' . $variables['label'] . ': </h3>';
  }

  // Render the items.
  $output .= ($variables['element']['#label_display'] == 'inline') ? '<ul class="links inline">' : '<ul class="links">';
  foreach ($variables['items'] as $delta => $item) {
    $output .= '<li class="taxonomy-term-reference-' . $delta . '"' . $variables['item_attributes'][$delta] . '>' . drupal_render($item) . '</li>';
  }
  $output .= '</ul>';

  // Render the top-level DIV.
  $output = '<div class="' . $variables['classes'] . (!in_array('clearfix', $variables['classes_array']) ? ' clearfix' : '') . '"' . $variables['attributes'] .'>' . $output . '</div>';

  return $output;
}

/**
 * Implements hook_page_alter() for Reponsive theme
 */
function despierta_page_alter($page) {
  // Add meta tag for viewport, for easier responsive theme design.
  $viewport = array(
    '#type' => 'html_tag',
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'viewport',
      'content' => 'width=device-width, initial-scale=1',
    )
  );
  $HandheldFriendly = array(
    '#type' => 'html_tag',
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'HandheldFriendly',
      'content' => 'true',
    )
  );
   $MobileOptimized = array(
    '#type' => 'html_tag',
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'MobileOptimized',
      'content' => 'width',
    )
  ); 
  drupal_add_html_head($viewport, 'viewport');
  drupal_add_html_head($HandheldFriendly, 'HandheldFriendly');
  drupal_add_html_head($MobileOptimized, 'MobileOptimized');
}

/**
 * Preprocces Pages
 */

function despierta_preprocess_page(&$vars) {
  // Remove 'No front page content has been created yet.'
  if($vars['is_front']){
    $vars['title'] = ''; // removes the default Welcome to @site-name
    $vars['page']['content']['system_main']['default_message'] = array();
  }
  // There is currently no content classified with this term."
  if(isset($vars['page']['content']['system_main']['no_content'])) {
    unset($vars['page']['content']['system_main']['no_content']);
  }
}

/**
 * Preprocces Images
 */

function despierta_preprocess_image(&$variables) {
  $variables['attributes']['class'][] = 'img-responsive'; // can be 'img-rounded', 'img-circle', or 'img-thumbnail'
  // Remove Height and Width Inline Styles from Drupal Images
  foreach (array('width', 'height') as $key) {
    unset($variables[$key]);
  }
}

/**
 * User register/ User login / User pass functions.
 *
 */
function despierta_preprocess_user_login(&$vars) {
  $vars['intro_text'] = t('Acceso de usuarios');
}

function despierta_preprocess_user_register_form(&$vars) {
  $vars['intro_text'] = t('Registro para anunciantes');
}

function despierta_preprocess_user_pass(&$vars) {
  $vars['intro_text'] = t('Recuperación de cuenta');
}
function despierta_preprocess_user_profile_form(&$vars) {
  $vars['intro_text'] = t('Panel de Administración - Modificar datos personales');
}

/**
 * Implements hook_responsive_menus_styles_alter().
 */
function despierta_responsive_menus_styles_alter(&$styles) {
  // Use Sidr's 'light' theme instead of 'dark'
  $styles['sidr']['css_files'] = array(libraries_get_path('sidr') . '/stylesheets/jquery.sidr.light.css');
}
/**
 * Implements hook_form_BASE_FORM_ID_alter().
 */
function despierta_form_node_form_alter(&$form, &$form_state, &$form_id) {
  if ( $form_id == 'sede_node_form' ) {
    unset($form['preview']);
    drupal_set_title(t('Panel de Administración - Registrar nueva Sede'));
  }
}

/**
 * Implements hook_form_BASE_FORM_ID_alter().
 */
function despierta_form_contact_site_form_alter(&$form, $form_state) {
  $form['subject']['#access'] = FALSE;
  $form['cid']['#type'] = "radios";
  unset($form['cid']['#options'][0]);
}


?>
