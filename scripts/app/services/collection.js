angular.module('app.services')
	.factory('Collection', ['$http', '$q', function ($http, $q) {
		/**
		 * Classe Collection
		 *
		 * Serve como base para coleções de registros de entidades da aplicação.
		 * É necessário uma URL como endpoint, e um construtor pelo qual
		 * todos os itens serão normalizados
		 */
		function Collection(endpointUrl, itemConstructor) {
			this.itemConstructor = itemConstructor;
			this.endpointUrl = endpointUrl;
		}

		/**
		 * Normaliza um item retornado do endpoint de plain object para
		 * uma instancia do itemConstructor pré-definido
		 *
		 * @param {Object} poItem - item puro como veio do endpoint
		 * @returns {this.itemConstructor}
		 * @private
		 */
		Collection.prototype._normalizeItem = function(poItem) {
			if (poItem instanceof this.itemConstructor) {
				return poItem;
			}
			return Object.assign(new this.itemConstructor(), poItem);
		}

		/**
		 * Valida uma instância de um item
		 *
		 * @param {this.itemConstructor} item
		 * @throws {Error} - Em caso de o item não ser uma instancia do itemConstructor ou os campos não forem válidos
		 * @private
		 */
		Collection.prototype._validateItem = function(item) {
			if (!(item instanceof this.itemConstructor)) {
				throw new Error(`Item deve ser do tipo ${this.itemConstructor.name}`)
			}

			if (typeof item.$validacao === 'function') {
				const errors = item.$validacao();
				if (Object.keys(errors).length > 0) {
					throw new Error(`Item inválido: ${Object.values(errors).join(', ')}`);
				}
			}
		}

		/**
		 * Retorna todos os itens de uma coleção
		 *
		 * @returns {Promise<this.itemConstructor[]>} - Um array com todos os itens
		 */
		Collection.prototype.getAll = function() {
			return $q((resolve, reject) => {
				$http.get(this.endpointUrl).then((response) => {
					if (!Array.isArray(response.data)) {
						reject(new Error('Itens não encontrados'));
						return;
					}

					resolve(response.data.map((poItem) => {
						return this._normalizeItem(poItem);
					}));
				}).catch(reject);
			})
		}

		/**
		 * Retorna um item específico de uma coleção
		 *
		 * @returns {Promise<this.itemConstructor>} - O item
		 */
		Collection.prototype.get = function(id) {
			return $q((resolve, reject) => {
				$http.get(this.endpointUrl, {
					params: {id}
				}).then((response) => {
					resolve(this._normalizeItem(response.data));
				}).catch(reject);
			})
		}

		/**
		 * Insere um item na coleção
		 *
		 * @param {this.itemConstructor} item - O item a ser inserido
		 * @returns {Promise<this.itemConstructor>} - O próprio item, em caso de sucesso
		 */
		Collection.prototype.insert = function(item) {
			return $q((resolve, reject) => {
				try {
					this._validateItem(item);
				} catch (err) {
					reject(err);
					return;
				}

				$http.post(this.endpointUrl, {
					data: item
				}).then((response) => {
					resolve(this._normalizeItem(response.data));
				}).catch(reject);
			})
		}

		/**
		 * Altera um item na coleção
		 *
		 * @param {Number} id - O id do item
		 * @param {this.itemConstructor} item - O item com novos dados para ser atualizado
		 * @returns {Promise<this.itemConstructor>} - O próprio item, em caso de sucesso
		 */
		Collection.prototype.update = function(id, item) {
			return $q((resolve, reject) => {
				try {
					this._validateItem(item);
				} catch (err) {
					reject(err);
					return;
				}

				$http.put(this.endpointUrl, {
					params: { id },
					data: item
				}).then((response) => {
					resolve(this._normalizeItem(response.data));
				}).catch(reject);
			})
		}

		/**
		 * Exclui um item na coleção
		 *
		 * @param {Number} id - O id do item
		 * @returns {Promise<boolean>} - TRUE, em caso de sucesso, FALSE em caso de falha
		 */
		Collection.prototype.remove = function(id) {
			return $q((resolve, reject) => {
				$http.delete(this.endpointUrl, {
					params: { id }
				}).then((response) => {
					resolve(response.status === 200);
				}).catch(reject);
			})
		}

		return Collection;
	}])
