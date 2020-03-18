/**
PS: eu geralmente separaria componentes em arquivos separados, mas como o Codepen
tem um limite de apenas 10 arquivos, estou deixando tudo em um só.
*/
var app = angular.module('fieldNotebook', ['ui.router', 'ui.bootstrap']);

// navs.js
/**
  Serviço navsProvider

  Serve para registrar no uiRouter os states e menus que devem
  ser vísiveis na navegação.
*/
app.provider('navs', ['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  var navs = [];
  
  /*
  Registra um state no uiRouter como um menu de navegação
  Ele ficará visível usando o método do serviço .getNavigations()
  para ser usado com componentes que precisam dos menus de navegação
  do usuário
  @param {String} title - Título do menu
  @param {Object} state - State para o $stateProvider
  */
  this.addNavigation = (title, state) => {
    state.data = state.data || {};
    if (!angular.isDefined(state.data.title)) {
      state.data.title = title;
    }
    navs.push(state);
    
    this.addState(state);
  }
  
  /*
  Registra um state no uiRouter
  @param {Object} state - State para o $stateProvider
  */
  this.addState = (state) => {
    $stateProvider.state(state);
  }
  
  // automaticamente registra 'home' como um menu
  this.addNavigation('Home', {
    name: 'home',
    url: '/',
    templateUrl: '/templates/home.html'
  })
  
  // redirect padrão pra home
  $urlRouterProvider.when('', '/');
  
  this.$get = [function () {
    return {
      /*
      Retorna apenas os menus registrados com .addNavigation()
      */
      getNavigations: function () {
        return navs;
      }
    }
  }];
}])

/**
  Componente <nav-menu>
  Aceita duas configurações: 'left' e 'top'
  Ele usa o serviço navs para obter os menus de navegação disponíveis
  para serem mostrados pro usuário.
*/
app.component('navMenu', {
  template: `
  <ul class="nav" ng-class="{'navbar-nav navbar-right': $ctrl.type === 'top', 'nav-sidebar': $ctrl.type === 'left'}">
    <li ng-repeat="menu in $ctrl.menus" ui-sref-active="active"><a ui-state="menu.state">{{:: menu.titulo }}</a></li>
  </ul>
  `,
  bindings: {
    type: '@'
  },
  controller: ['$uiRouter', '$rootScope', '$attrs', 'navs', function ($uiRouter, $rootScope, $attrs, navs) {
    this.menus = navs.getNavigations().map(function (m) {
      return { titulo: m.data.title, state: m.name }
    })
    
    // para fazer o menu top collapsar quando for mudado o state
    // pro usuário não precisar ficar fechando o menu quando estiver 
    // pelo celular
    if ($attrs.type === 'top') {
      $uiRouter.transitionService.onStart({}, function () {
        $rootScope.navConfig.hide();
      });
    }
  }]
})

app.run(['$rootScope', function ($rootScope) {
  // configuração do nav disponível em todos os scopes definindo no $rootScope
  $rootScope.navConfig = {
    topCollapsed: true,
    toggle: function () {
      $rootScope.navConfig.topCollapsed = !$rootScope.navConfig.topCollapsed;
    },
    hide: function () {
      $rootScope.navConfig.topCollapsed = true;
    }
  }
}])
// fim do navs.js

// collection.js
// banco de dados fake, criado só pra simular loadings e guardar dados temporariamente
app.provider('Collection', [function () {
  var provider = this;
  function Collection(itemConstructor, $q) {
    var collection = [];
    
    if (window.sessionStorage && window.sessionStorage.getItem) {
      collection = angular.fromJson(window.sessionStorage.getItem('collection-' + itemConstructor.name) || '[]');
    }
    
    function _find(id, returnIndex) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].$id === id) {
          return returnIndex ? i : collection[i];
        }
      }
      return undefined;
    }
    
    function _saveAll() {
      if (window.sessionStorage && window.sessionStorage.setItem) {
        window.sessionStorage.setItem('collection-' + itemConstructor.name, angular.toJson(collection));
      }
    }
    
    this.getAll = () => {
      return $q((resolve) => {
        setTimeout(function () {
          resolve(collection.slice())
        }, 600);
      });
    }
    
    this.get = (id) => {
      return $q((resolve, reject) => {
        setTimeout(function () {
          var foundItem = _find(id);
          
          if (!foundItem) {
            reject('Item não encontrado');
          } else {
            // cria uma cópia desse objeto, pois
            // não quero que ele seja referencia direta do item em si.
            // isso evita que o modal edite diretamente o objeto
            // e dificulte a possibilidade de cancelar uma alteração depois.
            var item = Object.assign(new itemConstructor(), foundItem);
            resolve(item);
          }
        }, 300);
      });
    }

    this.insert = (item) => {
      return $q((resolve, reject) => {
        if (!(item instanceof itemConstructor)) {
          reject('Item deve ser do tipo ' + itemConstructor.name)
        } else {
          if (item.$validacao) {
            var valid = item.$validacao();
            if (valid !== true) {
              reject(valid);
              return;
            }
          }
          item.$id = collection.length + 1;
          collection.push(item);
          resolve(collection.slice());
          
          _saveAll();
        }
      })
    }
    
    this.update = (id, item) => {
      return $q((resolve, reject) => {
        if (!(item instanceof itemConstructor)) {
          reject('Item deve ser do tipo ' + itemConstructor.name)
        } else {
          var oldItem = _find(id);
          if (!oldItem) {
            reject('Item não encontrado');
          } else {
            if (item.$validacao) {
              var valid = item.$validacao();
              if (valid !== true) {
                reject(valid);
                return;
              }
            }
            item.$id = id;
            Object.assign(oldItem, item);
            resolve(collection.slice());
            
            _saveAll();
          }
        }
      })
    }
    
    this.remove = (id) => {
      return $q((resolve, reject) => {
        var oldIndex = _find(id, true);
        if (oldIndex === undefined) {
          reject('Item não encontrado');
        } else {
          collection.splice(oldIndex, 1);
          resolve(collection.slice());

          _saveAll();
        }
      })
    }
    
    this.isEmpty = () => {
      return collection.length === 0;
    }
  }
  
  this.$get = ['$q', function ($q) {
    return function factory(itemConstructor, initialLiteralData) {
      var c = new Collection(itemConstructor, $q);
      // FIXME: está aqui apenas pra debugar somente
      // pra ter uns data fixtures nas bases
      if (c.isEmpty() && initialLiteralData && angular.isArray(initialLiteralData)) {
        for (var i = 0; i < initialLiteralData.length; i++) {
          var data = Object.assign(new itemConstructor(), initialLiteralData[i]);
          c.insert(data);
        }
      }
      return c;
    }
  }]
}])
// fim do collection.js

