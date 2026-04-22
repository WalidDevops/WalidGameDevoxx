import * as Phaser from "phaser";
import { Scene } from "phaser";
import { GameState, GOODIES_DATA } from "../../services/GameState.js";

/**
 * Scène Inventaire des Goodies - Yazan Escape Adventure
 * Affiche les goodies collectés avec leurs informations éducatives
 */
export class InventoryScene extends Scene {
  constructor() {
    super("InventoryScene");
    this.currentPage = 0;
    this.itemsPerPage = 6;
    this.selectedGoodie = null;
  }

  create() {
    this.currentPage = 0;
    this.selectedGoodie = null;

    // Fond
    this.createBackground();

    // Interface
    this.createUI();

    // Grille des goodies
    this.createGoodiesGrid();

    // Animation d'entrée
    this.cameras.main.fadeIn(300);
  }

  createBackground() {
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg");
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Overlay décoratif
    const overlay = this.add.graphics();
    overlay.fillStyle(0x9b59b6, 0.1);
    overlay.fillRect(0, 0, 1024, 768);
  }

  createUI() {
    // Titre
    this.add
      .text(512, 50, "🎁 MES GOODIES ÉDUCATIFS", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#f7c531",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // Statistiques
    const progress = GameState.getProgress();
    const collected = progress.goodies.length;
    const total = GOODIES_DATA.length;

    this.add
      .text(512, 100, `Collection: ${collected} / ${total}`, {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Barre de progression
    const barBg = this.add.rectangle(512, 130, 300, 15, 0x2c3e50);
    const barFill = this.add.rectangle(
      362 + (300 * collected) / total / 2,
      130,
      (300 * collected) / total,
      11,
      0x9b59b6,
    );

    // Bouton retour
    this.createButton(80, 50, "← Retour", 0xe74c3c, () => {
      this.scene.start("WorldMap");
    });

    // Zone de détail du goodie sélectionné
    this.createDetailPanel();
  }

  createDetailPanel() {
    this.detailContainer = this.add.container(770, 450);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-200, -150, 400, 300, 20);
    bg.lineStyle(3, 0x9b59b6);
    bg.strokeRoundedRect(-200, -150, 400, 300, 20);

    this.detailContainer.add(bg);

    // Texte par défaut
    this.detailTitle = this.add
      .text(0, -110, "Sélectionne un goodie!", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    this.detailIcon = this.add
      .text(0, -40, "❓", {
        fontSize: 60,
      })
      .setOrigin(0.5);

    this.detailDesc = this.add
      .text(
        0,
        50,
        "Clique sur un goodie\npour voir ses détails\net son message éducatif!",
        {
          fontFamily: "Arial",
          fontSize: 14,
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 350 },
        },
      )
      .setOrigin(0.5);

    this.detailCategory = this.add
      .text(0, 120, "", {
        fontFamily: "Arial",
        fontSize: 12,
        color: "#9b59b6",
      })
      .setOrigin(0.5);

    this.detailContainer.add([
      this.detailTitle,
      this.detailIcon,
      this.detailDesc,
      this.detailCategory,
    ]);
  }

  createGoodiesGrid() {
    this.goodiesContainer = this.add.container(250, 400);

    const progress = GameState.getProgress();
    const collectedIds = progress.goodies;

    // Afficher tous les goodies (collectés ou non)
    GOODIES_DATA.forEach((goodie, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = col * 180;
      const y = row * 120 - 150;

      const isCollected = collectedIds.includes(goodie.id);
      this.createGoodieCard(x, y, goodie, isCollected);
    });
  }

  createGoodieCard(x, y, goodie, isCollected) {
    const container = this.add.container(x, y);

    // Fond de la carte
    const bg = this.add.graphics();
    bg.fillStyle(isCollected ? 0x2c3e50 : 0x1a1a2e, 0.9);
    bg.fillRoundedRect(-75, -50, 150, 100, 15);
    bg.lineStyle(
      3,
      isCollected ? this.getCategoryColor(goodie.category) : 0x7f8c8d,
    );
    bg.strokeRoundedRect(-75, -50, 150, 100, 15);

    container.add(bg);

    // Icône
    const icon = this.add
      .text(0, -15, isCollected ? goodie.icon : "🔒", {
        fontSize: isCollected ? 36 : 24,
      })
      .setOrigin(0.5);

    // Nom
    const name = this.add
      .text(0, 25, isCollected ? goodie.name : "???", {
        fontFamily: "Arial",
        fontSize: 12,
        color: isCollected ? "#ffffff" : "#7f8c8d",
      })
      .setOrigin(0.5);

    container.add([icon, name]);

    // Interaction si collecté
    if (isCollected) {
      const hitArea = this.add.rectangle(0, 0, 150, 100, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on("pointerover", () => {
        this.tweens.add({
          targets: container,
          scale: 1.1,
          duration: 100,
        });
        bg.clear();
        bg.fillStyle(0x3c5d7c, 0.9);
        bg.fillRoundedRect(-75, -50, 150, 100, 15);
        bg.lineStyle(3, this.getCategoryColor(goodie.category));
        bg.strokeRoundedRect(-75, -50, 150, 100, 15);
      });

      hitArea.on("pointerout", () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 100,
        });
        bg.clear();
        bg.fillStyle(0x2c3e50, 0.9);
        bg.fillRoundedRect(-75, -50, 150, 100, 15);
        bg.lineStyle(3, this.getCategoryColor(goodie.category));
        bg.strokeRoundedRect(-75, -50, 150, 100, 15);
      });

      hitArea.on("pointerdown", () => {
        this.showGoodieDetails(goodie);
      });

      // Effet de brillance pour les collectés
      const glow = this.add.circle(
        0,
        -15,
        25,
        this.getCategoryColor(goodie.category),
        0.2,
      );
      container.add(glow);
      container.sendToBack(glow);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.1, to: 0.4 },
        scale: { from: 1, to: 1.3 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });
    }

    this.goodiesContainer.add(container);
  }

  getCategoryColor(category) {
    const colors = {
      ia: 0x3498db,
      valeurs: 0xe74c3c,
      education: 0x2ecc71,
    };
    return colors[category] || 0x9b59b6;
  }

  getCategoryName(category) {
    const names = {
      ia: "🤖 Intelligence Artificielle",
      valeurs: "❤️ Valeurs de Vie",
      education: "📚 Éducation",
    };
    return names[category] || category;
  }

  showGoodieDetails(goodie) {
    this.selectedGoodie = goodie;

    // Animer le panneau de détails
    this.tweens.add({
      targets: this.detailContainer,
      scale: { from: 0.9, to: 1 },
      duration: 200,
      ease: "Back.easeOut",
    });

    // Mettre à jour les textes
    this.detailTitle.setText(goodie.name);
    this.detailIcon.setText(goodie.icon);
    this.detailDesc.setText(goodie.description);
    this.detailCategory.setText(this.getCategoryName(goodie.category));

    // Effet visuel
    this.cameras.main.flash(100, 155, 89, 182, false);
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
