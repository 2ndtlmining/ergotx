import { Time } from "~/scene/Time";
import { GridManager } from "./GridManager";

export class WorldCamera {
  public static controls: Phaser.Cameras.Controls.FixedKeyControl;

  public static init(scene: Phaser.Scene) {
    const cursors = scene.input.keyboard!.createCursorKeys();
    let camera = scene.cameras.main;

    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera,
      up: cursors.up,
      down: cursors.down,
      speed: 1.75
    });

    camera.setBounds(0, 0, GridManager.CanvasWidth, GridManager.WorldMaxHeight);
  }

  static update() {
    this.controls.update(Time.DeltaTime);
  }
}
