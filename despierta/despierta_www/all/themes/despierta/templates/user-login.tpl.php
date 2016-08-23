<h1 class="col-sm-8 col-sm-offset-4 text-left"><?php print render($intro_text); ?></h1>
<div id="form_users" class="col-sm-offset-4 col-sm-6"> 
<?php
	// username field
	$form['name']['#title'] = t('Usuario o email');
	$form['name']['#attributes']['placeholder'] = t('Introduce el usuario o email');
	unset($form['name']['#description']);
	print drupal_render($form['name']);

	// password field
	$form['pass']['#attributes']['placeholder'] = t('Introduce la contraseña');
	unset($form['pass']['#description']);
	print drupal_render($form['pass']);

	$form['actions']['submit'] = array(
		'#type' => 'submit',
		'#value' => t('Entrar'),
	);

	// render form
	print drupal_render_children($form);

	// User password link
	$user_password_string = variable_get('user_password_string', 'recuperar contraseña');

	// Create a link to the user profile page.
	$user_password_link = l(t($user_password_string), 'user/password', array('attributes' => array('class' => 'control-label')) );

?>
	<div class="form-group">
		<small>o <?php print render($user_password_link); ?></small> 
	</div>
</div>
