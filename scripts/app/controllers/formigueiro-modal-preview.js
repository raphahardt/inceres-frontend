angular.module('app.controllers')
	.controller('FormigueiroModalPreviewController', ['$uibModalInstance', 'formigueiro', '$scope', function ($uibModalInstance, formigueiro, $scope) {
		this.loadingMap = true;
		$scope.formigueiro = formigueiro;

		$scope.$on('googmapLoaded', () => {
			console.log('preview map carregado');
			this.loadingMap = false;
		})

		this.close = () => {
			$uibModalInstance.close();
		};
	}])