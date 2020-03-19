/**
 * Módulo para teste do fieldNotebook
 * Feito apenas pra mock dos dados do sistema não precisa se conectar em nenhum backend real
 */
angular.module('fieldNotebook-dev', ['fieldNotebook', 'ngMockE2E'])
	/**
	 * Decorador no $httpBackend pra simular um delay de request e também
	 * pra garantir que o $digest seja chamado (esse bug de não rodar o $digest na resposta
	 * acontece só com o mock, não aconteceria em ambiente de produção)
	 */
	.decorator('$httpBackend', ['$delegate', '$rootScope', function($delegate, $rootScope) {
		var proxy = function(method, url, data, callback, headers, timeout, withCredentials, responseType, eventHandlers, uploadEventHandlers) {
			var interceptor = function() {
				var _arguments = arguments;
				setTimeout(() => {
					callback.apply(this, _arguments);
					$rootScope.$evalAsync();
				}, 500);
			};
			return $delegate.call(this, method, url, data, interceptor, headers, timeout, withCredentials, responseType, eventHandlers, uploadEventHandlers);
		};

		angular.extend(proxy, $delegate);

		return proxy;
	}])
	/**
	 * Definição dos fixtures
	 */
	.run(['$httpBackend', function ($httpBackend) {
		let nextUuid = 1;
		let pragas = [];
		let formigueiros = [];

		if (window.sessionStorage && window.sessionStorage.getItem) {
			pragas = angular.fromJson(window.sessionStorage.getItem('collection-pragas') || '[]');
			formigueiros = angular.fromJson(window.sessionStorage.getItem('collection-formigueiros') || '[]');
		}

		function _saveStorage(items, collName) {
			if (window.sessionStorage && window.sessionStorage.setItem) {
				window.sessionStorage.setItem(`collection-${collName}`, angular.toJson(items));
			}
		}

		function respondGET(items, collName) {
			return function (method, url, data, headers, params) {
				if (params.id) {
					const item = _.find(items, (item) => item.$id === Number.parseInt(params.id));
					return [200, item, {}];
				}
				return [200, items, {}];
			}
		}

		function respondPOST(items, collName) {
			return function (method, url, data, headers, params) {
				// PUT e POST, os request data vem em string, então normalizo os dados
				if (typeof data === 'string') {
					let json = angular.fromJson(data);
					data = json.data;
				}
				const item = data;
				item.$id = nextUuid;
				nextUuid++;
				items.push(item);
				_saveStorage(items, collName);
				return [201, item, {}];
			}
		}

		function respondPUT(items, collName) {
			return function (method, url, data, headers, params) {
				// PUT e POST, os request data vem em string, então normalizo os dados
				if (typeof data === 'string') {
					let json = angular.fromJson(data);
					data = json.data;
					params = json.params;
				}
				if (params.id) {
					const index = _.findIndex(items, (item) => item.$id === Number.parseInt(params.id));
					items.splice(index, 1, data);
					_saveStorage(items, collName);
					return [200, data, {}];
				}

				return [404, '', {}];
			}
		}

		function respondDELETE(items, collName) {
			return function (method, url, data, headers, params) {
				if (params.id) {
					const index = _.findIndex(items, (item) => item.$id === Number.parseInt(params.id));
					items.splice(index, 1);
					_saveStorage(items, collName);
					return [200, true, {}];
				}

				return [404, '', {}];
			}
		}

		$httpBackend.when('GET', /^\/api\/pragas(\?id=\d+)?/).respond(respondGET(pragas, 'pragas'));
		$httpBackend.when('POST', '/api/pragas').respond(respondPOST(pragas, 'pragas'));
		$httpBackend.when('PUT', /^\/api\/pragas(\?id=\d+)?/).respond(respondPUT(pragas, 'pragas'));
		$httpBackend.when('DELETE', /^\/api\/pragas\?id=\d+/).respond(respondDELETE(pragas, 'pragas'));

		$httpBackend.when('GET', /^\/api\/formigueiros(\?id=\d+)?/).respond(respondGET(formigueiros, 'formigueiros'));
		$httpBackend.when('POST', '/api/formigueiros').respond(respondPOST(formigueiros, 'formigueiros'));
		$httpBackend.when('PUT', /^\/api\/formigueiros(\?id=\d+)?/).respond(respondPUT(formigueiros, 'formigueiros'));
		$httpBackend.when('DELETE', /^\/api\/formigueiros\?id=\d+/).respond(respondDELETE(formigueiros, 'formigueiros'));

		// pra os /templates continuarem sendo chamados normalmente, sem passar
		// pelo mock
		$httpBackend.whenGET(/^\/templates\//).passThrough();

	}])