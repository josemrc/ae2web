<?php
/**
 * @file
 */

include_once 'webform_confirm_email.inc';

/**
 * Helper function to propvide a form for filtering for (un)confirmed submissions
 */
function webform_confirm_email_confirmed_filter_form($form, &$form_state) {
  $options = array(
    WEBFORM_CONFIRM_EMAIL_FILTER_NONE        => t('All submissions'),
    WEBFORM_CONFIRM_EMAIL_FILTER_CONFIRMED   => t('Only confirmed submissions'),
    WEBFORM_CONFIRM_EMAIL_FILTER_UNCONFIRMED => t('Only unconfirmed submissions'),
  );
  $query_parameters = drupal_get_query_parameters();
  $form['confirmed']= array(
    '#type'          => 'radios',
    '#title'         => t('Filter for (un)confirmed submissions'),
    '#default_value' => isset($query_parameters['confirmed']) ? $query_parameters['confirmed'] : WEBFORM_CONFIRM_EMAIL_FILTER_NONE,
    '#options'       => $options,
    '#access'        => TRUE,
  );

  $form['submit'] = array(
    '#type'  => 'submit',
    '#value' => t('Filter submissions'),
  );

  $form['#submit'] = array('webform_confirm_email_confirmed_filter_form_submit');

  return $form;
}

/**
 * Submit handler for filter form for filtering for (un)confirmed submissions
 */
function webform_confirm_email_confirmed_filter_form_submit($form, &$form_state) {
  $path = current_path();
  $query_parameters = drupal_get_query_parameters();
  if (   isset($form_state['values']['confirmed']) == TRUE
      && $form_state['values']['confirmed'] != WEBFORM_CONFIRM_EMAIL_FILTER_NONE) {
    $query_parameters['confirmed'] = $form_state['values']['confirmed'];
  }
  else {
    unset($query_parameters['confirmed']);
  }

  drupal_goto($path, array('absolute' => TRUE, 'query' => $query_parameters));
}

/**
 * Helper function to determine if a "confirmed submissions" filter is set
 */
function _webform_confirm_email_get_submission_filters($node) {
  $filters = array('nid' => $node->nid);

  if (   isset($_GET['confirmed']) == TRUE
      && is_numeric($_GET['confirmed']) == TRUE) {
    switch ($_GET['confirmed']) {
      case WEBFORM_CONFIRM_EMAIL_FILTER_CONFIRMED:
         $filters['confirmed'] = 1;
         break;
      case WEBFORM_CONFIRM_EMAIL_FILTER_UNCONFIRMED:
         $filters['confirmed'] = 0;
         break;
    }
  }
  return $filters;
}

