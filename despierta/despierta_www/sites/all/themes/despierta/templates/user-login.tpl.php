<p><?php print render($intro_text); ?></p>

<div id="form_users" class="col-sm-12 text-center">
<?php
	// username field
	$form['name']['#attributes']['placeholder'] = t('Introduce el usuario o email');
	// $form['name']['#prefix'] = '<div class="col-sm-4 control-label">';
	// $form['name']['#suffix'] = '</div>';
	unset($form['name']['#description']);
	print drupal_render($form['name']);

	// password field
	$form['pass']['#attributes']['placeholder'] = t('Introduce la contraseña');
	// $form['pass']['#attributes'] = array(
	// 	'placeholder'	=> t('Introduce la contraseña'),
	// 	'class'			=> 'col-sm-4 control-label'
	// );
	unset($form['pass']['#description']);
	print drupal_render($form['pass']);


	// $form['actions'] = array(
	// 	'#attributes' => array('class' => 'btn btn-success pull-right col-sm-3'),
	// );
	$form['actions']['submit'] = array(
		'#type' => 'submit',
		'#value' => t('Entrar'),
	);

	// render form
	print drupal_render_children($form);

	// render login button
	// print drupal_render($form['form_build_id']);
	// print drupal_render($form['form_id']);
	// print drupal_render($form['actions']);

	// User password link
	$user_password_string = variable_get('user_password_string', 'recuperar contraseña');

	// Create a link to the user profile page.
	$user_password_link = l(t($user_password_string), 'user/password', array('attributes' => array('class' => 'control-label')) );

?>
	<div class="form-group">
		<div class="col-sm-offset-4 col-sm-6 text-right">
			<small>o <?php print render($user_password_link); ?></small> 
		</div>
	</div>
</div>
