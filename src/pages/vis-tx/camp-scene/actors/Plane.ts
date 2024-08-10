import { Geom, Scene, GameObjects } from "phaser";
import { MotionController, SupportsMotion } from "~/movement/motion";
import { IVector2 } from "~/math/vector";
import { Transform } from "~/scene/component-types";
import { SubscriptionSink } from "~/utils/events";

import { watchSettings } from "../../DebugSettings";
import { Actor } from "./Actor";
import { pixels } from "../sizing";

export class Plane extends Actor implements SupportsMotion {
  private container: GameObjects.Container;

  private planeDebug: GameObjects.Rectangle;
  private regionDebug: GameObjects.Rectangle;

  private width: number;
  private height: number;
  private walkInRegion: Geom.Rectangle;

  private motionController: MotionController;
  private subSink: SubscriptionSink;

  constructor(scene: Scene, width: number) {
    super(scene);

    this.subSink = new SubscriptionSink();

    width -= pixels(0.5);

    {
      let sprite = this.scene.add.image(0, 0, "plane");
      sprite.scale = width / sprite.width;
      sprite.setOrigin(0.5, 0);

      this.width = width;
      this.height = sprite.getBounds().height;

      this.container = scene.add.container(-1000, -1000);
      this.container.add(sprite);
      this.container.depth = 1;
    }

    {
      this.walkInRegion = new Geom.Rectangle(
        Math.round(0.394736 * this.width),
        Math.round(0.359947 * this.height),
        Math.round(0.210526 * this.width),
        Math.round(0.383684 * this.height)
      );

      // this.walkInRegion = new Geom.Rectangle(0, 0, this.width, this.height);

      Geom.Rectangle.Inflate(this.walkInRegion, -0.092105 * this.height, 0);
    }

    {
      this.planeDebug = scene.add
        .rectangle(-this.width / 2, 0, this.width, this.height, 0xff0000)
        .setOrigin(0, 0)
        .setAlpha(0.4)
        .setVisible(false);

      this.planeDebug.isStroked = true;
      this.planeDebug.setStrokeStyle(2, 0x090436);

      this.regionDebug = scene.add
        .rectangle(
          0,
          0,
          this.walkInRegion.width,
          this.walkInRegion.height,
          0xdbeb34
        )
        .setOrigin(0, 0)
        .setAlpha(0.6)
        .setVisible(false);

      this.regionDebug.isStroked = true;
      this.regionDebug.setStrokeStyle(2, 0x090436);

      this.regionDebug.x -= this.width / 2;
      this.regionDebug.x += this.walkInRegion.x;

      this.regionDebug.y += this.walkInRegion.y;

      this.container.add(this.planeDebug);
      this.container.add(this.regionDebug);

      this.subSink.manual(
        watchSettings(settings => {
          this.planeDebug.setVisible(settings.debugBlockActors);
          this.regionDebug.setVisible(settings.debugBlockActors);
        })
      );
    }

    this.motionController = new MotionController(this.container);
  }

  public getHeight() {
    return this.height;
  }

  public place(position: IVector2) {
    this.container.copyPosition(position);
  }

  public getWalkInTargetPoint() {
    let point = this.walkInRegion.getRandomPoint();
    point.x += this.getX() - this.width / 2;
    point.y += this.getY();

    return point;
  }

  /* ============= */

  public update() {
    this.motionController.update();
  }

  public destroy() {
    this.subSink.unsubscribeAll();
    this.motionController.destroy();
    this.container.destroy();
    this.planeDebug.destroy();
    this.regionDebug.destroy();
  }

  public getTransform(): Transform {
    return this.container;
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
