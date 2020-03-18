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
		let nextUuid = 3;
		let pragas = [
			{$id: 1, datahora: new Date(), coordenada: {lat: -22.610234, lng: -47}, quantidade: 1, observacoes: 'Teste de observação'},
			{$id: 2, datahora: new Date(), coordenada: {lat: -23, lng: -47.406200}, quantidade: 3},
		];
		let formigueiros = [];


		function respondGET(items) {
			return function (method, url, data, headers, params) {
				if (params.id) {
					const item = _.find(items, (item) => item.$id === Number.parseInt(params.id));
					return [200, item, {}];
				}
				return [200, items, {}];
			}
		}

		function respondPOST(items) {
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
				return [201, item, {}];
			}
		}

		function respondPUT(items) {
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
					return [200, data, {}];
				}

				return [404, '', {}];
			}
		}

		function respondDELETE(items) {
			return function (method, url, data, headers, params) {
				if (params.id) {
					const index = _.findIndex(items, (item) => item.$id === Number.parseInt(params.id));
					items.splice(index, 1);
					return [200, true, {}];
				}

				return [404, '', {}];
			}
		}

		$httpBackend.when('GET', /^\/api\/pragas(\?id=\d+)?/).respond(respondGET(pragas));
		$httpBackend.when('POST', '/api/pragas').respond(respondPOST(pragas));
		$httpBackend.when('PUT', /^\/api\/pragas(\?id=\d+)?/).respond(respondPUT(pragas));
		$httpBackend.when('DELETE', /^\/api\/pragas\?id=\d+/).respond(respondDELETE(pragas));

		$httpBackend.when('GET', /^\/api\/formigueiros(\?id=\d+)?/).respond(respondGET(formigueiros));
		$httpBackend.when('POST', '/api/formigueiros').respond(respondPOST(formigueiros));
		$httpBackend.when('PUT', /^\/api\/formigueiros(\?id=\d+)?/).respond(respondPUT(formigueiros));
		$httpBackend.when('DELETE', /^\/api\/formigueiros\?id=\d+/).respond(respondDELETE(formigueiros));

		// pra os /templates continuarem sendo chamados normalmente, sem passar
		// pelo mock
		$httpBackend.whenGET(/^\/templates\//).passThrough();

	}])