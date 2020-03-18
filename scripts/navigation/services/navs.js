angular.module('app.navigation')
	/**
	 * Serviço navsProvider
	 *
	 * Serve para registrar no uiRouter os states e menus que devem
	 * ser vísiveis na navegação.
	 */
	.provider('navs', ['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		const navs = [];

		/**
		 * Registra um state no uiRouter como um menu de navegação
		 * Ele ficará visível usando o método do serviço .getNavigations()
		 * para ser usado com componentes que precisam dos menus de navegação
		 * do usuário
		 *
		 * @param {String} title - Título do menu
		 * @param {Object} state - State para o $stateProvider
		 */
		this.addNavigation = (title, state) => {
			state.data = state.data || {};
			if (!angular.isDefined(state.data.title)) {
				state.data.title = title;
			}
			navs.push(state);

			this.addState(state);
		}

		/**
		 * Registra um state no uiRouter
		 * @param {Object} state - State para o $stateProvider
		 */
		this.addState = (state) => {
			$stateProvider.state(state);
		}

		// automaticamente registra 'home' como um menu
		this.addNavigation('Home', {
			name: 'home',
			url: '/',
			templateUrl: '/templates/home.html'
		})

		// redirect padrão pra home
		$urlRouterProvider.when('', '/');

		this.$get = [function () {
			return {
				/**
				 * Retorna apenas os menus registrados com .addNavigation()
				 * @returns {Object[]}
				 */
				getNavigations: function () {
					return navs;
				}
			}
		}];
	}])