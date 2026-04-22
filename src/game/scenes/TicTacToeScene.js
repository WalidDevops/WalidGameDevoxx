import * as Phaser from "phaser";
import { Scene } from "phaser";
import {
  GameState,
  EDUCATIONAL_QUESTIONS,
  GOODIES_DATA,
} from "../../services/GameState.js";

/**
 * Mini-jeu Tic-Tac-Toe (XO) - Yazan Escape Adventure
 * Le joueur affronte une IA simple pour débloquer un indice
 */
export class TicTacToeScene extends Scene {
  constructor() {
    super("TicTacToeScene");
    this.board = Array(9).fill(null);
    this.playerSymbol = "X";
    this.aiSymbol = "O";
    this.currentTurn = "player";
    this.gameOver = false;
    this.cells = [];
    this.score = { player: 0, ai: 0 };
    this.roundsToWin = 2;
  }

  create() {
    // Réinitialiser
    this.board = Array(9).fill(null);
    this.gameOver = false;
    this.currentTurn = "player";

    // Fond
    this.createBackground();

    // Interface
    this.createUI();

    // Grille de jeu
    this.createGrid();

    // Étoile magique de bypass
    this.createMagicStar();

    // Animation d'entrée
    this.cameras.main.fadeIn(300);
  }

  createBackground() {
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg").setAlpha(0.7);
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Décoration dojo
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513, 0.3);
    graphics.fillRect(0, 650, 1024, 118);

