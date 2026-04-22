import { Scene } from "phaser";

/**
 * Scène de préchargement - Yazan Escape Adventure
 * Charge tous les assets du jeu avec une barre de progression stylisée
 */
export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // Fond dégradé
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg");
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Titre du jeu pendant le chargement
    this.add
      .text(512, 250, "🥷 YAZAN ESCAPE", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ff6b35",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(512, 310, "ADVENTURE", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Cadre de la barre de progression
    const barBg = this.add.rectangle(512, 400, 468, 40, 0x000000, 0.8);
    barBg.setStrokeStyle(3, 0xff6b35);

    // Barre de progression
    this.progressBar = this.add.rectangle(512 - 230, 400, 4, 32, 0xff6b35);

    // Texte de chargement
    this.loadText = this.add
      .text(512, 450, "Chargement...", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Événement de progression
    this.load.on("progress", (progress) => {
      this.progressBar.width = 4 + 456 * progress;
      this.loadText.setText(`Chargement... ${Math.floor(progress * 100)}%`);
    });

    this.load.on("complete", () => {
      this.loadText.setText("Prêt!");
    });
  }

  preload() {
    this.load.setPath("assets");

    // Logo du jeu
    this.load.image("logo", "logo.png");

    // On génère les textures dynamiquement
    this.createGameTextures();
  }

  create() {
    // Créer toutes les textures de jeu dynamiquement
    this.generateAllTextures();

    // Transition vers le menu principal
    this.time.delayedCall(500, () => {
      this.scene.start("MainMenu");
    });
  }

  /**
   * Crée les textures du jeu dynamiquement
   */
  createGameTextures() {
    // Cette méthode prépare le terrain pour la génération
  }

  /**
   * Génère toutes les textures de jeu
   */
  generateAllTextures() {
    // Bouton principal
    this.createButtonTexture("btn_play", 0xff6b35, 200, 60);
    this.createButtonTexture("btn_login", 0x4a90d9, 200, 60);
    this.createButtonTexture("btn_small", 0x2ecc71, 150, 50);
    this.createButtonTexture("btn_back", 0xe74c3c, 120, 45);

    // Avatar ninja
    this.createNinjaAvatar();

    // Icônes de niveaux
    this.createLevelIcons();

    // Éléments XO
    this.createXOTextures();

    // Éléments voiture
    this.createCarTextures();

    // Goodies
    this.createGoodieTextures();
  }

  createButtonTexture(key, color, width, height) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Ombre
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(4, 4, width, height, 12);

    // Bouton principal
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, width, height, 12);

    // Reflet
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRoundedRect(4, 4, width - 8, height / 2 - 4, 8);

    graphics.generateTexture(key, width + 4, height + 4);
    graphics.destroy();
  }

  createNinjaAvatar() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const size = 80;

    // Corps
    graphics.fillStyle(0x2c3e50);
    graphics.fillCircle(40, 50, 30);

    // Tête
    graphics.fillStyle(0xf5d0a9);
    graphics.fillCircle(40, 25, 20);

    // Bandeau ninja
    graphics.fillStyle(0xff6b35);
    graphics.fillRect(18, 18, 44, 8);

    // Yeux
    graphics.fillStyle(0x000000);
    graphics.fillCircle(33, 23, 4);
    graphics.fillCircle(47, 23, 4);

    graphics.generateTexture("ninja_avatar", size, size);
    graphics.destroy();
  }

  createLevelIcons() {
    const levels = [
      { key: "icon_tictactoe", emoji: "⭕", color: 0x3498db },
      { key: "icon_carrace", emoji: "🏎️", color: 0xe74c3c },
      { key: "icon_minigolf", emoji: "⛳", color: 0x2ecc71 },
      { key: "icon_babyfoot", emoji: "⚽", color: 0xf39c12 },
    ];

    levels.forEach((level) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      // Fond circulaire
      graphics.fillStyle(level.color);
      graphics.fillCircle(50, 50, 45);

      // Bordure
      graphics.lineStyle(4, 0xffffff);
      graphics.strokeCircle(50, 50, 45);

      graphics.generateTexture(level.key, 100, 100);
      graphics.destroy();
    });

    // Icône verrouillée
    const lockGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    lockGraphics.fillStyle(0x7f8c8d);
    lockGraphics.fillCircle(50, 50, 45);
    lockGraphics.lineStyle(4, 0x95a5a6);
    lockGraphics.strokeCircle(50, 50, 45);

    // Cadenas
    lockGraphics.fillStyle(0x2c3e50);
    lockGraphics.fillRect(35, 45, 30, 25);
    lockGraphics.lineStyle(5, 0x2c3e50);
    lockGraphics.strokeCircle(50, 45, 12);

    lockGraphics.generateTexture("icon_locked", 100, 100);
    lockGraphics.destroy();
  }

  createXOTextures() {
    // X
    const xGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    xGraphics.lineStyle(12, 0xff6b35);
    xGraphics.lineBetween(15, 15, 85, 85);
    xGraphics.lineBetween(85, 15, 15, 85);
    xGraphics.generateTexture("xo_x", 100, 100);
    xGraphics.destroy();

    // O
    const oGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    oGraphics.lineStyle(12, 0x3498db);
    oGraphics.strokeCircle(50, 50, 35);
    oGraphics.generateTexture("xo_o", 100, 100);
    oGraphics.destroy();

    // Grille
    const gridGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    gridGraphics.lineStyle(6, 0xffffff);
    // Lignes verticales
    gridGraphics.lineBetween(100, 10, 100, 290);
    gridGraphics.lineBetween(200, 10, 200, 290);
    // Lignes horizontales
    gridGraphics.lineBetween(10, 100, 290, 100);
    gridGraphics.lineBetween(10, 200, 290, 200);
    gridGraphics.generateTexture("xo_grid", 300, 300);
    gridGraphics.destroy();
  }

  createCarTextures() {
    // Voiture du joueur
    const carGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    carGraphics.fillStyle(0xff6b35);
    carGraphics.fillRoundedRect(0, 10, 50, 30, 8);
    carGraphics.fillStyle(0x2c3e50);
    carGraphics.fillCircle(12, 40, 8);
    carGraphics.fillCircle(38, 40, 8);
    carGraphics.generateTexture("car_player", 50, 50);
    carGraphics.destroy();

    // Obstacle
    const obstacleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    obstacleGraphics.fillStyle(0xe74c3c);
    obstacleGraphics.fillRect(0, 0, 40, 40);
    obstacleGraphics.generateTexture("car_obstacle", 40, 40);
    obstacleGraphics.destroy();

    // Collectible (étoile dessinée manuellement)
    const collectGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectGraphics.fillStyle(0xf7c531);
    // Dessiner une étoile à 5 branches
    const cx = 20,
      cy = 20,
      outerRadius = 18,
      innerRadius = 8,
      points = 5;
    const starPoints = [];
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      starPoints.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
    collectGraphics.beginPath();
    collectGraphics.moveTo(starPoints[0].x, starPoints[0].y);
    for (let i = 1; i < starPoints.length; i++) {
      collectGraphics.lineTo(starPoints[i].x, starPoints[i].y);
    }
    collectGraphics.closePath();
    collectGraphics.fillPath();
    collectGraphics.generateTexture("car_star", 40, 40);
    collectGraphics.destroy();

    // Route
    const roadGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    roadGraphics.fillStyle(0x34495e);
    roadGraphics.fillRect(0, 0, 200, 768);
    roadGraphics.fillStyle(0xf7c531);
    for (let y = 0; y < 768; y += 60) {
      roadGraphics.fillRect(95, y, 10, 40);
    }
    roadGraphics.generateTexture("road", 200, 768);
    roadGraphics.destroy();
  }

  createGoodieTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Boîte à goodies
    graphics.fillStyle(0xf7c531);
    graphics.fillRoundedRect(0, 0, 60, 60, 10);
    graphics.lineStyle(3, 0xe67e22);
    graphics.strokeRoundedRect(0, 0, 60, 60, 10);
    graphics.fillStyle(0xe67e22);
    graphics.fillRect(0, 25, 60, 6);

    graphics.generateTexture("goodie_box", 60, 60);
    graphics.destroy();
  }
}