function webform_confirm_email_results_submissions($node, $user_filter, $pager_count) {
  global $user;

  module_load_include('inc', 'webform', 'includes/webform.submissions');

  if (isset($_GET['results']) && is_numeric($_GET['results'])) {
    $pager_count = $_GET['results'];
  }

  $filters = _webform_confirm_email_get_submission_filters($node);

  $header = theme('webform_results_submissions_header', array('node' => $node));
  $query = db_select('webform_submissions', 'ws')
    ->condition('ws.nid', $node->nid)
    ->condition('ws.is_draft', 0);
  if (isset($filters['confirmed']) == TRUE) {
    $query->condition('ws.confirmed', $filters['confirmed']);
  }
  if ($user_filter) {
    if ($user->uid) {
      drupal_set_title(t('Submissions for %user', array('%user' => $user->name)), PASS_THROUGH);
    }
    else {
      drupal_set_title(t('Your submissions'));
      webform_disable_page_cache();
    }
    webform_set_breadcrumb($node);
    $filters['uid'] = $user->uid;
    $query->condition('ws.uid', $user->uid);
  }
  $submissions = isset($_SESSION['webform_submission']) ? $_SESSION['webform_submission'] : NULL;
  if ($submissions) {
    $query->condition('ws.sid', $submissions, 'IN');
    $count = $query->countQuery()->execute()->fetchField();
  }
  else {
    $count = 0;
  }

  $submissions = webform_get_submissions($filters, $header, $pager_count);

  $operation_column = end($header);
  $operation_total = $operation_column['colspan'];

  $rows = array();
  foreach ($submissions as $sid => $submission) {
    $row = array(
      $submission->is_draft ? t('@sid (draft)', array('@sid' => $sid)) : $sid,
      format_date($submission->submitted, 'short'),
    );
    if (webform_results_access($node, $user)) {
      $row[] = theme('username', array('account' => $submission));
      $row[] = $submission->remote_addr;
    }
    $row[] = l(t('View'), "node/$node->nid/submission/$sid");
    $operation_count = 1;
    // No need to call this multiple times, just reference this in a variable.
    $destination = drupal_get_destination();
    if (webform_submission_access($node, $submission, 'edit', $user)) {
      $row[] = l(t('Edit'), "node/$node->nid/submission/$sid/edit", array('query' => $destination));
      $operation_count++;
    }
    if (webform_submission_access($node, $submission, 'delete', $user)) {
      $row[] = l(t('Delete'), "node/$node->nid/submission/$sid/delete", array('query' => $destination));
      $operation_count++;
    }
    if ($operation_count < $operation_total) {
      $row[count($row) - 1] = array('data' => $row[count($row) - 1], 'colspan' => $operation_total - $operation_count + 1);
    }
    $rows[] = $row;
  }

  $element['#theme'] = 'webform_confirm_email_results_submissions';
  $element['#node'] = $node;
  $element['#submissions'] = $submissions;
  $element['#total_count'] = $count;
  $element['#pager_count'] = $pager_count;
  $element['#attached']['library'][] = array('webform', 'admin');

  $element['confirmed_form'] = drupal_get_form('webform_confirm_email_confirmed_filter_form');

  $element['table']['#theme'] = 'table';
  $element['table']['#header'] = $header;
  $element['table']['#rows'] = $rows;
  $element['table']['#operation_total'] = $operation_total;

  return $element;
}

/**
 * Preprocess function for webform-confirm-email-results-submissions.tpl.php
 */
function template_preprocess_webform_confirm_email_results_submissions(&$vars) {
  $vars['node'] = $vars['element']['#node'];
  $vars['submissions'] = $vars['element']['#submissions'];
  $vars['confirmed_form'] = $vars['element']['confirmed_form'];
  $vars['table'] = $vars['element']['table'];
  $vars['total_count'] = $vars['element']['#total_count'];
  $vars['pager_count'] = $vars['element']['#pager_count'];
  $vars['is_submissions'] = (arg(2) == 'submissions')? 1 : 0;

  unset($vars['element']);
}

/**
 * Create a table containing all submitted values for a webform node.
 */
function webform_confirm_email_results_table($node, $pager_count = 0) {
  if (isset($_GET['results']) && is_numeric($_GET['results'])) {
    $pager_count = $_GET['results'];
  }
  $filters = _webform_confirm_email_get_submission_filters($node);
  // Get all the submissions for the node.
  $header = theme('webform_results_table_header', array('node' => $node));
  $submissions = webform_get_submissions($filters, $header, $pager_count);
  $total_count = webform_get_submission_count($node->nid);
  $confirmed_form = drupal_get_form('webform_confirm_email_confirmed_filter_form');

  $output = theme(
    'webform_confirm_email_results_table',
    array(
      'confirmed_form' => $confirmed_form,
      'node'           => $node,
      'components'     => $node->webform['components'],
      'submissions'    => $submissions,
      'total_count'    => $total_count,
      'pager_count'    => $pager_count
    )
  );
  if ($pager_count) {
    $output .= theme('pager');
  }
  return $output;
}

function theme_webform_confirm_email_results_table($variables) {
  $output = drupal_render($variables['confirmed_form']);
  $output .= theme_webform_results_table($variables);

  return $output;
}
