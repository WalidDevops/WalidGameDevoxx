import * as Phaser from "phaser";
import { Scene } from "phaser";
import { GameState } from "../../services/GameState.js";
import { AuthService } from "../../services/AuthService.js";

/**
 * Carte du Monde (Hub) - Yazan Escape Adventure
 * Affiche les niveaux disponibles et la progression
 */
export class WorldMap extends Scene {
  constructor() {
    super("WorldMap");
    this.levelData = [
      {
        id: "tictactoe",
        name: "Dojo XO",
        icon: "⭕",
        x: 200,
        y: 350,
        color: 0x3498db,
        description: "Affronte le maître du XO!",
      },
      {
        id: "carrace",
        name: "Course Ninja",
        icon: "🏎️",
        x: 400,
        y: 250,
        color: 0xe74c3c,
        description: "Cours et collecte les étoiles!",
      },
      {
        id: "minigolf",
        name: "Golf Zen",
        icon: "⛳",
        x: 650,
        y: 350,
        color: 0x2ecc71,
        description: "Vise avec précision!",
      },
      {
        id: "babyfoot",
        name: "Arena Foot",
        icon: "⚽",
        x: 850,
        y: 250,
        color: 0xf39c12,
        description: "Marque des buts!",
      },
    ];
  }

  create() {
    const { width, height } = this.scale;

    // Fond de carte
    this.createMapBackground();

    // Titre
    this.createHeader();

    // Chemins entre les niveaux
    this.createPaths();

    // Niveaux
    this.createLevelNodes();

    // Informations joueur
    this.createPlayerInfo();

    // Boutons de navigation
    this.createNavigationButtons();

    // Animation d'entrée
    this.cameras.main.fadeIn(400);
  }

  createMapBackground() {
    // Fond principal
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg").setAlpha(0.8);
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Overlay de carte
    const mapBg = this.add.graphics();
    mapBg.fillStyle(0x2c3e50, 0.3);
    mapBg.fillRoundedRect(50, 150, 924, 500, 30);

    // Décoration de carte (montagnes stylisées)
    mapBg.fillStyle(0x34495e, 0.5);
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 200;
      const h = Phaser.Math.Between(80, 150);
      mapBg.fillTriangle(x, 600, x + 80, 600 - h, x + 160, 600);
    }

