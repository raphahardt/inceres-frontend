angular.module('app.controllers')
	.controller('FormigueiroController', ['FormigueiroCollection', 'Formigueiro', '$uibModal', '$scope', function (FormigueiroCollection, Formigueiro, $uibModal, $scope) {
		this.loadingList = true;
		this.loadingItems = {};
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
				this.loadingList = true;
				return FormigueiroCollection.insert(formigueiro);
			})
				.then((formigueiro) => {
					// atualiza a lista
					this.formigueiros.push(formigueiro);
				})
				.catch(err => {
					if (err instanceof Error) {
						alert(err.message);
					}
				})
				.finally(() => {
					this.loadingList = false;
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
				this.loadingItems[id] = true;
				return FormigueiroCollection.update(id, formigueiro);
			})
				.then((formigueiro) => {
					// atualiza a lista
					let index = _.findIndex(this.formigueiros, (o) => o.$id === id);
					this.formigueiros.splice(index, 1, formigueiro);
				})
				.catch(err => {
					if (err instanceof Error) {
						alert(err.message);
					}
				})
				.finally(() => {
					delete this.loadingItems[id];
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
					formigueiro: id
				}
			});

			modalInstance.result.then(() => {
				this.loadingItems[id] = true;
				return FormigueiroCollection.remove(id);
			})
				.then((formigueiro) => {
					// atualiza a lista
					let index = _.findIndex(this.formigueiros, (o) => o.$id === id);
					this.formigueiros.splice(index, 1);
				})
				.catch(err => {
					if (err instanceof Error) {
						alert(err.message);
					}
				})
				.finally(() => {
					delete this.loadingItems[id];
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
				// força o google a recarregar, pois o mapa dentro do modal ainda não existia o serviço
				// PS: eu tenho que fazer depois de renderizar pq o modal não ouve os eventos
				// nos scopes das diretivas durante a execução do controller do modal.
				$scope.$emit('googmapInit');
			})
		}
	}])