import { Scene } from "phaser";
import { AuthService } from "../../services/AuthService.js";

/**
 * Scène d'Authentification - Yazan Escape Adventure
 * Gère la connexion et l'inscription des joueurs
 */
export class AuthScene extends Scene {
  constructor() {
    super("AuthScene");
    this.isLoginMode = true;
    this.inputFields = {};
    this.errorText = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Fond
    if (this.textures.exists("gradient_bg")) {
      this.add.image(512, 384, "gradient_bg");
    } else {
      this.cameras.main.setBackgroundColor(0x1a1a2e);
    }

    // Titre
    this.add
      .text(centerX, 80, "🥷 YAZAN ESCAPE", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#ff6b35",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Panneau de formulaire
    this.createFormPanel(centerX);

    // Bouton retour
    this.createBackButton();

    // Bouton aide (histoire du jeu)
    this.createHelpButton();

    // Animation d'entrée
    this.cameras.main.fadeIn(300);
  }

  createHelpButton() {
    const helpBtn = this.add.container(950, 50);

    // Fond du bouton
    const bg = this.add.graphics();
    bg.fillStyle(0x9b59b6);
    bg.fillCircle(0, 0, 22);
    bg.lineStyle(3, 0xffffff);
    bg.strokeCircle(0, 0, 22);

    // Icône
    const icon = this.add
      .text(0, 0, "?", {
        fontFamily: "Arial Black",
        fontSize: 26,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    helpBtn.add([bg, icon]);
    helpBtn.setSize(50, 50);
    helpBtn.setInteractive({ useHandCursor: true });
    helpBtn.setDepth(100); // Au premier plan

    // Animation de pulsation
    this.tweens.add({
      targets: helpBtn,
      scale: { from: 1, to: 1.15 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    helpBtn.on("pointerover", () => {
      this.tweens.add({ targets: helpBtn, scale: 1.2, duration: 100 });
    });

    helpBtn.on("pointerout", () => {
      this.tweens.add({ targets: helpBtn, scale: 1, duration: 100 });
    });

    helpBtn.on("pointerdown", () => {
      this.showStoryPopup();
    });
  }

  showStoryPopup() {
    // Overlay sombre
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.85);
    overlay.setInteractive();

    // Popup container
    const popup = this.add.container(512, 384);

    // Fond du popup
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRoundedRect(-350, -280, 700, 560, 25);
    bg.lineStyle(4, 0xff6b35);
    bg.strokeRoundedRect(-350, -280, 700, 560, 25);

    // Titre
    const title = this.add
      .text(0, -240, "📖 L'HISTOIRE DE YAZAN", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#f7c531",
      })
      .setOrigin(0.5);

    // Histoire du jeu
    const storyText = `
🥷 Dans un monde parallèle mystérieux, le jeune ninja Yazan
s'est retrouvé piégé dans une dimension inconnue !

🌟 Pour s'échapper et retrouver son foyer, il doit traverser
différents défis et prouver sa valeur en tant que ninja.

🎮 COMMENT JOUER :
• Complète les mini-jeux pour avancer
• Collecte les goodies éducatifs
• Apprends des choses sur l'IA et les valeurs de vie !

⭕ Dojo XO : Affronte le maître du morpion
🏎️ Course Ninja : Évite les obstacles à toute vitesse
⛳ Golf Zen : Vise avec précision et calme
⚽ Arena Foot : Marque des buts contre l'IA

✨ Chaque victoire te rapproche de la liberté !
Bonne chance, jeune ninja ! 🍀
    `;

    const story = this.add
      .text(0, 20, storyText.trim(), {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#ffffff",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    // Bouton fermer
    const closeBtn = this.add.container(0, 230);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xff6b35);
    closeBg.fillRoundedRect(-80, -20, 160, 40, 10);

    const closeText = this.add
      .text(0, 0, "✖ Fermer", {
        fontFamily: "Arial Black",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(160, 40);
    closeBtn.setInteractive({ useHandCursor: true });

    closeBtn.on("pointerover", () => {
      this.tweens.add({ targets: closeBtn, scale: 1.1, duration: 100 });
    });

    closeBtn.on("pointerout", () => {
      this.tweens.add({ targets: closeBtn, scale: 1, duration: 100 });
    });

    closeBtn.on("pointerdown", () => {
      popup.destroy();
      overlay.destroy();
    });

    popup.add([bg, title, story, closeBtn]);

    // Animation d'apparition
    popup.setScale(0);
    this.tweens.add({
      targets: popup,
      scale: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  createFormPanel(centerX) {
    // Conteneur du formulaire
    this.formContainer = this.add.container(centerX, 400);

    // Fond du panneau
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.7);
    panelBg.fillRoundedRect(-250, -220, 500, 440, 20);
    panelBg.lineStyle(3, 0xff6b35);
    panelBg.strokeRoundedRect(-250, -220, 500, 440, 20);

    this.formContainer.add(panelBg);

    // Titre du mode
    this.modeTitle = this.add
      .text(0, -180, "🔐 CONNEXION", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#f7c531",
      })
      .setOrigin(0.5);
    this.formContainer.add(this.modeTitle);

    // Créer les champs de formulaire
    this.createInputFields();

    // Bouton de soumission
    this.submitBtn = this.createButton(0, 100, "SE CONNECTER", 0xff6b35, () => {
      this.handleSubmit();
    });
    this.formContainer.add(this.submitBtn);

    // Lien pour changer de mode
    this.toggleText = this.add
      .text(0, 160, "Pas de compte? S'inscrire", {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#4a90d9",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.toggleText.on("pointerdown", () => this.toggleMode());
    this.toggleText.on("pointerover", () =>
      this.toggleText.setColor("#6ba5e7"),
    );
    this.toggleText.on("pointerout", () => this.toggleText.setColor("#4a90d9"));
    this.formContainer.add(this.toggleText);

    // Message d'erreur
    this.errorText = this.add
      .text(0, 200, "", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#e74c3c",
        align: "center",
      })
      .setOrigin(0.5);
    this.formContainer.add(this.errorText);
  }

  createInputFields() {
    const fields = this.isLoginMode
      ? ["email", "password"]
      : ["username", "email", "password"];

    const startY = this.isLoginMode ? -80 : -110;
    const spacing = 70;

    // Nettoyer les anciens champs
    if (this.inputElements) {
      this.inputElements.forEach((el) => el.remove());
    }
    this.inputElements = [];

    fields.forEach((field, index) => {
      const y = startY + index * spacing;

      // Label
      const labels = {
        username: "👤 Nom de ninja",
        email: "📧 Email",
        password: "🔑 Mot de passe",
      };

      const label = this.add.text(-200, y - 15, labels[field], {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      });
      this.formContainer.add(label);

      // Champ de saisie HTML
      const input = this.createHTMLInput(field, y);
      this.inputFields[field] = input;
    });
  }

  createHTMLInput(name, y) {
    const gameCanvas = this.game.canvas;
    const rect = gameCanvas.getBoundingClientRect();

    const input = document.createElement("input");
    input.type =
      name === "password" ? "password" : name === "email" ? "email" : "text";
    input.placeholder =
      name === "username"
        ? "Ex: NinjaShadow"
        : name === "email"
          ? "Ex: yazan@ninja.com"
          : "••••••••";
    input.id = `auth_${name}`;

    // Styles
    input.style.cssText = `
            position: absolute;
            width: 380px;
            height: 40px;
            padding: 0 15px;
            font-size: 16px;
            border: 2px solid #ff6b35;
            border-radius: 10px;
            background: rgba(26, 26, 46, 0.9);
            color: #ffffff;
            outline: none;
            font-family: Arial, sans-serif;
        `;

    // Positionnement
    const scaleX = rect.width / 1024;
    const scaleY = rect.height / 768;

    input.style.left = `${rect.left + (512 - 190) * scaleX}px`;
    input.style.top = `${rect.top + (400 + y) * scaleY}px`;
    input.style.transform = `scale(${Math.min(scaleX, scaleY)})`;
    input.style.transformOrigin = "top left";

    document.body.appendChild(input);
    this.inputElements.push(input);

    // Focus style
    input.addEventListener("focus", () => {
      input.style.borderColor = "#f7c531";
      input.style.boxShadow = "0 0 10px rgba(247, 197, 49, 0.5)";
    });
    input.addEventListener("blur", () => {
      input.style.borderColor = "#ff6b35";
      input.style.boxShadow = "none";
    });

    // Entrée pour soumettre
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSubmit();
      }
    });

    return input;
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-102, -22, 204, 44, 12);
    bg.fillStyle(color);
    bg.fillRoundedRect(-100, -20, 200, 40, 10);

    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Arial Black",
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(200, 40);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
    });
    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on("pointerdown", callback);

    return container;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;

    // Mettre à jour le titre
    this.modeTitle.setText(
      this.isLoginMode ? "🔐 CONNEXION" : "📝 INSCRIPTION",
    );

    // Mettre à jour le texte du bouton de soumission
    this.submitBtn
      .getAt(1)
      .setText(this.isLoginMode ? "SE CONNECTER" : "S'INSCRIRE");

    // Mettre à jour le lien
    this.toggleText.setText(
      this.isLoginMode
        ? "Pas de compte? S'inscrire"
        : "Déjà un compte? Se connecter",
    );

    // Recréer les champs
    this.createInputFields();

    // Effacer l'erreur
    this.errorText.setText("");
  }

  handleSubmit() {
    const email = this.inputFields["email"]?.value || "";
    const password = this.inputFields["password"]?.value || "";
    const username = this.inputFields["username"]?.value || "";

    // Validation
    if (!email || !password) {
      this.showError("Veuillez remplir tous les champs!");
      return;
    }

    if (!this.isLoginMode && !username) {
      this.showError("Le nom de ninja est requis!");
      return;
    }

    if (!this.isLoginMode && username.length < 3) {
      this.showError("Le nom doit avoir au moins 3 caractères!");
      return;
    }

    if (password.length < 4) {
      this.showError("Le mot de passe doit avoir au moins 4 caractères!");
      return;
    }

    // Tentative d'authentification
    let result;
    if (this.isLoginMode) {
      result = AuthService.login(email, password);
    } else {
      result = AuthService.register(username, email, password);
    }

    if (result.success) {
      this.showSuccess("Bienvenue, " + result.user.username + "!");

      // Nettoyage et transition
      this.time.delayedCall(1000, () => {
        this.cleanupInputs();
        this.scene.start("MainMenu");
      });
    } else {
      this.showError(result.message);
    }
  }

  showError(message) {
    this.errorText.setText(message);
    this.errorText.setColor("#e74c3c");

    // Animation de secousse
    this.tweens.add({
      targets: this.formContainer,
      x: { from: 512 - 10, to: 512 + 10 },
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.formContainer.x = 512;
      },
    });
  }

  showSuccess(message) {
    this.errorText.setText(message);
    this.errorText.setColor("#2ecc71");
  }

  createBackButton() {
    const backBtn = this.add.container(80, 50);

    const bg = this.add.graphics();
    bg.fillStyle(0xe74c3c);
    bg.fillRoundedRect(-40, -18, 80, 36, 8);

    const label = this.add
      .text(0, 0, "← Retour", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    backBtn.add([bg, label]);
    backBtn.setSize(80, 36);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on("pointerdown", () => {
      this.cleanupInputs();
      this.scene.start("MainMenu");
    });
  }

  cleanupInputs() {
    if (this.inputElements) {
      this.inputElements.forEach((el) => el.remove());
      this.inputElements = [];
    }
    this.inputFields = {};
  }

  shutdown() {
    this.cleanupInputs();
  }
}
