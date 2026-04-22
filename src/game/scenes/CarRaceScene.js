import * as Phaser from "phaser";
import { Scene } from "phaser";
import { GameState, GOODIES_DATA } from "../../services/GameState.js";

/**
 * Mini-jeu Course de Voiture - Yazan Escape Adventure
 * Le joueur évite les obstacles et collecte des étoiles éducatives
 */
export class CarRaceScene extends Scene {
  constructor() {
    super("CarRaceScene");
    this.player = null;
    this.obstacles = [];
    this.collectibles = [];
    this.score = 0;
    this.speed = 5;
    this.gameOver = false;
    this.distance = 0;
    this.targetDistance = 1000;
    this.lives = 3;
    this.educationalItems = [];
  }

  create() {
    // Réinitialiser
    this.score = 0;
    this.speed = 5;
    this.gameOver = false;
    this.distance = 0;
    this.lives = 3;
    this.obstacles = [];
    this.collectibles = [];

    // Fond de course
    this.createBackground();

    // Interface
    this.createUI();

    // Joueur
    this.createPlayer();

    // Démarrer le jeu
    this.startGame();

    // Contrôles
    this.setupControls();

    // Étoile magique de bypass
    this.createMagicStar();

    // Animation d'entrée
    this.cameras.main.fadeIn(300);
  }

  createBackground() {
    // Ciel
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // Routes (3 voies)
    const roadWidth = 200;
    const roadStart = (1024 - roadWidth * 3) / 2;

    this.lanes = [
      roadStart + roadWidth / 2,
      roadStart + roadWidth + roadWidth / 2,
      roadStart + roadWidth * 2 + roadWidth / 2,
    ];

    // Dessiner la route
    const road = this.add.graphics();
    road.fillStyle(0x34495e);
    road.fillRect(roadStart, 0, roadWidth * 3, 768);

    // Lignes de séparation
    road.fillStyle(0xf7c531);
    road.fillRect(roadStart + roadWidth - 5, 0, 10, 768);
    road.fillRect(roadStart + roadWidth * 2 - 5, 0, 10, 768);

    // Animation des lignes de route (effet de défilement)
    this.roadLines = [];
    for (let i = 0; i < 20; i++) {
      const line = this.add.rectangle(
        roadStart + roadWidth / 2,
        i * 50 - 50,
        10,
        30,
        0xffffff,
      );
      this.roadLines.push(line);

      const line2 = this.add.rectangle(
        roadStart + roadWidth * 2 + roadWidth / 2,
        i * 50 - 50,
        10,
        30,
        0xffffff,
      );
      this.roadLines.push(line2);
    }

    // Décors sur les côtés
    this.createSideDecor();
  }

  createSideDecor() {
    // Arbres/buissons stylisés des deux côtés
    for (let i = 0; i < 10; i++) {
      // Gauche
      const treeL = this.add.graphics();
      treeL.fillStyle(0x27ae60);
      treeL.fillCircle(80, i * 100, 40);
      treeL.fillStyle(0x1e8449);
      treeL.fillCircle(80, i * 100, 25);

      // Droite
      const treeR = this.add.graphics();
      treeR.fillStyle(0x27ae60);
      treeR.fillCircle(944, i * 100 + 50, 40);
      treeR.fillStyle(0x1e8449);
      treeR.fillCircle(944, i * 100 + 50, 25);
    }
  }

