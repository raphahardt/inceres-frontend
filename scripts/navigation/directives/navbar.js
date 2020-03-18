angular.module('app.navigation')
	/**
	 * Componente <navbar>
	 *
	 * Cria um navbar fixo no topo da página.
	 * Usa <nav-menu type="top"> pra mostrar a navegação em celulares e dispositivos menores e
	 * usa <collapse-button> pra abrir/fechar essa navegação
	 */
	.component('navbar', {
		template: `
			<nav class="navbar navbar-inverse navbar-fixed-top">
		    <div class="container-fluid">
		      <div class="navbar-header">
		        <collapse-button></collapse-button>
		        <a class="navbar-brand" ui-sref="home">Field Notebook</a>
		      </div>
		      <div id="navbar" class="navbar-collapse collapse" uib-collapse="$ctrl.topCollapsed" aria-expanded="false" style="height: 1px;">
		        <nav-menu type="top"></nav-menu>
		      </div>
		    </div>
		  </nav>`,
		controller: [function () {
			/**
			 * Indica se a navegação mobile está fechado ou não
			 * @type {boolean} - TRUE para fechado, FALSE para aberto
			 */
			this.topCollapsed = true;

			/**
			 * Abre ou fecha a navegação mobile
			 */
			this.toggle = () => {
				this.topCollapsed = !this.topCollapsed;
			}

			/**
			 * Fecha a navegação mobile
			 */
			this.hide = () => {
				this.topCollapsed = true;
			}
		}]
	})