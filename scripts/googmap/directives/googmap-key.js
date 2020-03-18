angular.module('app.googmap')
	.directive('googmapKey', ['Googmap', '$rootScope', '$uiRouter', function (Googmap, $rootScope, $uiRouter) {
		return {
			restrict: 'A',
			scope: {
				googmapKey: '@'
			},
			link: function (scope, elem, attrs) {
				Googmap.init(attrs.googmapKey).then((google) => {
					console.log('carregou gmaps', google);
					$rootScope.$broadcast('googmapLoaded', google);
				});

				$uiRouter.transitionService.onSuccess({}, function () {
					Googmap.init(attrs.googmapKey).then((google) => {
						$rootScope.$broadcast('googmapLoaded', google);
					});
				});

				// ouve também quando o usuário quer que recarregue, em casos, de
				// quando um mapa não existia na página antes de ser carregada (um modal abrindo, por exemplo)
				$rootScope.$on('googmapInit', (event) => {
					Googmap.init(attrs.googmapKey).then((google) => {
						$rootScope.$broadcast('googmapLoaded', google);
					});
				})
			}
		}
	}])