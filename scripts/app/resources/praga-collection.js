angular.module('app.resources')
	.factory('PragaCollection', ['Collection', 'Praga', function (Collection, Praga) {
		return new Collection('/api/pragas', Praga);
	}])