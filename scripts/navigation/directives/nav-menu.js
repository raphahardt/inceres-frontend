angular.module('app.navigation')
	/**
	 * Componente <nav-menu>
	 *
	 * Aceita duas configurações: 'left' e 'top'
	 * Ele usa o serviço navs para obter os menus de navegação disponíveis
	 * para serem mostrados pro usuário.
	 * Pode ser usado dentro ou fora de um <navbar>
	 *
	 */
	.component('navMenu', {
		template: `
		  <ul class="nav" ng-class="{'navbar-nav navbar-right': $ctrl.type === 'top', 'nav-sidebar': $ctrl.type === 'left'}">
		    <li ng-repeat="menu in $ctrl.menus" ui-sref-active="active"><a ui-state="menu.state">{{:: menu.titulo }}</a></li>
		  </ul>`,
		require: {
			navbarCtrl: '?^^navbar'
		},
		bindings: {
			type: '@'
		},
		controller: ['$uiRouter', '$attrs', 'navs', function ($uiRouter, $attrs, navs) {
			const ctrl = this;

			ctrl.menus = navs.getNavigations().map(function (m) {
				return { titulo: m.data.title, state: m.name }
			})

			ctrl.$onInit = () => {
				// para fazer o menu top collapsar quando for mudado o state
				// pro usuário não precisar ficar fechando o menu quando estiver
				// pelo celular
				if (ctrl.navbarCtrl && $attrs.type === 'top') {
					$uiRouter.transitionService.onStart({}, function () {
						ctrl.navbarCtrl.hide();
					});
				}
			}
		}]
	})