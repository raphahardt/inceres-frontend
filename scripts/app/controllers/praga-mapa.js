angular.module('app.controllers')
	.controller('PragaMapaController', ['PragaCollection', '$scope', function (PragaCollection, $scope) {
		this.loadingList = this.loadingMap = true;
		this.pontos = [];
		PragaCollection.getAll()
			.then((pragas) => {
				this.pontos = pragas;
			})
			.finally(() => {
				this.loadingList = false;
			})

		$scope.$on('googmapLoaded', () => {
			this.loadingMap = false;
		})
	}])