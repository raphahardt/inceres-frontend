angular.module('app.directives')
	/**
	 * Elemento pra formatar uma coordenada com icone e amigável pro usuário
	 */
	.directive('coord', [function () {
		return {
			restrict: 'E',
			scope: {
				coords: '=val'
			},
			template: `<span class="glyphicon glyphicon-map-marker"></span> <span>{{ coords.lat }}</span>, <span>{{ coords.lng }}</span>`,
			link: function (scope, elem, attrs) {
				// nada
			}
		}
	}])