import * as Phaser from "phaser";
import { Scene } from "phaser";

/**
 * Scène de démarrage - Yazan Escape Adventure
 * Charge les assets minimaux pour le preloader
 */
export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // Charger le fond pour le preloader
    this.load.image("background", "assets/bg.png");

    // Créer une texture de fond dégradé si l'image n'existe pas
    this.createGradientBackground();
  }

  create() {
    // Configurer les paramètres globaux du jeu
    this.game.config.gameTitle = "Yazan Escape Adventure";

    // Passer au preloader
    this.scene.start("Preloader");
  }

  /**
   * Crée un fond dégradé par défaut
   */
  createGradientBackground() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Dégradé ninja (bleu foncé vers violet)
    for (let y = 0; y < 768; y++) {
      const ratio = y / 768;
      const r = Math.floor(26 + (80 - 26) * ratio);
      const g = Math.floor(26 + (40 - 26) * ratio);
      const b = Math.floor(46 + (120 - 46) * ratio);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, 1024, 1);
    }

    graphics.generateTexture("gradient_bg", 1024, 768);
    graphics.destroy();
  }
}
