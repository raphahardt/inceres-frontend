angular.module('app.controllers')
	.controller('FormigueiroMapaController', ['FormigueiroCollection', '$scope', function (FormigueiroCollection, $scope) {
		this.loadingList = this.loadingMap = true;
		this.pontos = [];
		FormigueiroCollection.getAll()
			.then((formigueiros) => {
				this.pontos = formigueiros;
			})
			.finally(() => {
				this.loadingList = false;
			})

		$scope.$on('googmapLoaded', () => {
			this.loadingMap = false;
		})
	}])