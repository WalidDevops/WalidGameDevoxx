/**
 * Service d'authentification simple
 * Gère l'inscription, la connexion et la session utilisateur
 */

import { StorageService, STORAGE_KEYS } from "./StorageService.js";

export class AuthService {
  /**
   * Inscrit un nouvel utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @returns {object} Résultat de l'inscription
   */
  static register(username, email, password) {
    // Récupérer les utilisateurs existants
    const users = StorageService.load("yazan_users", []);

    // Vérifier si l'email existe déjà
    if (users.find((u) => u.email === email)) {
      return { success: false, message: "Cet email est déjà utilisé!" };
    }

    // Vérifier si le nom d'utilisateur existe
    if (users.find((u) => u.username === username)) {
      return { success: false, message: "Ce nom est déjà pris!" };
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: this.hashPassword(password), // Hash simple
      createdAt: new Date().toISOString(),
      avatar: "ninja_default",
    };

    // Sauvegarder
    users.push(newUser);
    StorageService.save("yazan_users", users);

    // Créer la progression initiale
    this.initializeProgress(newUser.id);

    // Connecter automatiquement
    return this.login(email, password);
  }

  /**
   * Connecte un utilisateur
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @returns {object} Résultat de la connexion
   */
  static login(email, password) {
    const users = StorageService.load("yazan_users", []);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, message: "Email non trouvé!" };
    }

    if (user.password !== this.hashPassword(password)) {
      return { success: false, message: "Mot de passe incorrect!" };
    }

    // Créer la session
    const session = {
      userId: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      loggedAt: new Date().toISOString(),
    };

    StorageService.save(STORAGE_KEYS.USER, session);

    return { success: true, user: session };
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  static logout() {
    StorageService.remove(STORAGE_KEYS.USER);
  }

  /**
   * Vérifie si un utilisateur est connecté
   * @returns {object|null} Session utilisateur ou null
   */
  static getCurrentUser() {
    return StorageService.load(STORAGE_KEYS.USER, null);
  }

  /**
   * Vérifie si un utilisateur est connecté
   * @returns {boolean}
   */
  static isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Initialise la progression pour un nouvel utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  static initializeProgress(userId) {
    const initialProgress = {
      userId,
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

    StorageService.save(`progress_${userId}`, initialProgress);
  }

  /**
   * Hash simple du mot de passe (pour demo - en prod utiliser bcrypt côté serveur)
   * @param {string} password - Mot de passe
   * @returns {string} Hash du mot de passe
   */
  static hashPassword(password) {
    // Hash simple pour démo - NE PAS UTILISER EN PRODUCTION
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Met à jour l'avatar de l'utilisateur
   * @param {string} avatar - Nom de l'avatar
   */
  static updateAvatar(avatar) {
    const user = this.getCurrentUser();
    if (user) {
      user.avatar = avatar;
      StorageService.save(STORAGE_KEYS.USER, user);

      // Mettre à jour aussi dans la liste des utilisateurs
      const users = StorageService.load("yazan_users", []);
      const userIndex = users.findIndex((u) => u.id === user.userId);
      if (userIndex !== -1) {
        users[userIndex].avatar = avatar;
        StorageService.save("yazan_users", users);
      }
    }
  }
}
