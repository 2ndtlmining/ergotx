import Phaser, { Scene, Math, GameObjects } from "phaser";

import { WrapSprite } from "./WrapSprite";
import { Transaction } from "~/common/app_types";
import { Placement } from "./Placement";
import type { Renderer } from "./rv_renderer";
import { PERSON_COLOR, PERSON_RADIUS } from "./theme";

export class Person extends WrapSprite<GameObjects.Arc> {
  private tx: Transaction;
  private visRenderer: Renderer;

  // Fields relating to currently executing move
  private lastIdleAt: Math.Vector2;
  private target: Math.Vector2;
  private moveHandle: number;

  constructor(renderer: Renderer, tx: Transaction) {
    super(renderer.getScene());
    this.tx = tx;
    this.visRenderer = renderer;

    this.lastIdleAt = new Math.Vector2();
    this.target = new Math.Vector2();
    this.moveHandle = -1;
  }

  public init() {
    super.init(
      this.scene.add.circle(
        //
        -1000,
        -1000,
        PERSON_RADIUS,
        PERSON_COLOR
      )
    );
  }

  public place(position: Math.Vector2) {
    this.lastIdleAt.setFromObject(position);
    this.gameObject.copyPosition(position);
  }

  public moveTo(moveHandle: number, position: Math.Vector2) {
    this.lastIdleAt.setFromObject(this.physicsBody.position);
    this.target.setFromObject(position);
    this.moveHandle = moveHandle;

    this.scene.physics.moveTo(
      this.gameObject,
      this.target.x,
      this.target.y,
      300, // TODO: No magic numbers
      1000
    );
  }

  public update() {}
}
