import Phaser, { Scene, Math } from "phaser";

import { WrapSprite } from "./WrapSprite";
import { Transaction } from "~/common/app_types";
import { Placement } from "./Placement";

const PERSON_RADIUS = 20;
const PERSON_COLOR = 0xedae26;

export class Person extends WrapSprite {
  private tx: Transaction;

  private moveSpeed: number = 300;

  // Fields relating to currently executing move
  private start: Math.Vector2 = Math.Vector2.ZERO;
  private target: Math.Vector2 = Math.Vector2.ZERO;
  private moveHandle: number = -1;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;
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

  public update() {}
}