  createUI() {
    // Panneau supérieur
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRect(0, 0, 1024, 80);

    // Titre
    this.add
      .text(512, 25, "🏎️ COURSE NINJA", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ff6b35",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Score
    this.scoreText = this.add
      .text(150, 55, "⭐ Score: 0", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    // Distance
    this.distanceText = this.add
      .text(512, 55, "📏 0m / 1000m", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Vies
    this.livesText = this.add
      .text(874, 55, "❤️❤️❤️", {
        fontFamily: "Arial",
        fontSize: 18,
      })
      .setOrigin(0.5);

    // Bouton retour
    this.createButton(60, 25, "←", 0xe74c3c, () => {
      this.scene.start("WorldMap");
    });

    // Barre de progression
    const progressBg = this.add.rectangle(512, 740, 600, 20, 0x2c3e50);
    this.progressBar = this.add.rectangle(212 + 2, 740, 4, 16, 0x2ecc71);

    // Instructions
    this.add
      .text(512, 720, "⬅️ ➡️ Utilise les flèches ou clique sur les côtés", {
        fontFamily: "Arial",
        fontSize: 12,
        color: "#ffffff",
        alpha: 0.7,
      })
      .setOrigin(0.5);
  }

  createPlayer() {
    this.currentLane = 1; // Voie du milieu

    // Créer la voiture du joueur
    const playerGraphics = this.add.graphics();

    // Corps de la voiture
    playerGraphics.fillStyle(0xff6b35);
    playerGraphics.fillRoundedRect(-25, -40, 50, 80, 10);

    // Cockpit
    playerGraphics.fillStyle(0x2c3e50);
    playerGraphics.fillRoundedRect(-18, -25, 36, 30, 5);

    // Roues
    playerGraphics.fillStyle(0x000000);
    playerGraphics.fillCircle(-22, -30, 10);
    playerGraphics.fillCircle(22, -30, 10);
    playerGraphics.fillCircle(-22, 30, 10);
    playerGraphics.fillCircle(22, 30, 10);

    // Phares
    playerGraphics.fillStyle(0xf7c531);
    playerGraphics.fillRect(-20, -42, 15, 5);
    playerGraphics.fillRect(5, -42, 15, 5);

    playerGraphics.generateTexture("player_car", 60, 100);
    playerGraphics.destroy();

    this.player = this.add.image(
      this.lanes[this.currentLane],
      600,
      "player_car",
    );
    this.player.setScale(0.8);
  }

  setupControls() {
    // Contrôles clavier
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on("keydown-LEFT", () => this.moveLeft());
    this.input.keyboard.on("keydown-RIGHT", () => this.moveRight());

    // Contrôles tactiles/souris
    this.input.on("pointerdown", (pointer) => {
      if (this.gameOver) return;

      if (pointer.x < 400) {
        this.moveLeft();
      } else if (pointer.x > 624) {
        this.moveRight();
      }
    });
  }

  createMagicStar() {
    // Étoile magique de bypass en haut à droite
    const starContainer = this.add.container(970, 100);

    // Effet de brillance autour de l'étoile
    const glow = this.add.circle(0, 0, 30, 0xf7c531, 0.3);
    
    // Étoile principale
    const star = this.add.text(0, 0, "✨", {
      fontSize: 35,
    }).setOrigin(0.5);

    // Petite étoile secondaire
    const starSmall = this.add.text(12, -12, "⭐", {
      fontSize: 14,
    }).setOrigin(0.5);

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
    const hitArea = this.add.circle(0, 0, 30, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    starContainer.add(hitArea);

    // Tooltip au survol
    const tooltip = this.add.text(0, -45, "🪄 Magie!", {
      fontFamily: "Arial",
      fontSize: 12,
      color: "#f7c531",
      backgroundColor: "#000000",
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setAlpha(0);
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
    
    // Arrêter les timers (vérifier qu'ils existent)
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();
    if (this.difficultyTimer) this.difficultyTimer.destroy();
    
    // Marquer comme déjà nettoyé pour éviter double destruction
    this.obstacleTimer = null;
    this.collectibleTimer = null;
    this.difficultyTimer = null;

    // Effet magique spectaculaire
    this.cameras.main.flash(500, 247, 197, 49);

    // Particules magiques autour de la voiture
    for (let i = 0; i < 25; i++) {
      const particle = this.add.text(
        this.player.x + Phaser.Math.Between(-100, 100),
        this.player.y + Phaser.Math.Between(-100, 100),
        ["✨", "⭐", "🌟", "💫"][Phaser.Math.Between(0, 3)],
        { fontSize: Phaser.Math.Between(16, 32) }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: particle,
        y: particle.y - 80,
        alpha: 0,
        scale: 0,
        duration: 800,
        delay: i * 25,
        onComplete: () => particle.destroy(),
      });
    }

    // Message magique
    const magicText = this.add.text(512, 350, "🪄 TÉLÉPORTATION! 🪄", {
      fontFamily: "Arial Black",
      fontSize: 48,
      color: "#f7c531",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScale(0);

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
          delay: 800,
        });
      },
    });

    // Téléporter à la ligne d'arrivée après l'animation
    this.time.delayedCall(1800, () => {
      this.distance = this.targetDistance;
      this.score = 200;
      this.victory();
    });
  }

  moveLeft() {
    if (this.gameOver) return;
    if (this.currentLane > 0) {
      this.currentLane--;
      this.tweens.add({
        targets: this.player,
        x: this.lanes[this.currentLane],
        duration: 150,
        ease: "Power2",
      });
    }
  }

  moveRight() {
    if (this.gameOver) return;
    if (this.currentLane < 2) {
      this.currentLane++;
      this.tweens.add({
        targets: this.player,
        x: this.lanes[this.currentLane],
        duration: 150,
        ease: "Power2",
      });
    }
  }

  startGame() {
    // Timer pour créer des obstacles
    this.obstacleTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Timer pour créer des collectibles
    this.collectibleTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    });

    // Timer pour augmenter la difficulté
    this.difficultyTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.speed < 15) this.speed += 0.5;
        if (this.obstacleTimer.delay > 800) {
          this.obstacleTimer.delay -= 100;
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  spawnObstacle() {
    if (this.gameOver) return;

    const lane = Phaser.Math.Between(0, 2);

    // Créer l'obstacle
    const obstacle = this.add.container(this.lanes[lane], -50);

    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0xe74c3c);
    obstacleGraphics.fillRoundedRect(-25, -30, 50, 60, 8);
    obstacleGraphics.fillStyle(0xc0392b);
    obstacleGraphics.fillRect(-20, -25, 40, 20);

    obstacle.add(obstacleGraphics);
    obstacle.setData("type", "obstacle");

    this.obstacles.push(obstacle);
  }

