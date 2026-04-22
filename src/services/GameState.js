/**
 * Service de gestion de l'état du jeu
 * Gère la progression, les goodies et les statistiques
 */

import { StorageService } from "./StorageService.js";
import { AuthService } from "./AuthService.js";

// Définition des goodies éducatifs
export const GOODIES_DATA = [
  {
    id: "ai_basics",
    name: "Cerveau IA",
    icon: "🧠",
    description:
      "L'Intelligence Artificielle apprend grâce aux données, comme toi tu apprends à l'école!",
    category: "ia",
    level: "tictactoe",
  },
  {
    id: "robot_friend",
    name: "Robot Ami",
    icon: "🤖",
    description:
      "Les robots sont programmés par des humains pour nous aider dans plein de tâches!",
    category: "ia",
    level: "tictactoe",
  },
  {
    id: "share_heart",
    name: "Cœur du Partage",
    icon: "💝",
    description: "Partager avec ses amis rend tout le monde plus heureux!",
    category: "valeurs",
    level: "carrace",
  },
  {
    id: "logic_star",
    name: "Étoile Logique",
    icon: "⭐",
    description:
      "La logique nous aide à résoudre des problèmes en réfléchissant étape par étape.",
    category: "education",
    level: "carrace",
  },
  {
    id: "teamwork_badge",
    name: "Badge Équipe",
    icon: "🏅",
    description:
      "Ensemble, on est plus forts! Le travail d'équipe permet de réaliser de grandes choses.",
    category: "valeurs",
    level: "minigolf",
  },
  {
    id: "data_crystal",
    name: "Cristal de Données",
    icon: "💎",
    description:
      "Les données sont comme des informations que l'ordinateur utilise pour apprendre.",
    category: "ia",
    level: "minigolf",
  },
  {
    id: "respect_shield",
    name: "Bouclier du Respect",
    icon: "🛡️",
    description:
      "Le respect des autres est la base de toute amitié. Sois gentil avec tout le monde!",
    category: "valeurs",
    level: "babyfoot",
  },
  {
    id: "code_scroll",
    name: "Parchemin du Code",
    icon: "📜",
    description:
      "Le code informatique est comme une recette que l'ordinateur suit pour créer des programmes!",
    category: "education",
    level: "babyfoot",
  },
];

// Questions éducatives pour chaque niveau
export const EDUCATIONAL_QUESTIONS = {
  tictactoe: [
    {
      question: "Qu'est-ce qu'une Intelligence Artificielle?",
      options: [
        "Un robot très intelligent",
        "Un programme qui peut apprendre et décider",
        "Un ordinateur très rapide",
      ],
      correct: 1,
      explanation:
        "L'IA est un programme informatique capable d'apprendre à partir de données et de prendre des décisions!",
    },
  ],
  carrace: [
    {
      question: "Pourquoi partager est-il important?",
      options: [
        "Pour avoir plus de jouets",
        "Pour rendre les autres heureux et créer des amitiés",
        "Parce que les parents le disent",
      ],
      correct: 1,
      explanation:
        "Partager crée des liens d'amitié et rend tout le monde plus heureux!",
    },
  ],
  minigolf: [
    {
      question: "Comment fonctionne un robot?",
      options: [
        "Par magie",
        "Grâce à des programmes écrits par des humains",
        "Tout seul sans aide",
      ],
      correct: 1,
      explanation:
        "Les robots suivent des instructions programmées par des développeurs!",
    },
  ],
  babyfoot: [
    {
      question: "Que veut dire 'travailler en équipe'?",
      options: [
        "Faire tout le travail seul",
        "Collaborer et s'entraider pour atteindre un objectif commun",
        "Laisser les autres faire",
      ],
      correct: 1,
      explanation: "L'équipe permet de combiner les forces de chacun!",
    },
  ],
};

export class GameState {
  /**
   * Récupère la progression de l'utilisateur actuel
   * @returns {object} Progression du joueur
   */
  static getProgress() {
    const user = AuthService.getCurrentUser();
    const progressKey = user ? `progress_${user.userId}` : "progress_guest";
    return StorageService.load(progressKey, this.getDefaultProgress());
  }

