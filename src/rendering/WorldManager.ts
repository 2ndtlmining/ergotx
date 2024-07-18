import Phaser from "phaser";

export class WorldManager {
  private static canvasWidth = 0;
  private static canvasHeight = 0;

  private static numTilesX = 12;
  private static numTilesY = 0;

  private static tileSize = 0;

  /* ========== Camera ========== */
  private static cameraControls: Phaser.Cameras.Controls.FixedKeyControl;

  static preloadTiles(load: Phaser.Loader.LoaderPlugin) {
    load.image("hex", "/tiles/grass.png");
    load.image("floor_check", "/tiles/floor-check.png");
    load.image("floor_stone", "/tiles/floor-stone.png");
    load.image("grass", "/tiles/grass.png");
    load.image("road", "/tiles/road.png");
  }

  public static get WorldMaxWidth() {
    return this.tileSize * this.numTilesX;
  }

  public static get WorldMaxHeight() {
    return this.tileSize * this.numTilesY;
  }

  private static setupCameraControls(scene: Phaser.Scene) {
    const cursors = scene.input.keyboard!.createCursorKeys();
    this.cameraControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: scene.cameras.main,
      up: cursors.up,
      down: cursors.down,
      speed: 1.75
    });

    scene.cameras.main.setBounds(0, 0, this.canvasWidth, this.WorldMaxHeight);
  }

  static init(scene: Phaser.Scene) {
    this.canvasWidth = +scene.game.config.width;
    this.canvasHeight = +scene.game.config.height;

    this.tileSize = Math.floor(this.canvasWidth / this.numTilesX);

    this.numTilesY = Math.max(
      Math.ceil(this.canvasHeight / this.tileSize) + 10,
      20
    );

    this.setupCameraControls(scene);
  }

  static drawBackground(scene: Phaser.Scene) {
    const imageNames = ["hex", "floor_check", "floor_stone", "grass", "road"];

    for (let i = 0; i < this.numTilesY; ++i) {
      let row = level[Math.min(level.length - 1, i)];
      for (let j = 0; j < this.numTilesX; ++j) {
        let x = this.tileSize * j;
        let y = this.tileSize * i;

        let image = scene.add
          .image(x, y, imageNames[row[j]])
          .setOrigin(0, 0);
        let scale = this.tileSize / image.width;
        image.setScale(scale, scale);
      }
    }
  }

  static update(deltaTime: number) {
    this.cameraControls.update(deltaTime);
  }
}

let level: number[][] = [
  [0, 0, 0, 0, 4, 1, 1, 1, 1, 1, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 2, 2, 2, 2, 2, 4, 4]
  /* The last row will be repeated */
];

(<any>window).WorldManager = WorldManager;
