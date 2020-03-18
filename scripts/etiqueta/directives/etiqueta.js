angular.module('app.etiqueta')
	.directive('etiqueta', ['$filter', function ($filter) {
		return {
			restrict: 'A',
			scope: {
				// PS: aqui poderia ser =, mas quis fazer assim pra mostrar outra forma
				// de fazer usando o attrs.$observe
				etiqueta: '@'
			},
			link: function (scope, elem, attrs) {
				const etiquetaCor = $filter('etiquetaCor');
				attrs.$observe('etiqueta', function (val) {
					elem.css({'background-color': etiquetaCor(val)});
				})
			}
		}
	}])