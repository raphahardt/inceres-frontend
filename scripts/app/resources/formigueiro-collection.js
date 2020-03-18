angular.module('app.resources')
	.factory('FormigueiroCollection', ['Collection', 'Formigueiro', function (Collection, Formigueiro) {
		return new Collection('/api/formigueiros', Formigueiro);
	}])