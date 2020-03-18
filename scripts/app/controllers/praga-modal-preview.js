angular.module('app.controllers')
	.controller('PragaModalPreviewController', ['$uibModalInstance', 'praga', '$scope', function ($uibModalInstance, praga, $scope) {
		this.loadingMap = true;
		$scope.praga = praga;

		$scope.$on('googmapLoaded', () => {
			console.log('preview map carregado');
			this.loadingMap = false;
		})

		this.close = () => {
			$uibModalInstance.close();
		};
	}])