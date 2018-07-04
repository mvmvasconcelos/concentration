window.onload = function() {
	var tamanhoTile = 80;
	var numLinhas = 4;
	var numColunas = 5;
	var espacamentoTiles = 10;
	var nomeArmazenamentoLocal = "memoria";
	var maiorPontuacao;
	var tilesArray = [];
	var selecionadosArray = [];
	var playSound;
	var game = new Phaser.Game(500, 500);
	var pontuacao;
	var tempoRestante;
	var tilesRestantes;
	var timer = null;
	var preloadAssets = function(game){}
	preloadAssets.prototype = {
		preload: function(){
			game.load.spritesheet("tiles", "assets/tiles.png", tamanhoTile, tamanhoTile);
			game.load.spritesheet("iconesSom", "assets/iconesSom.png", 80, 80);
			game.load.audio("seleciona", ["assets/seleciona.mp3", "assets/seleciona.ogg"]);
			game.load.audio("certo", ["assets/certo.mp3", "assets/certo.ogg"]);
			game.load.audio("errado", ["assets/errado.mp3", "assets/errado.ogg"]);
		},
		create: function(){
			game.state.start("TelaTitulo");
		}
	}
	var telaTitulo = function(game){};
	telaTitulo.prototype = {		
		create: function(){
			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVertically = true;
			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;			
			//Previne que o jogo pause ao tirar o foco da janela
			game.stage.disableVisibilityChange = true;
			var style = {
				font: "48px Monospace",
				fill: "#00ff00",
				align: "center"
			};
			var text = game.add.text(game.width / 2, game.height / 2 - 100, "Memória", style);
			text.anchor.set(0.5);
			var botaoSom = game.add.button(game.width / 2 - 100, game.height / 2 +100, "iconesSom", this.startGame, this);
			botaoSom.anchor.set(0.5);
			botaoSom.frame = 0;
			botaoSom = game.add.button(game.width / 2 + 100, game.height / 2 +100, "iconesSom", this.startGame, this);
			botaoSom.anchor.set(0.5);
			botaoSom.frame = 1;
		},
		startGame: function(target){
			if(target.frame == 0) {
				playSound = true;
			} else {
				playSound = false;
			}
			game.state.start("PlayGame");
		}
	}
	var playGame = function(game){};
	playGame.prototype = {
		textoPontuacao: null,
		textoTempo: null,
		somArray: [],
		create: function(){
			pontuacao = 0;
			tempoRestante = 60;
			this.colocarTiles();
			if (playSound) {
				this.somArray[0] = game.add.audio("seleciona", 1);
				this.somArray[1] = game.add.audio("certo", 1);
				this.somArray[2] = game.add.audio("errado", 1);
			}
			var style = {
				font: "25px Monospace",
				fill: "#00ff00",
				align: "center"
			}
			this.textoPontuacao = game.add.text(5, 5, "Pontuação: " + pontuacao, style);
			this.textoTempo = game.add.text(5, game.height - 5, "Tempo restante: " + tempoRestante + "s", style);
			this.textoTempo.anchor.set(0, 1);
			game.time.events.loop(Phaser.Timer.SECOND, this.diminuiTempo, this);
		},
		colocarTiles: function(){
			tilesRestantes = numLinhas * numColunas;
			var espacoEsquerdo = (game.width - (numColunas * tamanhoTile) - ((numColunas - 1) * espacamentoTiles)) / 2;
			var espacoAcima = (game.width - (numLinhas * tamanhoTile) - ((numLinhas - 1) * espacamentoTiles)) / 2;
			for (var i = 0; i < numColunas * numLinhas; i++){
				tilesArray.push(Math.floor(i / 2));
			}
			for (i = 0; i < numLinhas * numColunas; i++) {
				var de = game.rnd.between(0, tilesArray.length - 1);
				var ate = game.rnd.between(0, tilesArray.length - 1);
				var temp = tilesArray[de];
				tilesArray[de] = tilesArray[ate];
				tilesArray[ate] = temp;
			}
			for (i = 0; i < numColunas; i++) {
				for (var j = 0; j < numLinhas; j++) {
					var tile = game.add.button(espacoEsquerdo + i * (tamanhoTile + espacamentoTiles), espacoAcima + j * (tamanhoTile + espacamentoTiles), "tiles", this.mostraTile, this);
					tile.frame = 10;
					tile.value = tilesArray[j * numColunas + i];
				}
			}
		},
		mostraTile: function(target){
			/*	Se selecionadosArray for menor que dois, ou seja, não foram selecionados dois tiles ainda
				e se selecionadosArray.indexOf(target) for igual a -1, indexOf() retorna a posição de um
				elemento dentro de um array, se não houver aquele elemento no array, ele retorna -1
			*/
			if (selecionadosArray.length < 2 && selecionadosArray.indexOf(target) == -1) {
				if (playSound) {
					this.somArray[0].play();
				}
				target.frame = target.value;
				selecionadosArray.push(target);
			}
			// Se o tamanho de selecionadosArray for 2, ou seja, dois tiles foram selecionados
			if (selecionadosArray.length == 2 && timer == null) {
				timer = game.time.events.add(Phaser.Timer.SECOND, this.verificaTiles, this);
				console.log(timer);
			}
		},
		diminuiTempo: function(){
			tempoRestante--;
			this.textoTempo.text = "Tempo restante: " + tempoRestante + "s";
			if (tempoRestante == 0) {
				game.state.start("GameOver");
			}
		},
		verificaTiles: function(){
			//console.log("SELECIONA?: " + typeof selecionadosArray);
			if (typeof selecionadosArray !== "undefined") {

				if (selecionadosArray[0].value == selecionadosArray[1].value) {
					if (playSound) {
						this.somArray[1].play();
					}
					pontuacao++;
					tempoRestante += 2;
					this.textoTempo.text = "Tempo restante: " + tempoRestante + "s";
					this.textoPontuacao.text = "Pontuação: " + pontuacao;
					selecionadosArray[0].destroy();
					selecionadosArray[1].destroy();
					tilesRestantes -= 2;
					if (tilesRestantes == 0) {
						tilesArray.length = 0;
						selecionadosArray.length = 0;
						this.colocarTiles();
					}
					
				} else {
					if (playSound) {
						this.somArray[2].play();
					}
					selecionadosArray[0].frame = 10;
					selecionadosArray[1].frame = 10;
				}
			}
			timer = null;
			selecionadosArray.length = 0;
		}
	}
	var gameOver = function(game){}
	gameOver.prototype = {
		create: function(){
			maiorPontuacao = Math.max(pontuacao, maiorPontuacao);
			localStorage.setItem(nomeArmazenamentoLocal, maiorPontuacao);
			var style = {
				font: "25px Monospace",
				fill: "#00ff00",
				align: "center"
			}
			var texto = game.add.text(game.width / 2, game.height / 2, "Fim de Jogo \n \n Sua pontuação: " + pontuacao + "\n\nMelhor pontuação: " + maiorPontuacao + "\n\nToque para recomeçar", style);
			texto.anchor.set(0.5);
			game.input.onDown.add(this.restartGame, this);
		},
		restartGame: function(){
			tilesArray.length = 0;
			selecionadosArray.length = 0;
			game.state.start("TelaTitulo");
		}
	}
	game.state.add("PreloadAssets", preloadAssets);
	game.state.add("TelaTitulo", telaTitulo);
	game.state.add("PlayGame", playGame);
	game.state.add("GameOver", gameOver);
	maiorPontuacao = localStorage.getItem(nomeArmazenamentoLocal) == null ? 0 : localStorage.getItem(nomeArmazenamentoLocal);
	game.state.start("PreloadAssets");

}