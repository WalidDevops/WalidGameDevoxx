import * as Phaser from "phaser";
import { Scene } from "phaser";
import { GameState } from "../../services/GameState.js";

/**
 * Mini Golf - Yazan Escape Adventure
 * Jeu de golf zen où il faut mettre la balle dans le trou avec le moins de coups possible
 */
export class MiniGolfScene extends Scene {
  constructor() {
    super("MiniGolfScene");
    this.ball = null;
    this.hole = null;
    this.power = 0;
    this.angle = 0;
    this.isAiming = false;
    this.isDragging = false;
    this.shots = 0;
    this.maxShots = 6;
    this.currentHole = 1;
    this.totalHoles = 3;
    this.score = 0; // Par rapport au par
    this.ballMoving = false;
    this.aimLine = null;
    this.powerBar = null;
  }

  create() {
    const { width, height } = this.scale;

    // Reset
    this.shots = 0;
    this.currentHole = 1;
    this.score = 0;
    this.ballMoving = false;

    // Fond vert golf
    this.cameras.main.setBackgroundColor(0x228b22);

    // UI (avant le terrain pour que shotsText existe)
    this.createUI();

    // Créer le terrain
    this.createCourse();

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

  createCourse() {
    const { width, height } = this.scale;

    // Bordures du terrain
    const border = this.add.graphics();
    border.lineStyle(8, 0x006400);
    border.strokeRect(50, 100, width - 100, height - 200);

    // Gazon avec texture
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(60, width - 60);
      const y = Phaser.Math.Between(110, height - 110);
      this.add.circle(x, y, 2, 0x32cd32, 0.3);
    }

    // Configuration des trous
    this.holeConfigs = [
      {
        ballX: 150,
        ballY: 400,
        holeX: 874,
        holeY: 400,
        par: 2,
        obstacles: [],
      },
      {
        ballX: 150,
        ballY: 500,
        holeX: 874,
        holeY: 200,
        par: 3,
        obstacles: [{ x: 512, y: 350, w: 150, h: 20 }],
      },
      {
        ballX: 150,
        ballY: 600,
        holeX: 874,
        holeY: 300,
        par: 3,
        obstacles: [
          { x: 350, y: 300, w: 20, h: 200 },
          { x: 650, y: 400, w: 20, h: 200 },
        ],
      },
    ];

    this.setupHole(this.currentHole);
  }

