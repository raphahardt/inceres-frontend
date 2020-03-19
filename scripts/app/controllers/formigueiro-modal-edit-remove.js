angular.module('app.controllers')
	.controller('FormigueiroModalEditRemoveController', ['$uibModalInstance', '$scope', 'formigueiro', function ($uibModalInstance, $scope, formigueiro) {
		$scope.formigueiro = formigueiro;
		$scope.$errors = {};
		$scope.$hasErrors = false;

		$scope.$watch('formigueiro', function () {
			$scope.$errors = formigueiro.$validacao();
			$scope.$hasErrors = Object.keys($scope.$errors).length > 0;
		}, true);

		this.confirm = () => {
			$uibModalInstance.close($scope.formigueiro);
		};

		this.cancel = () => {
			$uibModalInstance.dismiss('cancel');
		};
	}])