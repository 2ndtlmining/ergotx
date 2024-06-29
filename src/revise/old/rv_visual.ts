
/*
export class WrapSprite {
  protected scene: Scene;
  protected gameObject: Phaser.GameObjects.GameObject;
  protected physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  protected buildSprite(gameObject: Phaser.GameObjects.GameObject) {
    this.gameObject = gameObject;
    this.physicsBody = this.scene.physics.add.existing(gameObject).body as any;
  }

  public destroy() {
    this.gameObject.destroy();
  }
}

export interface PersonIdentity {
  tx: Transaction;
  house: House;
  placement: Placement;
}

export class Person extends WrapSprite {
  private static CIRCLE_RADIUS = 20;

  private identity: PersonIdentity;

  public static spawnAtHouse(
    scene: Scene,
    tx: Transaction,
    houseService: HouseService
  ) {
    let house = houseService.getHouseForTransaction(tx);

    // return new Person(scene, tx, house, {
    //   type: "house",
    //   index: house.index
    // });
  }

  constructor(
    scene: Scene,
    identity: PersonIdentity,
    // tx: Transaction,
    // house: House,
    // placement: Placement,
  ) {
    super(scene);
    this.identity = identity;

    // this.tx = tx;
    // this.placement = placement;
  }

  public init() {
    this.buildSprite(
      this.scene.add.circle(-100, -100, Person.CIRCLE_RADIUS, 0xedae26)
    );
  }
}
   */
