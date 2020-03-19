angular.module('app.controllers')
	.controller('PragaModalEditRemoveController', ['$uibModalInstance', '$scope', 'praga', function ($uibModalInstance, $scope, praga) {
		$scope.praga = praga;
		$scope.$errors = {};
		$scope.$hasErrors = false;

		$scope.$watch('praga', function () {
			$scope.$errors = praga.$validacao();
			$scope.$hasErrors = Object.keys($scope.$errors).length > 0;
		}, true);

		this.confirm = () => {
			$uibModalInstance.close($scope.praga);
		};

		this.cancel = () => {
			$uibModalInstance.dismiss('cancel');
		};
	}])