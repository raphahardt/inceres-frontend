angular.module('app.etiqueta')
	.filter('etiquetaCor', [function () {
		var cores = ['#FF0303', '#FFBF00', '#008E09']; // PS: isso daria pra fazer configurável por alguma função no provider, tipo .setRegrasCor()
		var limites = [2, 4, Infinity];

		return function (quantidade) {
			quantidade = Number.parseInt(quantidade);
			for (var i = 0; i < cores.length; i++) {
				if (quantidade < limites[i]) {
					return cores[i];
				}
			}
			// nenhuma cor encontrada pra esse parametro
			return 'transparent';
		}
	}])