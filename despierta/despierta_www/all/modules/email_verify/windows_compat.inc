<?php
/**
 * @file
 * Definitions for missing functions in Windows (bah)
 * See: http://drupal.org/node/508004
 */

/**
 * getmxrr() support for Windows by HM2K <php [at] hm2k.org>.
 *
 * http://www.php.net/manual/fr/function.getmxrr.php#88033
 */
function win_getmxrr($hostname, &$mxhosts, &$mxweight = FALSE) {
  if (empty($hostname)) {
    return;
  }
  if (strtoupper(substr(PHP_OS, 0, 3)) != 'WIN') {
    return;
  }

  if (!is_array($mxhosts)) {
    $mxhosts = array();
  }

  $exec = 'nslookup -type=MX ' . escapeshellarg($hostname);
  @exec($exec, $output);
  if (empty($output)) {
    return;
  }

  $i = -1;
  foreach ($output as $line) {
    $i++;
    if (preg_match("/^$hostname\tMX preference = ([0-9]+), mail exchanger = (.+)$/i", $line, $parts)) {
      $mxweight[$i] = trim($parts[1]);
      $mxhosts[$i] = trim($parts[2]);
    }
    if (preg_match('/responsible mail addr = (.+)$/i', $line, $parts)) {
      $mxweight[$i] = $i;
      $mxhosts[$i] = trim($parts[1]);
    }
  }

  return ($i != -1);
}

if (!function_exists('getmxrr')) {
  function getmxrr($hostname, &$mxhosts, &$mxweight = FALSE) {
    return win_getmxrr($hostname, $mxhosts, $mxweight);
  }
}

/**
 * http://www.php.net/manual/fr/function.checkdnsrr.php#82701
 */
if (!function_exists('checkdnsrr')) {
  function checkdnsrr($host, $type = '') {
    if (!empty($host)) {
      $type = (empty($type)) ? 'MX' : $type;
      exec('nslookup -type=' . $type . ' ' . escapeshellcmd($host), $result);
      $it = new ArrayIterator($result);
      foreach (new RegexIterator($it, '~^' . $host . '~', RegexIterator::GET_MATCH) as $result) {
        if ($result) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }
}