// etiqueta.js
app.provider('etiquetaCor', [function () {
  var cores = ['#FF0303', '#FFBF00', '#008E09']; // PS: isso daria pra fazer configurável por alguma função no provider, tipo .setRegrasCor()
  var limites = [2, 4, Infinity];
  
  this.$get = [function () {
    return {
      getCor: (quantidade) => {
        for (var i = 0; i < cores.length; i++) {
          if (quantidade < limites[i]) {
            return cores[i];
          }
        }
        // nenhuma cor encontrada pra esse parametro
        return 'transparent';
      }
    }
  }]
}])
app.directive('etiqueta', ['etiquetaCor', function (etiquetaCor) {
  return {
    restrict: 'A',
    scope: {
      // PS: aqui poderia ser =, mas quis fazer assim pra mostrar outra forma
      // de fazer usando o attrs.$observe
      etiqueta: '@'
    },
    link: function (scope, elem, attrs) {
      attrs.$observe('etiqueta', function (val) {
        elem.css({'background-color': etiquetaCor.getCor(val)});
      })
    }
  }
}])
// fim do etiqueta.js

// coord.js
// elemento pra formatar uma coordenada com icone e amigável pro usuário
app.directive('coord', [function () {
  return {
    restrict: 'E',
    scope: {
      coords: '=val'
    },
    template: `<span class="glyphicon glyphicon-map-marker"></span> <span>{{ coords.lat }}</span>, <span>{{ coords.lng }}</span>`,
    link: function (scope, elem, attrs) {
      // nada
    }
  }
}])
// fim do coord.js

// debounce.js
// função pra atrasar uma chamada de função e "cancela" todas as chamadas posteriores
// enquanto o delay ainda não tiver terminado. 
// é basicamente o debounce de botão em eletrônica, por exemplo.
// inspirado em http://jsfiddle.net/Warspawn/6K7Kd/, mas mais simplificado pro meu uso aqui
app.factory('debounce', ['$rootScope', '$browser', '$q', function ($rootScope, $browser, $q) {
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
// fim do debounce.js

// google-map.js
app.provider('Googmap', [function () {
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
        document.body.appendChild(tag);
        
        return deferred.promise;
      }
    }
  }]
}])
app.directive('googmapKey', ['Googmap', '$rootScope', '$uiRouter', function (Googmap, $rootScope, $uiRouter) {
  return {
    restrict: 'A',
    scope: {
      googmapKey: '@'
    },
    link: function (scope, elem, attrs) {
      Googmap.init(attrs.googmapKey).then((google) => {
        console.log('carregou gmaps', google);
        $rootScope.$broadcast('googmapLoaded', google);
      });
      
      $uiRouter.transitionService.onSuccess({}, function () {
        Googmap.init(attrs.googmapKey).then((google) => {
          $rootScope.$broadcast('googmapLoaded', google);
        });
      });
      
      // ouve também quando o usuário quer que recarregue, em casos, de
      // quando um mapa não existia na página antes de ser carregada (um modal abrindo, por exemplo)
      $rootScope.$on('googmapInit', (event) => {
        Googmap.init(attrs.googmapKey).then((google) => {
          $rootScope.$broadcast('googmapLoaded', google);
        });
      })
    }
  }
}])
app.directive('googmapMap', [function () {
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
            anchor: {x:256, y:512},
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
app.directive('googmapMarker', ['etiquetaCor', function (etiquetaCor) {
  return {
    restrict: 'EA',
    require: '^^googmapMap',
    scope: {
      coords: '=',
      quantidade: '=?'
    },
    link: function (scope, elem, attrs, controller) {
      console.log('adicinou marker');
      controller.addMarker(scope.coords, etiquetaCor.getCor(scope.quantidade));
      
      scope.$on('$destroy', () => {
        console.log('deletou marker');
        controller.deleteMarker(scope.coords);
      })
    }
  }
}])
// fim do google-map.js