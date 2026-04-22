import * as Phaser from "phaser";
import { Scene } from "phaser";

/**
 * Scène Game Over - Yazan Escape Adventure
 * Affichée quand le joueur termine le jeu ou quitte
 */
export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    // Fond
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg").setAlpha(0.5);
    }
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // Overlay sombre
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);

    // Titre
    this.add
      .text(512, 250, "🥷 PARTIE TERMINÉE", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ff6b35",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Message
    this.add
      .text(512, 340, "Merci d'avoir joué à\nYazan Escape Adventure!", {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Bouton retour au menu
    const menuBtn = this.createButton(
      512,
      450,
      "🏠 Menu Principal",
      0xff6b35,
      () => {
        this.scene.start("MainMenu");
      },
    );

    // Bouton rejouer
    const replayBtn = this.createButton(
      512,
      520,
      "🔄 Rejouer",
      0x2ecc71,
      () => {
        this.scene.start("WorldMap");
      },
    );

    // Animation d'entrée
    this.cameras.main.fadeIn(500);

    // Animation des particules
    this.createParticles();
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-122, -28, 244, 56, 15);
    bg.fillStyle(color);
    bg.fillRoundedRect(-120, -25, 240, 50, 12);

    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(240, 56);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });
    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on("pointerdown", () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback,
      });
    });

    // Animation d'entrée
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 400,
      delay: 300,
      ease: "Back.easeOut",
    });

    return container;
  }

  createParticles() {
    // Particules flottantes
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 1024),
        Phaser.Math.Between(600, 800),
        Phaser.Math.Between(2, 5),
        Phaser.Math.Between(0, 1) ? 0xff6b35 : 0xf7c531,
        0.4,
      );

      this.tweens.add({
        targets: particle,
        y: -50,
        alpha: 0,
        duration: Phaser.Math.Between(5000, 10000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, 1024);
          particle.y = 800;
          particle.alpha = 0.4;
        },
      });
    }
  }
}
