import * as Phaser from "phaser";
import { Scene } from "phaser";
import { AuthService } from "../../services/AuthService.js";
import { GameState } from "../../services/GameState.js";

/**
 * Menu Principal - Yazan Escape Adventure
 * Écran d'accueil avec boutons Jouer, Connexion et informations
 */
export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Fond animé
    this.createAnimatedBackground();

    // Logo et titre
    this.createTitle(centerX);

    // Avatar ninja animé
    this.createNinjaCharacter(centerX);

    // Boutons du menu
    this.createMenuButtons(centerX);

    // Informations utilisateur si connecté
    this.showUserInfo();

    // Particules décoratives
    this.createParticles();

    // Animation d'entrée
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  createAnimatedBackground() {
    // Fond principal
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg");
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Étoiles scintillantes en arrière-plan
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 1024);
      const y = Phaser.Math.Between(0, 400);
      const star = this.add.circle(
        x,
        y,
        Phaser.Math.Between(1, 3),
        0xffffff,
        0.5,
      );

      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  createTitle(centerX) {
    // Titre principal avec effet
    const titleText = this.add
      .text(centerX, 100, "🥷 YAZAN", {
        fontFamily: "Arial Black",
        fontSize: 72,
        color: "#ff6b35",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const subtitleText = this.add
      .text(centerX, 170, "ESCAPE ADVENTURE", {
        fontFamily: "Arial Black",
        fontSize: 42,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Animation du titre
    this.tweens.add({
      targets: titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Sous-titre descriptif
    this.add
      .text(centerX, 220, "Aide Yazan à s'échapper du monde ninja!", {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffffff",
        fontStyle: "italic",
      })
      .setOrigin(0.5);
  }

  createNinjaCharacter(centerX) {
    // Avatar ninja au centre
    const ninja = this.add.image(centerX, 340, "ninja_avatar").setScale(2);

    // Animation de flottement
    this.tweens.add({
      targets: ninja,
      y: ninja.y - 15,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Effet de brillance autour du ninja
    const glow = this.add.circle(centerX, 340, 90, 0xff6b35, 0.2);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.4 },
      scale: { from: 1, to: 1.2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  createMenuButtons(centerX) {
    const buttonStyle = {
      fontFamily: "Arial Black",
      fontSize: 24,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    };

    // Bouton JOUER
    const playBtn = this.createButton(
      centerX,
      480,
      "🎮 JOUER",
      0xff6b35,
      () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.start("WorldMap");
        });
      },
    );

    // Bouton CONNEXION / PROFIL
    const user = AuthService.getCurrentUser();
    const authText = user ? "👤 " + user.username : "🔐 CONNEXION";
    const authBtn = this.createButton(centerX, 560, authText, 0x4a90d9, () => {
      if (user) {
        // Afficher le profil / déconnexion
        this.showProfileMenu();
      } else {
        this.scene.start("AuthScene");
      }
    });

    // Bouton GOODIES (si connecté et a des goodies)
    const progress = GameState.getProgress();
    if (progress.goodies.length > 0) {
      this.createButton(centerX, 640, "🎁 MES GOODIES", 0x9b59b6, () => {
        this.scene.start("InventoryScene");
      });
    }

    // Animation d'entrée des boutons
    [playBtn, authBtn].forEach((btn, index) => {
      btn.setScale(0);
      this.tweens.add({
        targets: btn,
        scale: 1,
        duration: 400,
        delay: 200 + index * 100,
        ease: "Back.easeOut",
      });
    });
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

    // Fond du bouton
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-120, -28, 240, 56, 15);
    bg.fillStyle(color);
    bg.fillRoundedRect(-115, -25, 230, 50, 12);

    // Reflet
    bg.fillStyle(0xffffff, 0.2);
    bg.fillRoundedRect(-110, -22, 220, 20, 8);

    // Texte
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

    // Effets hover
    container.on("pointerover", () => {
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100,
      });
    });

    container.on("pointerout", () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
      });
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

    return container;
  }

  showUserInfo() {
    const user = AuthService.getCurrentUser();
    if (user) {
      const progress = GameState.getProgress();

      // Badge utilisateur en haut à droite
      const badge = this.add.container(920, 50);

      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0x000000, 0.7);
      badgeBg.fillRoundedRect(-80, -25, 160, 50, 10);

      const starText = this.add
        .text(
          0,
          0,
          `⭐ ${progress.totalStars}  🎁 ${progress.goodies.length}`,
          {
            fontFamily: "Arial",
            fontSize: 18,
            color: "#f7c531",
          },
        )
        .setOrigin(0.5);

      badge.add([badgeBg, starText]);
    }
  }

  showProfileMenu() {
    // Menu popup de profil
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
    overlay.setInteractive();

    const popup = this.add.container(512, 384);

    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50);
    bg.fillRoundedRect(-200, -150, 400, 300, 20);
    bg.lineStyle(3, 0xff6b35);
    bg.strokeRoundedRect(-200, -150, 400, 300, 20);

    const user = AuthService.getCurrentUser();
    const title = this.add
      .text(0, -110, "👤 " + user.username, {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ff6b35",
      })
      .setOrigin(0.5);

    const progress = GameState.getProgress();
    const stats = this.add
      .text(
        0,
        -50,
        `⭐ Étoiles: ${progress.totalStars}\n🎁 Goodies: ${progress.goodies.length}`,
        {
          fontFamily: "Arial",
          fontSize: 20,
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);

    // Bouton déconnexion
    const logoutBtn = this.createPopupButton(
      0,
      30,
      "🚪 Déconnexion",
      0xe74c3c,
      () => {
        AuthService.logout();
        popup.destroy();
        overlay.destroy();
        this.scene.restart();
      },
    );

    // Bouton fermer
    const closeBtn = this.createPopupButton(
      0,
      100,
      "✖ Fermer",
      0x7f8c8d,
      () => {
        popup.destroy();
        overlay.destroy();
      },
    );

    popup.add([bg, title, stats, logoutBtn, closeBtn]);
  }

  createPopupButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

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

    container.add([bg, label]);
    container.setSize(160, 36);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerdown", callback);

    return container;
  }

  createParticles() {
    // Particules flottantes décoratives
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 1024),
        Phaser.Math.Between(500, 768),
        Phaser.Math.Between(2, 5),
        0xff6b35,
        0.3,
      );

      this.tweens.add({
        targets: particle,
        y: -50,
        duration: Phaser.Math.Between(8000, 15000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, 1024);
          particle.y = 800;
        },
      });
    }
  }
}
