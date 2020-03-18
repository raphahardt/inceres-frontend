angular.module('app.googmap')
	.provider('Googmap', [function () {
		var provider = this;
		// a key do google maps vai aqui, mas pode ser definida pela diretiva googmapKey
		this.key = undefined;

		this.$get = ['$window', '$q', function ($window, $q) {
			return {
				/*
				Carrega o Google maps (se não tiver carregado) e resolve retornando o objeto global "google"
				*/
				init: function (key) {
					if (key !== undefined) provider.key = key;

					var deferred = $q.defer();

					if (angular.isDefined($window.google) && angular.isDefined($window.google.maps)) {
						// se o objeto google já tá carragado, apenas resolver retornando ele
						deferred.resolve($window.google);
						return deferred.promise;
					}

					// eu crio uma função aqui para que o google possa
					// chamar como callback de inicialização.
					// a partir dessa chamada eu sei que o googlemaps está
					// carregado
					$window.initGmap = function () {
						deferred.resolve($window.google);
					};

					// depois eu crio uma tag script pra carregar o google maps
					// passando minha função de callback
					var tag = document.createElement('script');
					tag.src = 'https://maps.googleapis.com/maps/api/js?key=' + provider.key + '&callback=initGmap';
					tag.async = true;

					// antes de colocar na pagina, eu verifico se a tag já não existe
					// (evita problema que estava duplicando o load do maps)
					if (angular.element('script[src="' + tag.src + '"]').length === 0) {
						document.body.appendChild(tag);
					}

					return deferred.promise;
				}
			}
		}]
	}])