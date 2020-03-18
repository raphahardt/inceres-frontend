// pragas.js
app.factory('Praga', function () {
  function Praga() {}
  Praga.prototype = {
    $id: undefined,
    datahora: undefined,
    coordenada: undefined,
    quantidade: undefined,
    observacoes: undefined,
    // define a validação das propriedades aqui
    // retornar TRUE se o objeto for válido, ou Object se for erro
    $validacao: function () {
      var errors = {};
      if (!this.datahora) {
        errors['datahora'] = 'Data/hora obrigatória';
      }
      
      if (!this.coordenada || !this.coordenada.lat || !this.coordenada.lng) {
        errors['coordenada'] = 'Coordenada obrigatória';
      } else if (this.coordenada.lat < -90 || this.coordenada.lat > 90) {
        errors['coordenada'] = 'Latitude inválida';
      } else if (this.coordenada.lng < -180 || this.coordenada.lng > 180) {
        errors['coordenada'] = 'Longitude inválida';
      }
      
      if (!this.quantidade) {
        errors['quantidade'] = 'Quantidade obrigatória';
      } else if (this.quantidade < 0) {
        errors['quantidade'] = 'Quantidade inválida';
      }
      
      return angular.equals(errors, {}) ? true : errors;
    }
  };
  return Praga;
})
.factory('PragaCollection', function (Collection, Praga) {
  return Collection(Praga, [
    {datahora: new Date(), coordenada: {lat: -22.610234, lng: -47}, quantidade: 1, observacoes: 'Teste de observação'},
    {datahora: new Date(), coordenada: {lat: -23, lng: -47.406200}, quantidade: 3},
  ]);
})
.controller('PragaModalEditRemoveController', ['$uibModalInstance', 'praga', function ($uibModalInstance, praga) {
  this.praga = praga;

  this.confirm = () => {
    $uibModalInstance.close(this.praga);
  };

  this.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };
}])
.controller('PragaModalPreviewController', ['$uibModalInstance', 'praga', '$scope', function ($uibModalInstance, praga, $scope) {
  this.loadingMap = true;
  this.praga = praga;
  
  $scope.$on('googmapLoaded', () => {
    console.log('preview map carregado');
    this.loadingMap = false;
  })

  this.close = () => {
    $uibModalInstance.close();
  };
}])
.controller('PragaController', ['PragaCollection', 'Praga', '$uibModal', '$scope', function (PragaCollection, Praga, $uibModal, $scope) {
  this.loadingList = true;
  this.pragas = [];
  
  PragaCollection.getAll()
  .then((pragas) => {
    this.pragas = pragas;
  })
  .finally(() => {
    this.loadingList = false;
  })

  this.addPraga = () => {
    var praga = new Praga();
    praga.datahora = new Date();

    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-edit.html',
      controller: 'PragaModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        praga: () => praga
      }
    });

    modalInstance.result.then((praga) => {
      return PragaCollection.insert(praga);
    })
    .then((pragas) => {
      // atualiza a lista
      this.pragas = pragas;
    })
    .catch(err => {
      if (err === 'cancel') {
        // ignorar o cancel de modal
        return;
      }
      console.error(err);
    });
  }
  
  this.editPraga = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-edit.html',
      controller: 'PragaModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        praga: () => PragaCollection.get(id)
      }
    });

    modalInstance.result.then((praga) => {
      return PragaCollection.update(id, praga);
    })
    .then((pragas) => {
      // atualiza a lista
      this.pragas = pragas;
    })
    .catch(err => {
      if (err === 'cancel') {
        // ignorar o cancel de modal
        return;
      }
      console.error(err);
    });
  }
  
  this.removePraga = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-remove.html',
      controller: 'PragaModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        praga: () => PragaCollection.get(id)
      }
    });

    modalInstance.result.then((praga) => {
      return PragaCollection.remove(id);
    })
    .then((pragas) => {
      // atualiza a lista
      this.pragas = pragas;
    })
    .catch(err => {
      if (err === 'cancel') {
        // ignorar o cancel de modal
        return;
      }
      console.error(err);
    });
  }
  
  this.previewPraga = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-preview.html',
      controller: 'PragaModalPreviewController',
      controllerAs: '$modal',
      resolve: {
        praga: () => PragaCollection.get(id)
      }
    });
    
    modalInstance.rendered.then(() => {
      // força o google a recarregar, pois o mapa dentro do modal ainda não existia
      // PS: eu tenho que fazer depois de renderizar pq o modal não ouve os eventos
      // nos scopes das diretivas durante a execução do controller do modal.
      $scope.$emit('googmapInit');
    })
  }
}])
.controller('PragaMapaController', ['PragaCollection', '$scope', function (PragaCollection, $scope) {
  this.loadingList = this.loadingMap = true;
  this.pontos = [];
  PragaCollection.getAll()
  .then((pragas) => {
    this.pontos = pragas;
  })
  .finally(() => {
    this.loadingList = false;
  })
  
  $scope.$on('googmapLoaded', () => {
    this.loadingMap = false;
  })
}])
.config(function(navsProvider) {
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
});

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
// formigueiros.js
app.factory('Formigueiro', function () {
  function Formigueiro() {}

  Formigueiro.prototype = {
    $id: undefined,
    datahora: undefined,
    coordenada: undefined,
    quantidade: undefined,
    observacoes: undefined,
    // define a validação das propriedades aqui
    // retornar TRUE se o objeto for válido, ou Object se for erro
    $validacao: function () {
      var errors = {};
      if (!this.datahora) {
        errors['datahora'] = 'Data/hora obrigatória';
      }

      if (!this.coordenada || !this.coordenada.lat || !this.coordenada.lng) {
        errors['coordenada'] = 'Coordenada obrigatória';
      } else if (this.coordenada.lat < -90 || this.coordenada.lat > 90) {
        errors['coordenada'] = 'Latitude inválida';
      } else if (this.coordenada.lng < -180 || this.coordenada.lng > 180) {
        errors['coordenada'] = 'Longitude inválida';
      }

      if (!this.quantidade) {
        errors['quantidade'] = 'Quantidade obrigatória';
      } else if (this.quantidade < 0) {
        errors['quantidade'] = 'Quantidade inválida';
      }

      return angular.equals(errors, {}) ? true : errors;
    }
  };
  return Formigueiro;
})
app.factory('FormigueiroCollection', function (Collection, Formigueiro) {
  return Collection(Formigueiro);
})
app.controller('FormigueiroModalEditRemoveController', ['$uibModalInstance', 'formigueiro', function ($uibModalInstance, formigueiro) {
  this.formigueiro = formigueiro;

  this.confirm = () => {
    $uibModalInstance.close(this.formigueiro);
  };

  this.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };
}])
app.controller('FormigueiroModalPreviewController', ['$uibModalInstance', 'formigueiro', '$scope', function ($uibModalInstance, formigueiro, $scope) {
  this.loadingMap = true;
  this.formigueiro = formigueiro;

  $scope.$on('googmapLoaded', () => {
    console.log('preview map carregado');
    this.loadingMap = false;
  })

  this.close = () => {
    $uibModalInstance.close();
  };
}])
app.controller('FormigueiroController', ['FormigueiroCollection', 'Formigueiro', '$uibModal', '$scope', function (FormigueiroCollection, Formigueiro, $uibModal, $scope) {
  this.loadingList = true;
  this.formigueiros = [];

  FormigueiroCollection.getAll()
    .then((formigueiros) => {
      this.formigueiros = formigueiros;
    })
    .finally(() => {
      this.loadingList = false;
    })

  this.addFormigueiro = () => {
    var formigueiro = new Formigueiro();
    formigueiro.datahora = new Date();

    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-edit.html',
      controller: 'FormigueiroModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        formigueiro: () => formigueiro
      }
    });

    modalInstance.result.then((formigueiro) => {
      return FormigueiroCollection.insert(formigueiro);
    })
      .then((formigueiros) => {
        // atualiza a lista
        this.formigueiros = formigueiros;
      })
      .catch(err => {
        if (err === 'cancel') {
          // ignorar o cancel de modal
          return;
        }
        console.error(err);
      });
  }

  this.editFormigueiro = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-edit.html',
      controller: 'FormigueiroModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        formigueiro: () => FormigueiroCollection.get(id)
      }
    });

    modalInstance.result.then((formigueiro) => {
      return FormigueiroCollection.update(id, formigueiro);
    })
      .then((formigueiros) => {
        // atualiza a lista
        this.formigueiros = formigueiros;
      })
      .catch(err => {
        if (err === 'cancel') {
          // ignorar o cancel de modal
          return;
        }
        console.error(err);
      });
  }

  this.removeFormigueiro = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-remove.html',
      controller: 'FormigueiroModalEditRemoveController',
      controllerAs: '$modal',
      resolve: {
        formigueiro: () => FormigueiroCollection.get(id)
      }
    });

    modalInstance.result.then((formigueiro) => {
      return FormigueiroCollection.remove(id);
    })
      .then((formigueiros) => {
        // atualiza a lista
        this.formigueiros = formigueiros;
      })
      .catch(err => {
        if (err === 'cancel') {
          // ignorar o cancel de modal
          return;
        }
        console.error(err);
      });
  }

  this.previewFormigueiro = (id) => {
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal-preview.html',
      controller: 'FormigueiroModalPreviewController',
      controllerAs: '$modal',
      resolve: {
        formigueiro: () => FormigueiroCollection.get(id)
      }
    });

    modalInstance.rendered.then(() => {
      // força o google a recarregar, pois o mapa dentro do modal ainda não existia
      // PS: eu tenho que fazer depois de renderizar pq o modal não ouve os eventos
      // nos scopes das diretivas durante a execução do controller do modal.
      $scope.$emit('googmapInit');
    })
  }
}])
app.controller('FormigueiroMapaController', ['FormigueiroCollection', '$scope', function (FormigueiroCollection, $scope) {
  this.loadingList = this.loadingMap = true;
  this.pontos = [];
  FormigueiroCollection.getAll()
    .then((formigueiros) => {
      this.pontos = formigueiros;
    })
    .finally(() => {
      this.loadingList = false;
    })

  $scope.$on('googmapLoaded', () => {
    this.loadingMap = false;
  })
}])
app.config(function (navsProvider) {
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
});