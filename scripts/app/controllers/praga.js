angular.module('app.controllers')
	.controller('PragaController', ['PragaCollection', 'Praga', '$uibModal', '$scope', function (PragaCollection, Praga, $uibModal, $scope) {
		this.loadingList = true;
		this.loadingItems = {};
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
				this.loadingList = true;
				return PragaCollection.insert(praga);
			})
				.then((praga) => {
					// atualiza a lista
					this.pragas.push(praga);
				})
				.catch(err => {
					if (err === 'cancel') {
						// ignorar o cancel de modal
						return;
					}
					alert(err.message);
				})
				.finally(() => {
					this.loadingList = false;
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
				this.loadingItems[id] = true;
				return PragaCollection.update(id, praga);
			})
				.then((praga) => {
					// atualiza a lista
					let index = _.findIndex(this.pragas, (o) => o.$id === id);
					this.pragas.splice(index, 1, praga);
				})
				.catch(err => {
					if (err === 'cancel') {
						// ignorar o cancel de modal
						return;
					}
					alert(err.message);
				})
				.finally(() => {
					delete this.loadingItems[id];
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
					praga: id
				}
			});

			modalInstance.result.then(() => {
				this.loadingItems[id] = true;
				return PragaCollection.remove(id);
			})
				.then((praga) => {
					// atualiza a lista
					let index = _.findIndex(this.pragas, (o) => o.$id === id);
					this.pragas.splice(index, 1);
				})
				.catch(err => {
					if (err === 'cancel') {
						// ignorar o cancel de modal
						return;
					}
					alert(err.message);
				})
				.finally(() => {
					delete this.loadingItems[id];
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
				// força o google a recarregar, pois o mapa dentro do modal ainda não existia o serviço
				// PS: eu tenho que fazer depois de renderizar pq o modal não ouve os eventos
				// nos scopes das diretivas durante a execução do controller do modal.
				$scope.$emit('googmapInit');
			})
		}
	}])