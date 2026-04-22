import * as Phaser from "phaser";
import { Scene } from "phaser";
import { GameState } from "../../services/GameState.js";

/**
 * Babyfoot - Yazan Escape Adventure
 * Match de babyfoot contre l'IA - premier à 5 buts gagne!
 */
export class BabyfootScene extends Scene {
  constructor() {
    super("BabyfootScene");
    this.ball = null;
    this.playerScore = 0;
    this.aiScore = 0;
    this.maxScore = 5;
    this.ballVelocity = { x: 0, y: 0 };
    this.gameStarted = false;
    this.playerRods = [];
    this.aiRods = [];
  }

  create() {
    const { width, height } = this.scale;

    // Reset
    this.playerScore = 0;
    this.aiScore = 0;
    this.gameStarted = false;

    // Fond table de babyfoot
    this.createTable();

    // Créer les barres et joueurs
    this.createRods();

    // Créer la balle
    this.createBall();

    // UI
    this.createUI();

    // Bouton retour
    this.createBackButton();

    // Étoile magique
    this.createMagicStar();

    // Instructions
    this.showInstructions();

    // Input
    this.setupInput();

    this.cameras.main.fadeIn(500);
  }

  createTable() {
    const { width, height } = this.scale;

    // Fond vert de la table
    this.add.rectangle(width / 2, height / 2, 900, 600, 0x1e8449);

    // Bordures
    const border = this.add.graphics();
    border.lineStyle(15, 0x5d4e37);
    border.strokeRect(62, 84, 900, 600);

    // Lignes du terrain
    const lines = this.add.graphics();
    lines.lineStyle(3, 0xffffff, 0.5);

    // Ligne centrale
    lines.moveTo(512, 84);
    lines.lineTo(512, 684);
    lines.strokePath();

    // Cercle central
    lines.strokeCircle(512, 384, 60);

    // Zones de but
    lines.strokeRect(62, 284, 80, 200);
    lines.strokeRect(882, 284, 80, 200);

    // Buts (zones où la balle peut entrer)
    this.playerGoal = this.add.rectangle(72, 384, 20, 150, 0x000000, 0);
    this.aiGoal = this.add.rectangle(952, 384, 20, 150, 0x000000, 0);

    // Filets visuels
    const netGraphics = this.add.graphics();
    netGraphics.fillStyle(0x1a1a1a, 0.8);
    netGraphics.fillRect(52, 309, 15, 150);
    netGraphics.fillRect(957, 309, 15, 150);
  }

  createRods() {
    // Positions des barres (x)
    const playerRodPositions = [150, 300, 500]; // Gardien, Défense, Milieu
    const aiRodPositions = [874, 724, 524]; // Gardien, Défense, Milieu (miroir)

    // Nombre de joueurs par barre
    const playersPerRod = [1, 2, 3]; // Gardien=1, Défense=2, Milieu=3

    this.playerRods = [];
    this.aiRods = [];

    // Barres du joueur (bleu)
    playerRodPositions.forEach((x, index) => {
      const rod = this.createRod(x, playersPerRod[index], 0x3498db, true);
      this.playerRods.push(rod);
    });

    // Barres de l'IA (rouge)
    aiRodPositions.forEach((x, index) => {
      const rod = this.createRod(x, playersPerRod[index], 0xe74c3c, false);
      this.aiRods.push(rod);
    });
  }

  createRod(x, playerCount, color, isPlayer) {
    const rod = this.add.container(x, 384);

    // La barre elle-même
    const bar = this.add.rectangle(0, 0, 12, 520, 0x7f8c8d);
    bar.setStrokeStyle(2, 0x5d5d5d);
    rod.add(bar);

    // Les joueurs sur la barre
    const spacing = 450 / (playerCount + 1);
    const players = [];

    for (let i = 0; i < playerCount; i++) {
      const yOffset = -225 + spacing * (i + 1);
      const player = this.createPlayer(0, yOffset, color);
      rod.add(player);
      players.push({ y: yOffset, element: player });
    }

    rod.players = players;
    rod.isPlayer = isPlayer;
    rod.baseY = 384;

    return rod;
  }

  createPlayer(x, y, color) {
    const player = this.add.container(x, y);

    // Corps
    const body = this.add.rectangle(0, 0, 30, 50, color);
    body.setStrokeStyle(2, 0xffffff);

    // Tête
    const head = this.add.circle(0, -30, 12, 0xf5cba7);
    head.setStrokeStyle(2, color);

    // Pieds
    const leftFoot = this.add.rectangle(-8, 30, 12, 10, 0x1a1a1a);
    const rightFoot = this.add.rectangle(8, 30, 12, 10, 0x1a1a1a);

    player.add([body, head, leftFoot, rightFoot]);

    return player;
  }

