angular.module('app.googmap')
	.directive('googmapMap', [function () {
		return {
			restrict: 'EA',
			controller: ['$scope', '$element', 'debounce', function ($scope, $element, debounce) {
				var google;
				var map = $scope.$map = null;
				// esse buffer serve para guardar os markers que
				// foram adicionados mas ainda não estava com google.maps api
				// carregado. quando a api carregar, o buffer vai ser
				// processado de uma vez
				var markersBuffer = [];
				var markers = [];

				this.adjustBoundsMap = () => {
					if (google) {
						var bounds = new google.maps.LatLngBounds();

						for (var i = 0; i < markers.length; i++) {
							console.log('ccc', markers[i].getPosition());
							bounds.extend(markers[i].getPosition());
						}

						map.fitBounds(bounds);

						// se só houver um ponto ou pontos muito juntos, o zoom
						// fica próximo demais. então verifico se o zoom está muito
						// alto e dou zoomout
						if (map.getZoom() > 16) {
							map.setZoom(16);
						}
					}
				}

				this.addMarker = (marker, cor) => {
					if (google) {
						// icone adaptado de: https://simpleicon.com/map-marker-2.html
						var icon = {
							anchor: {x: 256, y: 512},
							path: 'M256,0C149.969,0,64,85.969,64,192c0,43.188,14.25,83,38.313,115.094L256,512l153.688-204.906	C433.75,275,448,235.188,448,192C448,85.969,362.031,0,256,0z M256,320c-70.688,0-128-57.313-128-128S185.313,64,256,64	s128,57.313,128,128S326.688,320,256,320z',
							fillColor: cor,
							strokeColor: 'black',
							strokeWeight: 2,
							fillOpacity: 1,
							scale: 0.09
						}

						var m = new google.maps.Marker({
							position: marker,
							icon: icon,
							map: map
						});

						markers.push(m);

						// eu chamo o ajuste do mapa com "atraso",
						// isso faz com que ela só seja chamada quando todos
						// os markers forem adicionados, evitando que ela
						// seja chamada muitas vezes
						debounce(this.adjustBoundsMap, 300);
					} else {
						// api ainda não carregou, joga pro buffer
						markersBuffer.push([marker, cor]);
					}
				}

				this.deleteMarker = (marker) => {
					if (!google) {
						// api ainda não carregou, deleta do buffer
						for (var j = 0; j < markersBuffer.length; j++) {
							if (angular.equals(markersBuffer[j][0], marker)) {
								markersBuffer.splice(j, 1);
								break;
							}
						}
					}
					// mesmo se ainda não tem api, deixo o código
					// correr pra procurar no markers, pois não vai achar nada mesmo
					var i = markers.findIndex((m) => angular.equals(m.getPosition(), marker))
					if (i >= 0) {
						markers[i].setMap(null);
						markers = markers.splice(i, 1);
					}
				}

				this.init = (g) => {
					if (map) return; //já carregou o mapa, não precisa carregar de novo

					// define dentro desse controller o objeto como "global" local
					google = g;

					var elem = $element.find('googmap-element');
					elem.addClass('fullmap-inner');

					map = new google.maps.Map(elem[0], {
						mapTypeId: google.maps.MapTypeId.ROADMAP
					})

					// processa o buffer, se houver
					while (markersBuffer.length) {
						var nextMarker = markersBuffer.shift();
						this.addMarker(...nextMarker);
					}
				}

				$scope.$on('googmapLoaded', (event, g) => {
					this.init(g);
				})

			}]
		}
	}])