  /**
   * Progression par défaut pour les invités
   */
  static getDefaultProgress() {
    return {
      levels: {
        tictactoe: { unlocked: true, completed: false, stars: 0 },
        carrace: { unlocked: false, completed: false, stars: 0 },
        minigolf: { unlocked: false, completed: false, stars: 0 },
        babyfoot: { unlocked: false, completed: false, stars: 0 },
      },
      goodies: [],
      totalStars: 0,
      lastPlayed: new Date().toISOString(),
    };
  }

  /**
   * Sauvegarde la progression
   * @param {object} progress - Progression à sauvegarder
   */
  static saveProgress(progress) {
    const user = AuthService.getCurrentUser();
    const progressKey = user ? `progress_${user.userId}` : "progress_guest";
    progress.lastPlayed = new Date().toISOString();
    StorageService.save(progressKey, progress);
  }

  /**
   * Complète un niveau
   * @param {string} levelId - ID du niveau
   * @param {number} stars - Étoiles obtenues (1-3)
   */
  static completeLevel(levelId, stars) {
    const progress = this.getProgress();

    if (progress.levels[levelId]) {
      progress.levels[levelId].completed = true;
      progress.levels[levelId].stars = Math.max(
        progress.levels[levelId].stars,
        stars,
      );

      // Déverrouiller le niveau suivant
      const levelOrder = ["tictactoe", "carrace", "minigolf", "babyfoot"];
      const currentIndex = levelOrder.indexOf(levelId);
      if (currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        progress.levels[nextLevel].unlocked = true;
      }

      // Calculer le total des étoiles
      progress.totalStars = Object.values(progress.levels).reduce(
        (sum, level) => sum + level.stars,
        0,
      );

      this.saveProgress(progress);
    }

    return progress;
  }

  /**
   * Ajoute un goodie à la collection
   * @param {string} goodieId - ID du goodie
   */
  static collectGoodie(goodieId) {
    const progress = this.getProgress();

    if (!progress.goodies.includes(goodieId)) {
      progress.goodies.push(goodieId);
      this.saveProgress(progress);
    }

    return progress;
  }

  /**
   * Vérifie si un goodie est collecté
   * @param {string} goodieId - ID du goodie
   * @returns {boolean}
   */
  static hasGoodie(goodieId) {
    const progress = this.getProgress();
    return progress.goodies.includes(goodieId);
  }

  /**
   * Récupère les goodies collectés avec leurs données
   * @returns {Array} Liste des goodies collectés
   */
  static getCollectedGoodies() {
    const progress = this.getProgress();
    return GOODIES_DATA.filter((g) => progress.goodies.includes(g.id));
  }

  /**
   * Récupère les goodies disponibles pour un niveau
   * @param {string} levelId - ID du niveau
   * @returns {Array} Goodies du niveau
   */
  static getGoodiesForLevel(levelId) {
    return GOODIES_DATA.filter((g) => g.level === levelId);
  }

  /**
   * Récupère une question éducative pour un niveau
   * @param {string} levelId - ID du niveau
   * @returns {object} Question aléatoire
   */
  static getQuestionForLevel(levelId) {
    const questions = EDUCATIONAL_QUESTIONS[levelId];
    if (questions && questions.length > 0) {
      return questions[Math.floor(Math.random() * questions.length)];
    }
    return null;
  }

  /**
   * Vérifie si un niveau est déverrouillé
   * @param {string} levelId - ID du niveau
   * @returns {boolean}
   */
  static isLevelUnlocked(levelId) {
    const progress = this.getProgress();
    return progress.levels[levelId]?.unlocked || false;
  }

  /**
   * Réinitialise toute la progression
   */
  static resetProgress() {
    const user = AuthService.getCurrentUser();
    if (user) {
      AuthService.initializeProgress(user.userId);
    }
  }
}
