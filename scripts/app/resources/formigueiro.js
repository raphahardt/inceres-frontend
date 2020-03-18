angular.module('app.resources')
	.factory('Formigueiro', [function () {
		return class Formigueiro {
			constructor() {
				this.$id = undefined;
				this.datahora = undefined;
				this.coordenada = undefined;
				this.quantidade = undefined;
				this.observacoes = undefined;
			}

			$validacao() {
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

				return errors;
			}
		}
	}])