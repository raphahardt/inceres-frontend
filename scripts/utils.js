angular.module('app.utils', [])
	// função pra atrasar uma chamada de função e "cancela" todas as chamadas posteriores
	// enquanto o delay ainda não tiver terminado.
	// é basicamente o debounce de botão em eletrônica, por exemplo.
	// inspirado em http://jsfiddle.net/Warspawn/6K7Kd/, mas mais simplificado pro meu uso aqui
	.factory('debounce', ['$rootScope', '$browser', '$q', function ($rootScope, $browser, $q) {
		var deferreds = {},
			methods = {},
			uuid = 0;

		function debounce(fn, delay) {
			var deferred = $q.defer(),
				promise = deferred.promise,
				timeoutId, cleanup,
				methodId, bouncing = false;

			// check we dont have this method already registered
			angular.forEach(methods, function (value, key) {
				if (angular.equals(methods[key].fn, fn)) {
					bouncing = true;
					methodId = key;
				}
			});

			// not bouncing, then register new instance
			if (!bouncing) {
				methodId = uuid++;
				methods[methodId] = {fn: fn};
			} else {
				// clear the old timeout
				deferreds[methods[methodId].timeoutId].reject('bounced');
				$browser.defer.cancel(methods[methodId].timeoutId);
			}

			var debounced = function () {
				// actually executing? clean method bank
				delete methods[methodId];

				try {
					deferred.resolve(fn());
				} catch (e) {
					deferred.reject(e);
				}

				$rootScope.$apply();
			};

			timeoutId = $browser.defer(debounced, delay);

			// track id with method
			methods[methodId].timeoutId = timeoutId;

			promise.$$timeoutId = timeoutId;
			deferreds[timeoutId] = deferred;
			promise.finally(function () {
				delete deferreds[promise.$$timeoutId];
			});

			return promise;
		}

		return debounce;
	}])