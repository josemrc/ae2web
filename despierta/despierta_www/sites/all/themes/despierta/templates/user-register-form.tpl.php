<div class="col-sm-12 text-center">
	<h1 class="col-sm-8 col-sm-offset-4 text-left"><?php print render($intro_text); ?></h1>
	<div class="col-xs-12 text-justify">
		<p>A continuación va a darse de alta de forma gratuita como anunciante en despierta.org. La inscripción consta de dos pasos.</p>
		<p class="pasos">Paso 1 - Datos de acceso</p>
		<p>Los datos que introduzca en el Paso 1 no serán visualizados por los visitantes de la web.</p>
		<p>Le recordamos que sólo es válida la inscripción de empresas, comercios e iniciativas cuya actividad principal se desarrolla bajo estándares de ecología y cuidado del medio ambiente, de comercio justo, de economía del bien común, de economía colaborativa, de economía circular, o de desarrollo social.</p>
	</div>
	<div class="spot col-xs-12 col-sm-3">
		<p>Facilita las cosas a todos los que te están buscando.</p>
		<p>Anúnciate en Despierta.org.</p>
		<p>¡Es gratis!</p>
	</div>
	<div class="form-group text-left col-xs-12 col-sm-9">
	<?php
		$form['account']['name']['#title'] = t('Usuario');
		$form['account']['name']['#attributes']['placeholder'] = t('Introduce el usuario');
		unset($form['account']['name']['#description']);
		
		$form['account']['mail']['#attributes']['placeholder'] = t('Introduce el email');
		unset($form['account']['mail']['#description']);
		
		$form['account']['pass']['#attributes']['placeholder'] = t('Introduce la contraseña');
		unset($form['account']['pass']['#description']);

		$form['actions']['submit'] = array(
			'#type' => 'submit',
			'#value' => t('Registrar'),
		);

		// render form
		print drupal_render_children($form);
	?>
	</div>
</div>
