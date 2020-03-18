angular.module('app.googmap')
	.directive('googmapMarker', ['$filter', function ($filter) {
		const etiquetaCor = $filter('etiquetaCor');

		return {
			restrict: 'EA',
			require: '^^googmapMap',
			scope: {
				coords: '=',
				quantidade: '=?'
			},
			link: function (scope, elem, attrs, controller) {
				console.log('adicinou marker');
				controller.addMarker(scope.coords, etiquetaCor(scope.quantidade));

				scope.$on('$destroy', () => {
					console.log('deletou marker');
					controller.deleteMarker(scope.coords);
				})
			}
		}
	}])