  spawnCollectible() {
    if (this.gameOver) return;

    const lane = Phaser.Math.Between(0, 2);

    // Types de collectibles
    const types = [
      { icon: "⭐", points: 10, color: 0xf7c531 },
      { icon: "💎", points: 25, color: 0x9b59b6 },
      { icon: "🧠", points: 50, color: 0x3498db, educational: true },
    ];

    const type = types[Phaser.Math.Between(0, types.length - 1)];

    const collectible = this.add.container(this.lanes[lane], -50);

    // Fond brillant
    const glow = this.add.circle(0, 0, 30, type.color, 0.3);

    // Icône
    const icon = this.add
      .text(0, 0, type.icon, {
        fontSize: 32,
      })
      .setOrigin(0.5);

    collectible.add([glow, icon]);
    collectible.setData("type", "collectible");
    collectible.setData("points", type.points);
    collectible.setData("educational", type.educational);

    // Animation de rotation
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.6 },
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.collectibles.push(collectible);
  }

  update() {
    if (this.gameOver) return;

    // Mettre à jour la distance
    this.distance += this.speed / 10;
    this.distanceText.setText(
      `📏 ${Math.floor(this.distance)}m / ${this.targetDistance}m`,
    );

    // Mettre à jour la barre de progression
    const progress = Math.min(this.distance / this.targetDistance, 1);
    this.progressBar.width = 596 * progress;

    // Animation des lignes de route
    this.roadLines.forEach((line) => {
      line.y += this.speed;
      if (line.y > 800) {
        line.y = -50;
      }
    });

    // Mettre à jour les obstacles
    this.updateObstacles();

    // Mettre à jour les collectibles
    this.updateCollectibles();

    // Vérifier la victoire
    if (this.distance >= this.targetDistance) {
      this.victory();
    }
  }

  updateObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.y += this.speed;

      // Vérifier collision
      if (this.checkCollision(this.player, obstacle, 40, 60)) {
        this.hitObstacle(obstacle);
        this.obstacles.splice(i, 1);
        obstacle.destroy();
        continue;
      }

      // Retirer si hors écran
      if (obstacle.y > 850) {
        this.obstacles.splice(i, 1);
        obstacle.destroy();
      }
    }
  }

  updateCollectibles() {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      collectible.y += this.speed;

      // Vérifier collection
      if (this.checkCollision(this.player, collectible, 40, 40)) {
        this.collectItem(collectible);
        this.collectibles.splice(i, 1);
        collectible.destroy();
        continue;
      }

      // Retirer si hors écran
      if (collectible.y > 850) {
        this.collectibles.splice(i, 1);
        collectible.destroy();
      }
    }
  }

  checkCollision(obj1, obj2, width, height) {
    const bounds1 = {
      x: obj1.x - width / 2,
      y: obj1.y - height / 2,
      width: width,
      height: height,
    };

    const bounds2 = {
      x: obj2.x - width / 2,
      y: obj2.y - height / 2,
      width: width,
      height: height,
    };

    return Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(
        bounds1.x,
        bounds1.y,
        bounds1.width,
        bounds1.height,
      ),
      new Phaser.Geom.Rectangle(
        bounds2.x,
        bounds2.y,
        bounds2.width,
        bounds2.height,
      ),
    );
  }

  hitObstacle(obstacle) {
    this.lives--;
    this.updateLivesDisplay();

    // Effet de collision
    this.cameras.main.shake(200, 0.02);
    this.cameras.main.flash(100, 255, 0, 0);

    // Animation de la voiture
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.player.alpha = 1;
      },
    });

    if (this.lives <= 0) {
      this.defeat();
    }
  }

  updateLivesDisplay() {
    const hearts = "❤️".repeat(this.lives) + "🖤".repeat(3 - this.lives);
    this.livesText.setText(hearts);
  }

  collectItem(collectible) {
    const points = collectible.getData("points");
    this.score += points;
    this.scoreText.setText(`⭐ Score: ${this.score}`);

    // Effet de collection
    const floatText = this.add
      .text(collectible.x, collectible.y, `+${points}`, {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: floatText,
      y: floatText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => floatText.destroy(),
    });

    // Info éducative occasionnelle
    if (collectible.getData("educational")) {
      this.showEducationalTip();
    }
  }

  showEducationalTip() {
    const tips = [
      "L'IA apprend grâce aux données!",
      "Partager rend tout le monde heureux!",
      "La logique aide à résoudre les problèmes!",
      "Les robots suivent des programmes!",
    ];

    const tip = tips[Phaser.Math.Between(0, tips.length - 1)];

    const tipBg = this.add.rectangle(512, 150, 400, 50, 0x9b59b6, 0.9);
    const tipText = this.add
      .text(512, 150, `💡 ${tip}`, {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [tipBg, tipText],
      alpha: 0,
      y: "-=30",
      duration: 3000,
      delay: 2000,
      onComplete: () => {
        tipBg.destroy();
        tipText.destroy();
      },
    });
  }

  victory() {
    this.gameOver = true;
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();
    if (this.difficultyTimer) this.difficultyTimer.destroy();

    // Calculer les étoiles
    const stars = this.score >= 200 ? 3 : this.score >= 100 ? 2 : 1;

    // Sauvegarder la progression
    GameState.completeLevel("carrace", stars);

    // Collecter un goodie
    const goodies = GOODIES_DATA.filter((g) => g.level === "carrace");
    const randomGoodie = goodies[Math.floor(Math.random() * goodies.length)];
    if (randomGoodie && !GameState.hasGoodie(randomGoodie.id)) {
      GameState.collectGoodie(randomGoodie.id);
    }

    this.showEndScreen(true, stars, randomGoodie);
  }

  defeat() {
    this.gameOver = true;
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();
    if (this.difficultyTimer) this.difficultyTimer.destroy();

    this.showEndScreen(false, 0, null);
  }

  showEndScreen(victory, stars, goodie) {
    // Overlay
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    const popup = this.add.container(512, 384);

    const bg = this.add.graphics();
    bg.fillStyle(victory ? 0x2c3e50 : 0x7f0000);
    bg.fillRoundedRect(-250, -200, 500, 400, 25);
    bg.lineStyle(4, victory ? 0xf7c531 : 0xe74c3c);
    bg.strokeRoundedRect(-250, -200, 500, 400, 25);

    const title = this.add
      .text(0, -150, victory ? "🏆 ARRIVÉE!" : "💥 CRASH!", {
        fontFamily: "Arial Black",
        fontSize: 42,
        color: victory ? "#f7c531" : "#ffffff",
      })
      .setOrigin(0.5);

    popup.add([bg, title]);

    // Score final
    const scoreDisplay = this.add
      .text(0, -80, `Score: ${this.score} points`, {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    popup.add(scoreDisplay);

    // Étoiles
    if (victory) {
      const starsText = this.add
        .text(0, -40, "⭐".repeat(stars) + "☆".repeat(3 - stars), {
          fontSize: 40,
        })
        .setOrigin(0.5);
      popup.add(starsText);
    }

    // Goodie
    if (goodie) {
      const goodieText = this.add
        .text(0, 20, `${goodie.icon} ${goodie.name}`, {
          fontFamily: "Arial",
          fontSize: 20,
          color: "#9b59b6",
        })
        .setOrigin(0.5);
      popup.add(goodieText);
    }

    // Boutons
    const continueBtn = this.createButton(
      0,
      120,
      victory ? "➡️ Continuer" : "🔄 Réessayer",
      victory ? 0x2ecc71 : 0x3498db,
      () => {
        if (victory) {
          this.scene.start("WorldMap");
        } else {
          this.scene.restart();
        }
      },
    );
    popup.add(continueBtn);

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
