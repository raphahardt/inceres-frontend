angular.module('app.navigation')
	/**
	 * Componente <collapse-button>
	 *
	 * Feito pra abstrair o botão de abrir/fechar menu no navbar.
	 * Requer <navbar>
	 */
	.component('collapseButton', {
		'template': `
			<button type="button" class="navbar-toggle collapsed" ng-click="$ctrl.navbarCtrl.toggle()" aria-expanded="false" aria-controls="navbar">
	      <span class="sr-only">Abrir menu</span>
	      <span class="icon-bar"></span>
	      <span class="icon-bar"></span>
	      <span class="icon-bar"></span>
	    </button>`,
		require: {
			navbarCtrl: '^^navbar'
		},
	})