    // Lanternes décoratives
    this.createLantern(100, 150);
    this.createLantern(924, 150);
  }

  createLantern(x, y) {
    const lantern = this.add.container(x, y);

    const body = this.add.graphics();
    body.fillStyle(0xff6b35);
    body.fillRoundedRect(-20, -30, 40, 60, 10);
    body.fillStyle(0xf7c531, 0.5);
    body.fillRoundedRect(-15, -25, 30, 50, 8);

    lantern.add(body);

    // Animation de balancement
    this.tweens.add({
      targets: lantern,
      angle: { from: -5, to: 5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createUI() {
    // Titre
    this.add
      .text(512, 50, "⭕ DOJO DU MORPION ❌", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // Instruction
    this.statusText = this.add
      .text(512, 100, "C'est ton tour! Place ton X", {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Score
    this.scoreText = this.add
      .text(512, 620, `Toi: ${this.score.player} - IA: ${this.score.ai}`, {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Bouton retour
    this.createButton(100, 50, "← Retour", 0xe74c3c, () => {
      this.scene.start("WorldMap");
    });

    // Indicateur de tour
    this.turnIndicator = this.add.container(512, 150);
    const turnBg = this.add.graphics();
    turnBg.fillStyle(0x000000, 0.5);
    turnBg.fillRoundedRect(-100, -20, 200, 40, 10);

    this.turnText = this.add
      .text(0, 0, "🎮 Ton tour!", {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#2ecc71",
      })
      .setOrigin(0.5);

    this.turnIndicator.add([turnBg, this.turnText]);
  }

  createGrid() {
    const centerX = 512;
    const centerY = 380;
    const cellSize = 100;
    const gridSize = cellSize * 3; // 300px total
    const lineWidth = 6;

    // Position de départ (coin supérieur gauche de la grille)
    const gridLeft = centerX - gridSize / 2;
    const gridTop = centerY - gridSize / 2;

    // Dessiner la grille
    const grid = this.add.graphics();
    grid.lineStyle(lineWidth, 0xffffff, 0.8);

    // Lignes verticales (2 lignes séparant 3 colonnes)
    grid.lineBetween(
      gridLeft + cellSize,
      gridTop,
      gridLeft + cellSize,
      gridTop + gridSize,
    );
    grid.lineBetween(
      gridLeft + cellSize * 2,
      gridTop,
      gridLeft + cellSize * 2,
      gridTop + gridSize,
    );

    // Lignes horizontales (2 lignes séparant 3 rangées)
    grid.lineBetween(
      gridLeft,
      gridTop + cellSize,
      gridLeft + gridSize,
      gridTop + cellSize,
    );
    grid.lineBetween(
      gridLeft,
      gridTop + cellSize * 2,
      gridLeft + gridSize,
      gridTop + cellSize * 2,
    );

    // Créer les cellules interactives (9 cases)
    this.cells = [];
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      // Centre de chaque cellule
      const x = gridLeft + col * cellSize + cellSize / 2;
      const y = gridTop + row * cellSize + cellSize / 2;

      const cell = this.createCell(x, y, i);
      this.cells.push(cell);
    }
  }

  createMagicStar() {
    // Étoile magique de bypass en bas à droite
    const starContainer = this.add.container(950, 700);

    // Effet de brillance autour de l'étoile
    const glow = this.add.circle(0, 0, 35, 0xf7c531, 0.3);

    // Étoile principale
    const star = this.add
      .text(0, 0, "✨", {
        fontSize: 40,
      })
      .setOrigin(0.5);

    // Petite étoile secondaire
    const starSmall = this.add
      .text(15, -15, "⭐", {
        fontSize: 16,
      })
      .setOrigin(0.5);

    starContainer.add([glow, star, starSmall]);

    // Animation de brillance continue
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.6 },
      scale: { from: 1, to: 1.4 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Animation de rotation de l'étoile
    this.tweens.add({
      targets: star,
      angle: { from: -10, to: 10 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Animation de scintillement de la petite étoile
    this.tweens.add({
      targets: starSmall,
      alpha: { from: 0.3, to: 1 },
      scale: { from: 0.8, to: 1.2 },
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    // Zone interactive
    const hitArea = this.add.circle(0, 0, 35, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    starContainer.add(hitArea);

    // Tooltip au survol
    const tooltip = this.add
      .text(0, -50, "🪄 Magie!", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#f7c531",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setAlpha(0);
    starContainer.add(tooltip);

    hitArea.on("pointerover", () => {
      this.tweens.add({
        targets: starContainer,
        scale: 1.2,
        duration: 150,
      });
      this.tweens.add({
        targets: tooltip,
        alpha: 1,
        duration: 200,
      });
    });

    hitArea.on("pointerout", () => {
      this.tweens.add({
        targets: starContainer,
        scale: 1,
        duration: 150,
      });
      this.tweens.add({
        targets: tooltip,
        alpha: 0,
        duration: 200,
      });
    });

    hitArea.on("pointerdown", () => {
      this.activateMagicBypass();
    });
  }

  activateMagicBypass() {
    if (this.gameOver) return;

    this.gameOver = true;

    // Effet magique spectaculaire
    this.cameras.main.flash(500, 247, 197, 49);

    // Particules magiques
    for (let i = 0; i < 30; i++) {
      const particle = this.add
        .text(
          512 + Phaser.Math.Between(-200, 200),
          384 + Phaser.Math.Between(-200, 200),
          ["✨", "⭐", "🌟", "💫"][Phaser.Math.Between(0, 3)],
          { fontSize: Phaser.Math.Between(20, 40) },
        )
        .setOrigin(0.5);

      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        scale: 0,
        duration: 1000,
        delay: i * 30,
        onComplete: () => particle.destroy(),
      });
    }

    // Message magique
    const magicText = this.add
      .text(512, 384, "🪄 MAGIE! 🪄", {
        fontFamily: "Arial Black",
        fontSize: 60,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: magicText,
      scale: 1,
      duration: 500,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: magicText,
          alpha: 0,
          y: magicText.y - 50,
          duration: 1000,
          delay: 1000,
        });
      },
    });

    // Gagner automatiquement après l'animation
    this.time.delayedCall(2000, () => {
      this.score.player = this.roundsToWin;
      this.showVictory();
    });
  }

  createCell(x, y, index) {
    const container = this.add.container(x, y);

    // Zone cliquable
    const hitArea = this.add.rectangle(0, 0, 90, 90, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Symbole (initialement vide)
    const symbol = this.add
      .text(0, 0, "", {
        fontFamily: "Arial Black",
        fontSize: 60,
        color: "#ff6b35",
      })
      .setOrigin(0.5);

    container.add([hitArea, symbol]);
    container.setData("index", index);
    container.setData("symbol", symbol);

    // Interaction
    hitArea.on("pointerover", () => {
      if (
        !this.board[index] &&
        !this.gameOver &&
        this.currentTurn === "player"
      ) {
        hitArea.setFillStyle(0xffffff, 0.2);
      }
    });

    hitArea.on("pointerout", () => {
      hitArea.setFillStyle(0xffffff, 0);
    });

    hitArea.on("pointerdown", () => {
      this.playerMove(index);
    });

    return container;
  }

  playerMove(index) {
    if (this.board[index] || this.gameOver || this.currentTurn !== "player") {
      return;
    }

    // Placer le symbole du joueur
    this.placeSymbol(index, this.playerSymbol);

    // Vérifier la victoire
    if (this.checkWin(this.playerSymbol)) {
      this.endRound("player");
      return;
    }

    // Vérifier le match nul
    if (this.checkDraw()) {
      this.endRound("draw");
      return;
    }

    // Tour de l'IA
    this.currentTurn = "ai";
    this.turnText.setText("🤖 IA réfléchit...");
    this.turnText.setColor("#f39c12");

    this.time.delayedCall(800, () => {
      this.aiMove();
    });
  }

  aiMove() {
    if (this.gameOver) return;

    // IA simple avec stratégie basique
    let move = this.findBestMove();

    this.placeSymbol(move, this.aiSymbol);

    // Vérifier la victoire de l'IA
    if (this.checkWin(this.aiSymbol)) {
      this.endRound("ai");
      return;
    }

    // Vérifier le match nul
    if (this.checkDraw()) {
      this.endRound("draw");
      return;
    }

    // Tour du joueur
    this.currentTurn = "player";
    this.turnText.setText("🎮 Ton tour!");
    this.turnText.setColor("#2ecc71");
  }

  findBestMove() {
    // 1. Essayer de gagner
    let move = this.findWinningMove(this.aiSymbol);
    if (move !== -1) return move;

    // 2. Bloquer le joueur
    move = this.findWinningMove(this.playerSymbol);
    if (move !== -1) return move;

    // 3. Prendre le centre
    if (!this.board[4]) return 4;

    // 4. Prendre un coin
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter((i) => !this.board[i]);
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }

    // 5. Prendre n'importe quelle case libre
    const emptyCells = this.board
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  findWinningMove(symbol) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Lignes
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Colonnes
      [0, 4, 8],
      [2, 4, 6], // Diagonales
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cells = [this.board[a], this.board[b], this.board[c]];
      const symbolCount = cells.filter((cell) => cell === symbol).length;
      const emptyCount = cells.filter((cell) => cell === null).length;

      if (symbolCount === 2 && emptyCount === 1) {
        // Trouver la case vide
        if (!this.board[a]) return a;
        if (!this.board[b]) return b;
        if (!this.board[c]) return c;
      }
    }

    return -1;
  }

  placeSymbol(index, symbol) {
    this.board[index] = symbol;

    const cell = this.cells[index];
    const symbolText = cell.getData("symbol");

    symbolText.setText(symbol);
    symbolText.setColor(symbol === "X" ? "#ff6b35" : "#3498db");

    // Animation d'apparition
    symbolText.setScale(0);
    this.tweens.add({
      targets: symbolText,
      scale: 1,
      duration: 200,
      ease: "Back.easeOut",
    });

    // Son (simulé par flash visuel)
    this.cameras.main.flash(50, 255, 255, 255, false, null, this);
  }

  checkWin(symbol) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
      if (pattern.every((i) => this.board[i] === symbol)) {
        this.highlightWinningCells(pattern);
        return true;
      }
    }
    return false;
  }

  highlightWinningCells(pattern) {
    pattern.forEach((index) => {
      const cell = this.cells[index];
      const symbol = cell.getData("symbol");

      this.tweens.add({
        targets: symbol,
        scale: { from: 1, to: 1.3 },
        duration: 300,
        yoyo: true,
        repeat: 2,
      });
    });
  }

  checkDraw() {
    return this.board.every((cell) => cell !== null);
  }

  endRound(result) {
    this.gameOver = true;

    let message = "";
    let color = "#ffffff";

    if (result === "player") {
      this.score.player++;
      message = "🎉 Tu as gagné cette manche!";
      color = "#2ecc71";
    } else if (result === "ai") {
      this.score.ai++;
      message = "🤖 L'IA a gagné cette manche!";
      color = "#e74c3c";
    } else {
      message = "🤝 Match nul!";
      color = "#f39c12";
    }

    this.statusText.setText(message);
    this.statusText.setColor(color);
    this.scoreText.setText(`Toi: ${this.score.player} - IA: ${this.score.ai}`);

    // Vérifier si le jeu est terminé
    if (this.score.player >= this.roundsToWin) {
      this.time.delayedCall(1500, () => this.showVictory());
    } else if (this.score.ai >= this.roundsToWin) {
      this.time.delayedCall(1500, () => this.showDefeat());
    } else {
      // Prochaine manche
      this.time.delayedCall(2000, () => this.nextRound());
    }
  }

  nextRound() {
    this.board = Array(9).fill(null);
    this.gameOver = false;
    this.currentTurn = "player";

    // Effacer les symboles
    this.cells.forEach((cell) => {
      const symbol = cell.getData("symbol");
      symbol.setText("");
    });

    this.statusText.setText("Nouvelle manche! Place ton X");
    this.statusText.setColor("#ffffff");
    this.turnText.setText("🎮 Ton tour!");
    this.turnText.setColor("#2ecc71");
  }

  showVictory() {
    // Calculer les étoiles (basé sur la différence de score)
    const diff = this.score.player - this.score.ai;
    const stars = diff >= 2 ? 3 : diff >= 1 ? 2 : 1;

    // Sauvegarder la progression
    GameState.completeLevel("tictactoe", stars);

    // Collecter un goodie aléatoire
    const goodies = GOODIES_DATA.filter((g) => g.level === "tictactoe");
    const randomGoodie = goodies[Math.floor(Math.random() * goodies.length)];
    if (randomGoodie && !GameState.hasGoodie(randomGoodie.id)) {
      GameState.collectGoodie(randomGoodie.id);
    }

    // Afficher l'écran de victoire
    this.showEndScreen(true, stars, randomGoodie);
  }

  showDefeat() {
    this.showEndScreen(false, 0, null);
  }

  showEndScreen(victory, stars, goodie) {
    // Overlay
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    const popup = this.add.container(512, 384);

    // Fond du popup
    const bg = this.add.graphics();
    bg.fillStyle(victory ? 0x2c3e50 : 0x7f0000);
    bg.fillRoundedRect(-250, -200, 500, 400, 25);
    bg.lineStyle(4, victory ? 0xf7c531 : 0xe74c3c);
    bg.strokeRoundedRect(-250, -200, 500, 400, 25);

    // Titre
    const title = this.add
      .text(0, -150, victory ? "🎉 VICTOIRE!" : "💪 CONTINUE!", {
        fontFamily: "Arial Black",
        fontSize: 42,
        color: victory ? "#f7c531" : "#ffffff",
      })
      .setOrigin(0.5);

    popup.add([bg, title]);

    // Étoiles
    if (victory) {
      const starsText = this.add
        .text(0, -80, "⭐".repeat(stars) + "☆".repeat(3 - stars), {
          fontSize: 48,
        })
        .setOrigin(0.5);
      popup.add(starsText);
    }

    // Goodie collecté
    if (goodie) {
      const goodieContainer = this.add.container(0, 0);

      const goodieBg = this.add.graphics();
      goodieBg.fillStyle(0x9b59b6, 0.5);
      goodieBg.fillRoundedRect(-180, -40, 360, 80, 15);

      const goodieIcon = this.add
        .text(-150, 0, goodie.icon, {
          fontSize: 40,
        })
        .setOrigin(0.5);

      const goodieName = this.add
        .text(20, -10, "Nouveau Goodie!", {
          fontFamily: "Arial Bold",
          fontSize: 16,
          color: "#f7c531",
        })
        .setOrigin(0.5);

      const goodieNameText = this.add
        .text(20, 15, goodie.name, {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#ffffff",
        })
        .setOrigin(0.5);

      goodieContainer.add([goodieBg, goodieIcon, goodieName, goodieNameText]);
      popup.add(goodieContainer);

      // Animation du goodie
      this.tweens.add({
        targets: goodieContainer,
        scale: { from: 0, to: 1 },
        duration: 500,
        delay: 500,
        ease: "Back.easeOut",
      });
    }

    // Message
    const message = this.add
      .text(
        0,
        80,
        victory
          ? "Tu as prouvé ta valeur au Dojo!\nLe prochain niveau t'attend..."
          : "Ne te décourage pas!\nRéessaie pour progresser.",
        {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);
    popup.add(message);

    // Boutons
    const continueBtn = this.createButton(
      0,
      160,
      victory ? "➡️ Continuer" : "🔄 Réessayer",
      victory ? 0x2ecc71 : 0x3498db,
      () => {
        if (victory) {
          this.score = { player: 0, ai: 0 };
          this.scene.start("WorldMap");
        } else {
          this.score = { player: 0, ai: 0 };
          this.scene.restart();
        }
      },
    );
    popup.add(continueBtn);

    // Animation d'entrée
    popup.setScale(0);
    this.tweens.add({
      targets: popup,
      scale: 1,
      duration: 400,
      ease: "Back.easeOut",
    });
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color);
    bg.fillRoundedRect(-80, -22, 160, 44, 10);

    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Arial Black",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(160, 44);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });
    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on("pointerdown", callback);

    return container;
  }
}