  setupHole(holeNum) {
    const config = this.holeConfigs[holeNum - 1];

    // Nettoyer les anciens éléments
    if (this.ball) this.ball.destroy();
    if (this.hole) this.hole.destroy();
    if (this.obstacles) {
      this.obstacles.forEach((o) => o.destroy());
    }
    this.obstacles = [];

    // Créer le trou
    this.hole = this.add.container(config.holeX, config.holeY);
    const holeShadow = this.add.circle(2, 2, 22, 0x000000, 0.3);
    const holeGraphic = this.add.circle(0, 0, 20, 0x1a1a1a);
    const holeRim = this.add.circle(0, 0, 20, 0x000000, 0);
    const holeRimGraphics = this.add.graphics();
    holeRimGraphics.lineStyle(3, 0x006400);
    holeRimGraphics.strokeCircle(0, 0, 20);

    // Drapeau
    const flagPole = this.add.rectangle(15, -30, 4, 60, 0xffffff);
    const flag = this.add.triangle(30, -50, 0, 0, 0, 25, 20, 12, 0xff0000);

    this.hole.add([holeShadow, holeGraphic, holeRimGraphics, flagPole, flag]);

    // Animation du drapeau
    this.tweens.add({
      targets: flag,
      scaleX: { from: 1, to: 0.8 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Créer les obstacles
    config.obstacles.forEach((obs) => {
      const obstacle = this.add.rectangle(obs.x, obs.y, obs.w, obs.h, 0x8b4513);
      obstacle.setStrokeStyle(2, 0x5d3a1a);
      this.obstacles.push(obstacle);
    });

    // Créer la balle
    this.ball = this.add.container(config.ballX, config.ballY);
    const ballShadow = this.add.ellipse(3, 5, 24, 12, 0x000000, 0.3);
    const ballGraphic = this.add.circle(0, 0, 12, 0xffffff);
    const ballShine = this.add.circle(-4, -4, 4, 0xffffff, 0.8);

    // Lignes de la balle de golf
    const ballLines = this.add.graphics();
    ballLines.lineStyle(1, 0xcccccc, 0.5);
    ballLines.strokeCircle(0, 0, 8);

    this.ball.add([ballShadow, ballGraphic, ballLines, ballShine]);

    // Ligne de visée
    this.aimLine = this.add.graphics();
    this.aimLine.setDepth(10);

    // Afficher le par
    this.updateHoleInfo(config.par);

    this.shots = 0;
    this.updateShotsDisplay();
  }

  updateHoleInfo(par) {
    if (this.holeInfoText) this.holeInfoText.destroy();

    this.holeInfoText = this.add
      .text(
        512,
        130,
        `Trou ${this.currentHole}/${this.totalHoles}  |  Par: ${par}`,
        {
          fontFamily: "Arial Black",
          fontSize: 24,
          color: "#ffffff",
          stroke: "#006400",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);
  }

  createUI() {
    const { width } = this.scale;

    // Titre
    this.add
      .text(width / 2, 50, "⛳ MINI GOLF ZEN", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#ffffff",
        stroke: "#006400",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Compteur de coups
    this.shotsText = this.add
      .text(width - 150, 50, "Coups: 0/6", {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Score total
    this.scoreText = this.add
      .text(width - 150, 80, "Score: 0", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Barre de puissance
    this.createPowerBar();
  }

  createPowerBar() {
    this.powerBarContainer = this.add.container(100, 700);

    const bg = this.add.rectangle(0, 0, 200, 20, 0x333333);
    bg.setStrokeStyle(2, 0xffffff);

    this.powerBarFill = this.add.rectangle(-99, 0, 0, 16, 0x00ff00);
    this.powerBarFill.setOrigin(0, 0.5);

    const label = this.add
      .text(0, -25, "Puissance", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.powerBarContainer.add([bg, this.powerBarFill, label]);
    this.powerBarContainer.setAlpha(0);
  }

  setupInput() {
    this.input.on("pointerdown", (pointer) => {
      if (this.ballMoving) return;

      const distance = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.ball.x,
        this.ball.y,
      );

      if (distance < 50) {
        this.isDragging = true;
        this.isAiming = true;
        this.powerBarContainer.setAlpha(1);
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (!this.isDragging || this.ballMoving) return;

      // Calculer l'angle et la puissance
      const dx = this.ball.x - pointer.x;
      const dy = this.ball.y - pointer.y;
      this.angle = Math.atan2(dy, dx);
      this.power = Math.min(
        Phaser.Math.Distance.Between(
          pointer.x,
          pointer.y,
          this.ball.x,
          this.ball.y,
        ),
        200,
      );

      // Mettre à jour la ligne de visée
      this.drawAimLine();

      // Mettre à jour la barre de puissance
      this.updatePowerBar();
    });

    this.input.on("pointerup", () => {
      if (this.isDragging && this.power > 10) {
        this.shoot();
      }
      this.isDragging = false;
      this.isAiming = false;
      this.aimLine.clear();
      this.powerBarContainer.setAlpha(0);
    });
  }

  drawAimLine() {
    this.aimLine.clear();

    // Ligne pointillée de visée
    this.aimLine.lineStyle(3, 0xffffff, 0.8);

    const endX = this.ball.x + Math.cos(this.angle) * this.power;
    const endY = this.ball.y + Math.sin(this.angle) * this.power;

    // Points pour ligne pointillée
    const segments = 10;
    for (let i = 0; i < segments; i += 2) {
      const startRatio = i / segments;
      const endRatio = (i + 1) / segments;

      this.aimLine.beginPath();
      this.aimLine.moveTo(
        this.ball.x + Math.cos(this.angle) * this.power * startRatio,
        this.ball.y + Math.sin(this.angle) * this.power * startRatio,
      );
      this.aimLine.lineTo(
        this.ball.x + Math.cos(this.angle) * this.power * endRatio,
        this.ball.y + Math.sin(this.angle) * this.power * endRatio,
      );
      this.aimLine.strokePath();
    }

    // Flèche au bout
    const arrowSize = 15;
    this.aimLine.fillStyle(0xffffff);
    this.aimLine.beginPath();
    this.aimLine.moveTo(endX, endY);
    this.aimLine.lineTo(
      endX - arrowSize * Math.cos(this.angle - 0.4),
      endY - arrowSize * Math.sin(this.angle - 0.4),
    );
    this.aimLine.lineTo(
      endX - arrowSize * Math.cos(this.angle + 0.4),
      endY - arrowSize * Math.sin(this.angle + 0.4),
    );
    this.aimLine.closePath();
    this.aimLine.fillPath();
  }

  updatePowerBar() {
    const normalizedPower = this.power / 200;
    this.powerBarFill.width = normalizedPower * 198;

    // Couleur selon la puissance
    if (normalizedPower < 0.33) {
      this.powerBarFill.fillColor = 0x00ff00;
    } else if (normalizedPower < 0.66) {
      this.powerBarFill.fillColor = 0xffff00;
    } else {
      this.powerBarFill.fillColor = 0xff0000;
    }
  }

  shoot() {
    this.ballMoving = true;
    this.shots++;
    this.updateShotsDisplay();

    // Vélocité de la balle
    const speed = this.power * 3;
    this.ballVelocity = {
      x: Math.cos(this.angle) * speed,
      y: Math.sin(this.angle) * speed,
    };

    // Son de frappe (effet visuel)
    this.showHitEffect();

    // Démarrer le mouvement
    this.time.addEvent({
      delay: 16,
      callback: this.updateBall,
      callbackScope: this,
      loop: true,
    });
  }

  showHitEffect() {
    const hitCircle = this.add.circle(
      this.ball.x,
      this.ball.y,
      20,
      0xffffff,
      0.5,
    );
    this.tweens.add({
      targets: hitCircle,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => hitCircle.destroy(),
    });
  }

  updateBall() {
    if (!this.ballMoving) return;

    // Appliquer la vélocité
    this.ball.x += this.ballVelocity.x * 0.016;
    this.ball.y += this.ballVelocity.y * 0.016;

    // Friction
    this.ballVelocity.x *= 0.98;
    this.ballVelocity.y *= 0.98;

    // Rebond sur les bords
    if (this.ball.x < 70 || this.ball.x > 954) {
      this.ballVelocity.x *= -0.7;
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 70, 954);
    }
    if (this.ball.y < 120 || this.ball.y > 648) {
      this.ballVelocity.y *= -0.7;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 120, 648);
    }

    // Collision avec obstacles
    this.obstacles.forEach((obs) => {
      if (this.checkCollision(this.ball, obs)) {
        // Rebond simple
        this.ballVelocity.x *= -0.8;
        this.ballVelocity.y *= -0.8;
      }
    });

    // Vérifier si dans le trou
    const distToHole = Phaser.Math.Distance.Between(
      this.ball.x,
      this.ball.y,
      this.hole.x,
      this.hole.y,
    );

    if (
      distToHole < 18 &&
      Math.abs(this.ballVelocity.x) < 100 &&
      Math.abs(this.ballVelocity.y) < 100
    ) {
      this.ballInHole();
      return;
    }

    // Arrêter si vélocité très faible
    const speed = Math.sqrt(
      this.ballVelocity.x * this.ballVelocity.x +
        this.ballVelocity.y * this.ballVelocity.y,
    );

    if (speed < 5) {
      this.ballMoving = false;
      this.time.removeAllEvents();

      // Vérifier si dépassé le max de coups
      if (this.shots >= this.maxShots) {
        this.gameOver(false);
      }
    }
  }

  checkCollision(ball, obstacle) {
    const bounds = obstacle.getBounds();
    return bounds.contains(ball.x, ball.y);
  }

  ballInHole() {
    this.ballMoving = false;
    this.time.removeAllEvents();

    // Animation de la balle qui tombe
    this.tweens.add({
      targets: this.ball,
      x: this.hole.x,
      y: this.hole.y,
      scale: 0,
      duration: 300,
      ease: "Quad.easeIn",
    });

    // Calculer le score pour ce trou
    const par = this.holeConfigs[this.currentHole - 1].par;
    const holeScore = this.shots - par;
    this.score += holeScore;

    // Effet de célébration
    this.showHoleCompleteEffect(holeScore);

    // Passer au trou suivant ou terminer
    this.time.delayedCall(2000, () => {
      if (this.currentHole < this.totalHoles) {
        this.currentHole++;
        this.setupHole(this.currentHole);
        this.ball.setScale(1);
      } else {
        this.gameOver(true);
      }
    });
  }

  showHoleCompleteEffect(holeScore) {
    let message = "";
    let color = "#ffffff";

    if (holeScore <= -2) {
      message = "🦅 EAGLE!";
      color = "#ffd700";
    } else if (holeScore === -1) {
      message = "🐦 BIRDIE!";
      color = "#00ff00";
    } else if (holeScore === 0) {
      message = "👍 PAR!";
      color = "#ffffff";
    } else if (holeScore === 1) {
      message = "BOGEY";
      color = "#ffaa00";
    } else {
      message = "+" + holeScore;
      color = "#ff6666";
    }

    const text = this.add
      .text(512, 400, message, {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: color,
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 1, to: 0 },
      y: 300,
      duration: 1500,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });

    // Confettis si bon score
    if (holeScore <= 0) {
      for (let i = 0; i < 20; i++) {
        const confetti = this.add.circle(
          512,
          400,
          Phaser.Math.Between(5, 10),
          Phaser.Math.Between(0, 0xffffff),
        );
        this.tweens.add({
          targets: confetti,
          x: Phaser.Math.Between(200, 824),
          y: Phaser.Math.Between(200, 600),
          alpha: 0,
          duration: 1000,
          delay: i * 30,
          onComplete: () => confetti.destroy(),
        });
      }
    }

    // Mettre à jour le score affiché
    this.scoreText.setText(`Score: ${this.score > 0 ? "+" : ""}${this.score}`);
  }

  updateShotsDisplay() {
    this.shotsText.setText(`Coups: ${this.shots}/${this.maxShots}`);
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

    // Dessiner l'étoile
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
    // Effet magique
    const flash = this.add.rectangle(512, 384, 1024, 768, 0xf7c531, 0);
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Message
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

    // Victoire automatique
    this.time.delayedCall(500, () => {
      this.gameOver(true);
    });
  }

  showInstructions() {
    const instructions = this.add.container(512, 400);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-200, -100, 400, 200, 15);

    const text = this.add
      .text(
        0,
        0,
        "🏌️ Comment jouer:\n\n" +
          "1. Cliquez sur la balle\n" +
          "2. Tirez pour viser et doser\n" +
          "3. Relâchez pour frapper!\n\n" +
          "Cliquez pour commencer",
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

    this.input.once("pointerdown", () => {
      this.tweens.add({
        targets: instructions,
        alpha: 0,
        duration: 300,
        onComplete: () => instructions.destroy(),
      });
    });
  }

  gameOver(won) {
    // Calculer les étoiles
    let stars = 0;
    if (won) {
      if (this.score <= -3)
        stars = 3; // Très bon
      else if (this.score <= 0)
        stars = 2; // Par ou mieux
      else stars = 1; // Terminé
    }

    // Sauvegarder si gagné
    if (won) {
      GameState.completeLevel("minigolf", stars);
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
      .text(0, -100, won ? "⛳ PARCOURS TERMINÉ!" : "💀 TROP DE COUPS!", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const scoreDisplay = this.add
      .text(
        0,
        -40,
        `Score final: ${this.score > 0 ? "+" : ""}${this.score}\n⭐ ${stars} étoile${stars > 1 ? "s" : ""}`,
        {
          fontFamily: "Arial",
          fontSize: 22,
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);

    // Boutons
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
