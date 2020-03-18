angular.module('app.controllers')
	.controller('PragaModalEditRemoveController', ['$uibModalInstance', '$scope', 'praga', function ($uibModalInstance, $scope, praga) {
		$scope.praga = praga;
		$scope.$errors = {};

		$scope.$watchCollection('praga', function () {
			$scope.$errors = praga.$validacao();
		});

		this.confirm = () => {
			$uibModalInstance.close($scope.praga);
		};

		this.cancel = () => {
			$uibModalInstance.dismiss('cancel');
		};
	}])