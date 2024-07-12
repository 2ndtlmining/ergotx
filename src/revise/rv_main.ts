import { Engine } from './rv_engine';
import { Renderer } from './rv_renderer';


let renderer = new Renderer();

let engine = new Engine(renderer);
engine.startListening();

// import "~/global.css";

// import Phaser, { Geom, Math, Scene, Input, Scale, GameObjects } from "phaser";

// class MainScene extends Phaser.Scene {
//   init() {
//     console.log("STARTED");
//   }
// }

// let _game = new Phaser.Game({
//   type: Phaser.AUTO,
//   width: 1200,
//   height: window.innerHeight,
//   autoCenter: Scale.Center.CENTER_BOTH,
//   scene: MainScene,
//   backgroundColor: 0x06303d,
//   physics: {
//     default: "arcade",
//     arcade: {
//       gravity: { x: 0, y: 0 },
//       debug: false
//     }
//   }
// });