    // Nuages décoratifs
    for (let i = 0; i < 8; i++) {
      const cloud = this.add.ellipse(
        Phaser.Math.Between(100, 924),
        Phaser.Math.Between(180, 280),
        Phaser.Math.Between(60, 120),
        Phaser.Math.Between(30, 50),
        0xffffff,
        0.2,
      );

      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createHeader() {
    // Bannière du titre
    const banner = this.add.graphics();
    banner.fillStyle(0xff6b35);
    banner.fillRoundedRect(312, 30, 400, 70, 15);
    banner.fillStyle(0x000000, 0.3);
    banner.fillRoundedRect(312, 80, 400, 20, 5);

    this.add
      .text(512, 65, "🗺️ CARTE DU MONDE NINJA", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Progression globale
    const progress = GameState.getProgress();
    const completedLevels = Object.values(progress.levels).filter(
      (l) => l.completed,
    ).length;

    this.add
      .text(512, 120, `Progression: ${completedLevels}/4 niveaux`, {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#f7c531",
      })
      .setOrigin(0.5);
  }

  createPaths() {
    const graphics = this.add.graphics();
    graphics.lineStyle(6, 0xf7c531, 0.6);

    // Dessiner les chemins entre les niveaux
    const progress = GameState.getProgress();

    for (let i = 0; i < this.levelData.length - 1; i++) {
      const current = this.levelData[i];
      const next = this.levelData[i + 1];

      // Chemin principal
      graphics.lineStyle(8, 0x2c3e50, 0.8);
      graphics.lineBetween(current.x, current.y, next.x, next.y);

      // Chemin débloqué (doré)
      if (progress.levels[current.id]?.completed) {
        graphics.lineStyle(4, 0xf7c531, 0.8);
        graphics.lineBetween(current.x, current.y, next.x, next.y);
      }
    }
  }

  createLevelNodes() {
    const progress = GameState.getProgress();

    this.levelData.forEach((level, index) => {
      const levelProgress = progress.levels[level.id];
      const isUnlocked = levelProgress?.unlocked;
      const isCompleted = levelProgress?.completed;
      const stars = levelProgress?.stars || 0;

      // Conteneur du niveau
      const container = this.add.container(level.x, level.y);

      // Cercle de fond avec effet de brillance
      if (isUnlocked) {
        const glow = this.add.circle(0, 0, 55, level.color, 0.3);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.2, to: 0.5 },
          scale: { from: 1, to: 1.2 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
        });
        container.add(glow);
      }

      // Cercle principal
      const circle = this.add.graphics();
      const fillColor = isUnlocked ? level.color : 0x7f8c8d;
      circle.fillStyle(fillColor);
      circle.fillCircle(0, 0, 45);
      circle.lineStyle(4, isCompleted ? 0xf7c531 : 0xffffff);
      circle.strokeCircle(0, 0, 45);
      container.add(circle);

      // Icône ou cadenas
      const icon = this.add
        .text(0, -5, isUnlocked ? level.icon : "🔒", {
          fontFamily: "Arial",
          fontSize: 36,
        })
        .setOrigin(0.5);
      container.add(icon);

      // Nom du niveau
      const name = this.add
        .text(0, 70, level.name, {
          fontFamily: "Arial Black",
          fontSize: 16,
          color: isUnlocked ? "#ffffff" : "#7f8c8d",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      container.add(name);

      // Étoiles si complété
      if (isCompleted && stars > 0) {
        const starsText = this.add
          .text(0, 95, "⭐".repeat(stars) + "☆".repeat(3 - stars), {
            fontSize: 14,
          })
          .setOrigin(0.5);
        container.add(starsText);
      }

      // Interaction si débloqué
      if (isUnlocked) {
        const hitArea = this.add.circle(0, 0, 50, 0xffffff, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        hitArea.on("pointerover", () => {
          this.showLevelInfo(level, levelProgress);
          this.tweens.add({
            targets: container,
            scale: 1.15,
            duration: 150,
          });
        });

        hitArea.on("pointerout", () => {
          this.hideLevelInfo();
          this.tweens.add({
            targets: container,
            scale: 1,
            duration: 150,
          });
        });

        hitArea.on("pointerdown", () => {
          this.startLevel(level.id);
        });
      }

      // Animation d'apparition
      container.setScale(0);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 400,
        delay: index * 150,
        ease: "Back.easeOut",
      });
    });
  }

  showLevelInfo(level, progress) {
    if (this.levelInfoBox) {
      this.levelInfoBox.destroy();
    }

    this.levelInfoBox = this.add.container(512, 680);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-200, -40, 400, 80, 15);
    bg.lineStyle(2, level.color);
    bg.strokeRoundedRect(-200, -40, 400, 80, 15);

    const title = this.add
      .text(0, -20, `${level.icon} ${level.name}`, {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const desc = this.add
      .text(0, 10, level.description, {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    const action = this.add
      .text(0, 30, "🎮 Cliquez pour jouer!", {
        fontFamily: "Arial",
        fontSize: 12,
        color: "#2ecc71",
      })
      .setOrigin(0.5);

    this.levelInfoBox.add([bg, title, desc, action]);
  }

  hideLevelInfo() {
    if (this.levelInfoBox) {
      this.levelInfoBox.destroy();
      this.levelInfoBox = null;
    }
  }

  startLevel(levelId) {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => {
      const sceneMap = {
        tictactoe: "TicTacToeScene",
        carrace: "CarRaceScene",
        minigolf: "MiniGolfScene",
        babyfoot: "BabyfootScene",
      };

      const sceneName = sceneMap[levelId];
      if (this.scene.get(sceneName)) {
        this.scene.start(sceneName);
      } else {
        // Fallback si la scène n'existe pas encore
        this.scene.start("TicTacToeScene");
      }
    });
  }

  createPlayerInfo() {
    const user = AuthService.getCurrentUser();
    const progress = GameState.getProgress();

    // Panneau joueur
    const panel = this.add.container(100, 700);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-80, -30, 200, 60, 10);

    // Avatar
    const avatar = this.add.image(-50, 0, "ninja_avatar").setScale(0.6);

    // Nom et stats
    const name = this.add.text(10, -10, user ? user.username : "Invité", {
      fontFamily: "Arial Bold",
      fontSize: 14,
      color: "#ff6b35",
    });

    const stats = this.add.text(
      10,
      10,
      `⭐ ${progress.totalStars}  🎁 ${progress.goodies.length}`,
      {
        fontFamily: "Arial",
        fontSize: 12,
        color: "#f7c531",
      },
    );

    panel.add([bg, avatar, name, stats]);
  }

  createNavigationButtons() {
    // Bouton retour menu
    const backBtn = this.createButton(80, 50, "🏠 Menu", 0xe74c3c, () => {
      this.scene.start("MainMenu");
    });

    // Bouton inventaire
    const invBtn = this.createButton(944, 700, "🎁 Goodies", 0x9b59b6, () => {
      this.scene.start("InventoryScene");
    });

    // Bouton MAGIE - Libérer Yazan
    this.createMagicButton();
  }

  createMagicButton() {
    const btn = this.add.container(944, 50);

    // Fond brillant
    const glow = this.add.circle(0, 0, 35, 0xf7c531, 0.3);
    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.4 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Étoile magique
    const star = this.add.graphics();
    star.fillStyle(0xf7c531);
    star.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * 22;
      const y = Math.sin(angle) * 22;
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    star.fillPath();

    // Texte
    const label = this.add.text(0, 45, "✨ MAGIE", {
      fontFamily: "Arial Black",
      fontSize: 12,
      color: "#f7c531"
    }).setOrigin(0.5);

    btn.add([glow, star, label]);
    btn.setSize(60, 60);
    btn.setInteractive({ useHandCursor: true });

    // Animation rotation
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 5000,
      repeat: -1
    });

    btn.on("pointerover", () => {
      this.tweens.add({ targets: btn, scale: 1.2, duration: 150 });
    });
    btn.on("pointerout", () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 150 });
    });
    btn.on("pointerdown", () => {
      this.activateUltimateMagic();
    });
  }

  activateUltimateMagic() {
    // Effet de flash magique
    const flash = this.add.rectangle(512, 384, 1024, 768, 0xf7c531, 0);
    flash.setDepth(100);
    
    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.8 },
      duration: 500,
      yoyo: true,
      onComplete: () => flash.destroy()
    });

    // Particules d'étoiles
    for (let i = 0; i < 50; i++) {
      const particle = this.add.text(
        Phaser.Math.Between(100, 924),
        Phaser.Math.Between(100, 668),
        "⭐",
        { fontSize: Phaser.Math.Between(20, 40) }
      ).setDepth(101);
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        scale: { from: 0, to: 1.5 },
        duration: 1500,
        delay: i * 30,
        onComplete: () => particle.destroy()
      });
    }

    // Compléter tous les niveaux avec 3 étoiles
    const levels = ["tictactoe", "carrace", "minigolf", "babyfoot"];
    levels.forEach(level => {
      GameState.completeLevel(level, 3);
    });

    // Message de victoire
    this.time.delayedCall(800, () => {
      this.showVictoryMessage();
    });
  }

  showVictoryMessage() {
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.85);
    overlay.setDepth(200);

    const popup = this.add.container(512, 384);
    popup.setDepth(201);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRoundedRect(-300, -220, 600, 440, 25);
    bg.lineStyle(4, 0xf7c531);
    bg.strokeRoundedRect(-300, -220, 600, 440, 25);

    const ninja = this.add.text(0, -160, "🥷", { fontSize: 60 }).setOrigin(0.5);

    const title = this.add.text(0, -80, "✨ YAZAN EST LIBRE! ✨", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#f7c531"
    }).setOrigin(0.5);

    const message = this.add.text(0, 40, 
      "Grâce à ta magie, Yazan a vaincu\ntous les défis et s'est échappé\ndu monde ninja!\n\n🎉 FÉLICITATIONS! 🎉", {
      fontFamily: "Arial",
      fontSize: 18,
      color: "#ffffff",
      align: "center",
      lineSpacing: 8
    }).setOrigin(0.5);

    // Bouton fermer
    const closeBtn = this.add.container(0, 170);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xff6b35);
    closeBg.fillRoundedRect(-80, -20, 160, 40, 10);
    const closeText = this.add.text(0, 0, "🎮 Continuer", {
      fontFamily: "Arial Black",
      fontSize: 18,
      color: "#ffffff"
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(160, 40);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => {
      popup.destroy();
      overlay.destroy();
      this.scene.restart();
    });

    popup.add([bg, ninja, title, message, closeBtn]);

    // Animation d'apparition
    popup.setScale(0);
    this.tweens.add({
      targets: popup,
      scale: 1,
      duration: 500,
      ease: "Back.easeOut"
    });

    // Animation du ninja (légère)
    this.tweens.add({
      targets: ninja,
      y: ninja.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color);
    bg.fillRoundedRect(-50, -18, 100, 36, 8);

    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(100, 36);
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
