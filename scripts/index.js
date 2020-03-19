const dependencies = [
  'app.navigation',
  'app.etiqueta',
  'app.googmap',
  'app',
  'ui.bootstrap',
];
var app = angular.module('fieldNotebook', dependencies);

app.config(['navsProvider', function(navsProvider) {
  navsProvider.addNavigation('Apontamento de Pragas', {
    name: 'pragas',
    url: '/pragas',
    templateUrl: '/templates/pragas.html',
    controllerAs: '$ctrl',
    controller: 'PragaController'
  });

  navsProvider.addState({
    name: 'pragas-mapa',
    url: '/pragas/mapa',
    templateUrl: '/templates/pragas-mapa.html',
    controllerAs: '$ctrl',
    controller: 'PragaMapaController'
  });

  navsProvider.addNavigation('Apontamento de Formigueiros', {
    name: 'formigueiros',
    url: '/formigueiros',
    templateUrl: '/templates/formigueiros.html',
    controllerAs: '$ctrl',
    controller: 'FormigueiroController'
  });

  navsProvider.addState({
    name: 'formigueiros-mapa',
    url: '/formigueiros/mapa',
    templateUrl: '/templates/formigueiros-mapa.html',
    controllerAs: '$ctrl',
    controller: 'FormigueiroMapaController'
  });
}]);