  createBall() {
    this.ball = this.add.container(512, 384);

    const ballGraphic = this.add.circle(0, 0, 12, 0xffffff);
    ballGraphic.setStrokeStyle(2, 0xcccccc);

    // Motif de la balle
    const pattern = this.add.graphics();
    pattern.lineStyle(1, 0x333333, 0.5);
    pattern.strokeCircle(0, 0, 8);
    pattern.moveTo(-8, 0);
    pattern.lineTo(8, 0);
    pattern.moveTo(0, -8);
    pattern.lineTo(0, 8);
    pattern.strokePath();

    this.ball.add([ballGraphic, pattern]);
    this.ball.setDepth(10);

    this.ballVelocity = { x: 0, y: 0 };
  }

  createUI() {
    const { width } = this.scale;

    // Titre
    this.add
      .text(width / 2, 40, "⚽ BABYFOOT", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#ffffff",
        stroke: "#5d4e37",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Score
    this.scoreText = this.add
      .text(width / 2, 750, "0 - 0", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Labels des équipes
    this.add
      .text(width / 2 - 80, 750, "🔵", {
        fontSize: 30,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2 + 80, 750, "🔴", {
        fontSize: 30,
      })
      .setOrigin(0.5);

    // Indicateur premier à 5
    this.add
      .text(width / 2, 720, "Premier à 5 buts!", {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    // Indicateur contrôles
    this.add
      .text(width / 2, 80, "Z/X: Gardien+Défense  |  ⬆️/⬇️: Attaque", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  setupInput() {
    // Contrôle au clavier
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.moveSpeed = 400; // Vitesse de déplacement
  }

  updatePlayerInput() {
    if (!this.gameStarted) return;

    // Z/X pour gardien (indice 0) et défense (indice 1)
    if (this.keyZ.isDown) {
      for (let i = 0; i < 2; i++) {
        this.playerRods[i].y -= this.moveSpeed * 0.016;
        this.playerRods[i].y = Phaser.Math.Clamp(
          this.playerRods[i].y,
          200,
          568,
        );
      }
    } else if (this.keyX.isDown) {
      for (let i = 0; i < 2; i++) {
        this.playerRods[i].y += this.moveSpeed * 0.016;
        this.playerRods[i].y = Phaser.Math.Clamp(
          this.playerRods[i].y,
          200,
          568,
        );
      }
    }

    // Flèches haut/bas pour l'attaque (milieu) - indice 2
    if (this.cursors.up.isDown) {
      this.playerRods[2].y -= this.moveSpeed * 0.016;
      this.playerRods[2].y = Phaser.Math.Clamp(this.playerRods[2].y, 200, 568);
    } else if (this.cursors.down.isDown) {
      this.playerRods[2].y += this.moveSpeed * 0.016;
      this.playerRods[2].y = Phaser.Math.Clamp(this.playerRods[2].y, 200, 568);
    }

    // Tir automatique quand la balle touche un joueur
    this.playerRods.forEach((rod) => {
      if (Math.abs(this.ball.x - rod.x) < 30) {
        rod.players.forEach((player) => {
          const playerWorldY = rod.y + player.y;
          const distance = Math.abs(this.ball.y - playerWorldY);

          if (distance < 35 && !rod.justKicked) {
            this.kickBall(rod, 1);
            rod.justKicked = true;

            // Animation de rotation
            this.tweens.add({
              targets: player.element,
              angle: { from: 0, to: 360 },
              duration: 200,
            });

            // Reset après un délai
            this.time.delayedCall(300, () => {
              rod.justKicked = false;
            });
          }
        });
      }
    });
  }

  kickBall(rod, direction) {
    // Vérifier collision avec un joueur de la barre
    const rodWorldY = rod.y;

    rod.players.forEach((player) => {
      const playerWorldY = rodWorldY + player.y;
      const distance = Math.abs(this.ball.y - playerWorldY);

      if (distance < 40) {
        // Kick!
        const kickPower = Phaser.Math.Between(400, 600);
        const angleVariation = Phaser.Math.FloatBetween(-0.3, 0.3);

        this.ballVelocity.x = kickPower * direction;
        this.ballVelocity.y = kickPower * angleVariation;

        this.showKickEffect();
      }
    });
  }

  showKickEffect() {
    const effect = this.add.circle(this.ball.x, this.ball.y, 20, 0xffffff, 0.5);
    this.tweens.add({
      targets: effect,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => effect.destroy(),
    });
  }

  showInstructions() {
    const instructions = this.add.container(512, 384);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-220, -130, 440, 260, 15);

    const text = this.add
      .text(
        0,
        0,
        "⚽ Comment jouer:\n\n" +
          "Z : monter Gardien + Défense\n" +
          "X : descendre Gardien + Défense\n\n" +
          "⬆️ : monter Attaque\n" +
          "⬇️ : descendre Attaque\n\n" +
          "Le tir est automatique!\n\n" +
          "Appuie sur une touche pour commencer",
        {
          fontFamily: "Arial",
          fontSize: 18,
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);

    instructions.add([bg, text]);
    instructions.setDepth(50);

    // Démarrer avec clic ou touche clavier
    const startGame = () => {
      this.tweens.add({
        targets: instructions,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          instructions.destroy();
          this.startGame();
        },
      });
    };

    this.input.once("pointerdown", startGame);
    this.input.keyboard.once("keydown", startGame);
  }

  startGame() {
    this.gameStarted = true;
    this.launchBall();

    // Démarrer la boucle de jeu
    this.time.addEvent({
      delay: 16,
      callback: this.updateGame,
      callbackScope: this,
      loop: true,
    });
  }

  launchBall() {
    // Remettre la balle au centre
    this.ball.x = 512;
    this.ball.y = 384;

    // Lancer dans une direction aléatoire
    const direction = Phaser.Math.Between(0, 1) ? 1 : -1;
    this.ballVelocity = {
      x: direction * Phaser.Math.Between(200, 350),
      y: Phaser.Math.Between(-150, 150),
    };
  }

  updateGame() {
    if (!this.gameStarted) return;

    // Contrôle clavier du joueur
    this.updatePlayerInput();

    const dt = 0.016;

    // Mouvement de la balle
    this.ball.x += this.ballVelocity.x * dt;
    this.ball.y += this.ballVelocity.y * dt;

    // Friction légère
    this.ballVelocity.x *= 0.998;
    this.ballVelocity.y *= 0.998;

    // Rebond sur les bords haut/bas
    if (this.ball.y < 100 || this.ball.y > 668) {
      this.ballVelocity.y *= -0.9;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 100, 668);
    }

    // Vérifier les buts
    if (this.ball.x < 80) {
      // But dans le but du joueur?
      if (this.ball.y > 309 && this.ball.y < 459) {
        this.goalScored("ai");
      } else {
        // Rebond sur le côté
        this.ballVelocity.x *= -0.8;
        this.ball.x = 80;
      }
    }

    if (this.ball.x > 944) {
      // But dans le but de l'IA?
      if (this.ball.y > 309 && this.ball.y < 459) {
        this.goalScored("player");
      } else {
        this.ballVelocity.x *= -0.8;
        this.ball.x = 944;
      }
    }

    // Collision avec les barres
    this.checkRodCollisions();

    // IA
    this.updateAI();
  }

  checkRodCollisions() {
    const allRods = [...this.playerRods, ...this.aiRods];

    allRods.forEach((rod) => {
      // Vérifier si la balle est dans la zone de la barre
      if (Math.abs(this.ball.x - rod.x) < 20) {
        rod.players.forEach((player) => {
          const playerWorldY = rod.y + player.y;
          const distance = Math.abs(this.ball.y - playerWorldY);

          if (distance < 35) {
            // Collision!
            const bounceDirection = this.ball.x < rod.x ? -1 : 1;
            this.ballVelocity.x =
              Math.abs(this.ballVelocity.x) * bounceDirection * 1.1;
            this.ballVelocity.y += (this.ball.y - playerWorldY) * 5;

            // Limiter la vitesse
            this.ballVelocity.x = Phaser.Math.Clamp(
              this.ballVelocity.x,
              -800,
              800,
            );
            this.ballVelocity.y = Phaser.Math.Clamp(
              this.ballVelocity.y,
              -500,
              500,
            );
          }
        });
      }
    });
  }

  updateAI() {
    // L'IA suit la balle avec un léger délai
    const targetY = this.ball.y;

    this.aiRods.forEach((rod, index) => {
      // Plus réactif pour le gardien
      const speed = index === 0 ? 8 : 5;
      const delay = index === 0 ? 0.1 : 0.2;

      // Mouvement vers la balle avec délai
      const diff = targetY - rod.y;
      rod.y += diff * delay;
      rod.y = Phaser.Math.Clamp(rod.y, 200, 568);

      // L'IA tire si la balle est proche
      if (Math.abs(this.ball.x - rod.x) < 50 && this.ball.x > rod.x - 30) {
        this.kickBall(rod, -1); // Direction négative = vers la gauche
      }
    });
  }

  goalScored(scorer) {
    this.gameStarted = false;

    if (scorer === "player") {
      this.playerScore++;
    } else {
      this.aiScore++;
    }

    this.scoreText.setText(`${this.playerScore} - ${this.aiScore}`);

    // Animation de but
    this.showGoalEffect(scorer);

    // Vérifier si partie terminée
    if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
      this.time.delayedCall(2000, () => {
        this.gameOver(this.playerScore >= this.maxScore);
      });
    } else {
      // Relancer la balle
      this.time.delayedCall(1500, () => {
        this.gameStarted = true;
        this.launchBall();
      });
    }
  }

  showGoalEffect(scorer) {
    const color = scorer === "player" ? 0x3498db : 0xe74c3c;
    const message = scorer === "player" ? "⚽ BUUUT!" : "😢 But adverse...";

    // Flash
    const flash = this.add.rectangle(512, 384, 1024, 768, color, 0.3);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Texte
    const text = this.add
      .text(512, 384, message, {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      hold: 500,
      onComplete: () => text.destroy(),
    });
  }

  createBackButton() {
    const backBtn = this.add.container(70, 50);

    const bg = this.add.graphics();
    bg.fillStyle(0xe74c3c);
    bg.fillCircle(0, 0, 25);
    bg.lineStyle(3, 0xffffff);
    bg.strokeCircle(0, 0, 25);

    const icon = this.add
      .text(0, 0, "←", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    backBtn.add([bg, icon]);
    backBtn.setSize(50, 50);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on("pointerdown", () => {
      this.scene.start("WorldMap");
    });
  }

  createMagicStar() {
    const star = this.add.container(970, 720);

    const graphics = this.add.graphics();
    graphics.fillStyle(0xf7c531);
    graphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * 18;
      const y = Math.sin(angle) * 18;
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();

    const label = this.add
      .text(0, 30, "MAGIE", {
        fontFamily: "Arial",
        fontSize: 10,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    star.add([graphics, label]);
    star.setSize(50, 50);
    star.setInteractive({ useHandCursor: true });
    star.setDepth(100);

    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 4000,
      repeat: -1,
    });

    star.on("pointerdown", () => {
      this.activateMagicBypass();
    });
  }

  activateMagicBypass() {
    const flash = this.add.rectangle(512, 384, 1024, 768, 0xf7c531, 0);
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    const text = this.add
      .text(512, 300, "✨ Magie Activée! ✨", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: 250,
      duration: 1500,
      onComplete: () => text.destroy(),
    });

    this.time.delayedCall(500, () => {
      this.gameOver(true);
    });
  }

  gameOver(won) {
    this.gameStarted = false;
    this.time.removeAllEvents();

    let stars = 0;
    if (won) {
      const scoreDiff = this.playerScore - this.aiScore;
      if (scoreDiff >= 4)
        stars = 3; // Victoire écrasante
      else if (scoreDiff >= 2)
        stars = 2; // Belle victoire
      else stars = 1; // Victoire serrée

      GameState.completeLevel("babyfoot", stars);
    }

    // Overlay
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    const popup = this.add.container(512, 384);

    const bg = this.add.graphics();
    bg.fillStyle(won ? 0x27ae60 : 0xe74c3c);
    bg.fillRoundedRect(-200, -150, 400, 300, 20);
    bg.lineStyle(4, 0xffffff);
    bg.strokeRoundedRect(-200, -150, 400, 300, 20);

    const title = this.add
      .text(0, -100, won ? "⚽ VICTOIRE!" : "😢 DÉFAITE...", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const scoreDisplay = this.add
      .text(
        0,
        -40,
        `Score: ${this.playerScore} - ${this.aiScore}\n⭐ ${stars} étoile${stars > 1 ? "s" : ""}`,
        {
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);

    const retryBtn = this.createPopupButton(
      0,
      40,
      "🔄 Rejouer",
      0x3498db,
      () => {
        this.scene.restart();
      },
    );

    const mapBtn = this.createPopupButton(0, 100, "🗺️ Carte", 0x9b59b6, () => {
      this.scene.start("WorldMap");
    });

    popup.add([bg, title, scoreDisplay, retryBtn, mapBtn]);

    popup.setScale(0);
    this.tweens.add({
      targets: popup,
      scale: 1,
      duration: 400,
      ease: "Back.easeOut",
    });
  }

  createPopupButton(x, y, text, color, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color);
    bg.fillRoundedRect(-80, -18, 160, 36, 8);

    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(160, 36);
    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerdown", callback);

    return btn;
  }
}
