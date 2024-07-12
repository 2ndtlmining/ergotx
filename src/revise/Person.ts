import Phaser, { Scene, Math, GameObjects } from "phaser";

import { WrapSprite } from "./WrapSprite";
import { Transaction } from "~/common/app_types";
import { Placement } from "./Placement";
import type { Renderer } from "./rv_renderer";

const PERSON_RADIUS = 20;
const PERSON_COLOR = 0xedae26;

export class Person extends WrapSprite<GameObjects.Arc> {
  private tx: Transaction;
  private visRenderer: Renderer;

  // Fields relating to currently executing move
  private lastIdleAt: Math.Vector2 = Math.Vector2.ZERO;
  private target: Math.Vector2 = Math.Vector2.ZERO;
  private moveHandle: number = -1;

  constructor(renderer: Renderer, tx: Transaction) {
    super(renderer.getScene());
    this.tx = tx;
    this.visRenderer = renderer;
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
    this.lastIdleAt = position.clone();
    this.gameObject.setPosition(position.x, position.y);
  }

  public update() {}
}
