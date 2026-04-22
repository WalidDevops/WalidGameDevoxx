import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { MainMenu } from "./scenes/MainMenu";
import { AuthScene } from "./scenes/AuthScene";
import { WorldMap } from "./scenes/WorldMap";
import { TicTacToeScene } from "./scenes/TicTacToeScene";
import { CarRaceScene } from "./scenes/CarRaceScene";
import { InventoryScene } from "./scenes/InventoryScene";
import { GameOver } from "./scenes/GameOver";
import * as Phaser from "phaser";

const { AUTO, Game, Scale } = Phaser;

/**
 * Configuration principale du jeu - Yazan Escape Adventure
 * Un jeu éducatif interactif pour enfants avec mini-jeux et progression
 */
const config = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#1a1a2e",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  // Toutes les scènes du jeu
  scene: [
    Boot, // Chargement initial
    Preloader, // Préchargement des assets
    MainMenu, // Menu principal
    AuthScene, // Authentification (login/register)
    WorldMap, // Carte du monde (hub)
    TicTacToeScene, // Mini-jeu XO
    CarRaceScene, // Mini-jeu Course
    InventoryScene, // Inventaire des goodies
    GameOver, // Écran de fin
  ],
};

/**
 * Démarre le jeu Phaser
 * @param {string} parent - ID du conteneur HTML parent
 * @returns {Phaser.Game} Instance du jeu
 */
const StartGame = (parent) => {
  return new Game({ ...config, parent });
};

export default StartGame;
