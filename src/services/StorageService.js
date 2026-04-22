/**
 * Service de stockage local pour la sauvegarde du jeu
 * Gère la persistance des données dans LocalStorage
 */

const STORAGE_KEYS = {
  USER: "yazan_escape_user",
  PROGRESS: "yazan_escape_progress",
  GOODIES: "yazan_escape_goodies",
  SETTINGS: "yazan_escape_settings",
};

export class StorageService {
  /**
   * Sauvegarde une valeur dans le localStorage
   * @param {string} key - Clé de stockage
   * @param {*} value - Valeur à stocker
   */
  static save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      return false;
    }
  }

  /**
   * Récupère une valeur du localStorage
   * @param {string} key - Clé de stockage
   * @param {*} defaultValue - Valeur par défaut si non trouvée
   */
  static load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Erreur de chargement:", error);
      return defaultValue;
    }
  }

  /**
   * Supprime une valeur du localStorage
   * @param {string} key - Clé de stockage
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Erreur de suppression:", error);
      return false;
    }
  }

  /**
   * Efface toutes les données du jeu
   */
  static clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

export { STORAGE_KEYS };
