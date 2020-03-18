///////////////////////////////////////////////////
// NÃO USADO.
// Só fiz para mostrar outra forma de se fazer
///////////////////////////////////////////////////
angular.module('app.services')
	.factory('Collection', ['$http', function ($http) {
		/**
		 * Classe Collection
		 *
		 * Serve como base para coleções de registros de entidades da aplicação.
		 * É necessário uma URL como endpoint, e um construtor pelo qual
		 * todos os itens serão normalizados
		 */
		return class Collection {
			constructor(endpointUrl, itemConstructor) {
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
			_normalizeItem(poItem) {
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
			_validateItem(item) {
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
			async getAll() {
				const response = await $http.get(this.endpointUrl);

				if (!Array.isArray(response.data)) {
					throw new Error('Itens não encontrados');
				}

				return response.data.map((poItem) => {
					return this._normalizeItem(poItem);
				})
			}

			/**
			 * Retorna um item específico de uma coleção
			 *
			 * @returns {Promise<this.itemConstructor>} - O item
			 */
			async get(id) {
				const response = await $http.get(this.endpointUrl, {
					params: {id}
				})

				return this._normalizeItem(response.data)
			}

			/**
			 * Insere um item na coleção
			 *
			 * @param {this.itemConstructor} item - O item a ser inserido
			 * @returns {Promise<this.itemConstructor>} - O próprio item, em caso de sucesso
			 */
			async insert(item) {
				this._validateItem(item);

				const response = await $http.post(this.endpointUrl, {
					data: item
				})

				return this._normalizeItem(response.data)
			}

			/**
			 * Altera um item na coleção
			 *
			 * @param {Number} id - O id do item
			 * @param {this.itemConstructor} item - O item com novos dados para ser atualizado
			 * @returns {Promise<this.itemConstructor>} - O próprio item, em caso de sucesso
			 */
			async update(id, item) {
				this._validateItem(item);

				const response = await $http.put(this.endpointUrl, {
					params: { id },
					data: item
				})

				return this._normalizeItem(response.data);
			}

			/**
			 * Exclui um item na coleção
			 *
			 * @param {Number} id - O id do item
			 * @returns {Promise<boolean>} - TRUE, em caso de sucesso, FALSE em caso de falha
			 */
			async remove(id) {
				const response = await $http.delete(this.endpointUrl, {
					params: { id }
				})

				return response.status === 200;
			}

		};
	}])
