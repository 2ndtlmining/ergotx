import "./global.css";

import Phaser, { Geom, Math } from "phaser";

import { UpdateService } from "./ergo_api";
import { Transaction } from "./types";

const { Rectangle } = Geom;

class Person {}

class MainScene extends Phaser.Scene {
  private updateService: UpdateService;
  private mempool: Transaction[] = [];

  private speed = 100;
  private personBody: Phaser.Physics.Arcade.Body;

  private start = new Phaser.Math.Vector2(50, 400);
  private dest = new Phaser.Math.Vector2(400, 300);

  private distanceText: Phaser.GameObjects.Text;

  init() {
    // this.updateService = new UpdateService().onUnconfirmedTransactions(
    // this.handleUnconfirmedTransactions
    // );
    // this.updateService.start();
  }

  create() {
    this.add.circle(this.dest.x, this.dest.y, 10, 0x00aaf0f);

    let person = this.add.circle(this.start.x, this.start.y, 10, 0xff0000);
    this.physics.add.existing(person);
    this.personBody = person.body as any;
    // this.physics.moveToObject(person, this.dest, this.speed);

    let vel = new Phaser.Math.Vector2(
      this.dest.x - this.start.x,
      this.dest.y - this.start.y
    )
      .normalize()
      .scale(this.speed);

    this.personBody.setVelocity(vel.x, vel.y);

    this.distanceText = this.add.text(10, 10, "Click to set target", {
      color: "#00ff00"
    });
  }

  update(_time: number, deltaTime: number) {
    let distance = Math.Distance.BetweenPoints(this.personBody.position, this.dest);

    this.distanceText.setText(`Distance: ${distance}`);

    if (distance < 20) {
      this.personBody.stop();
    }
  }

  // update(time, deltaTime) {
  //   let dir = this.dest.subtract(this.personBody.position).normalize();
  //   this.personBody.position.add(dir.scale(this.speed * deltaTime));
  // }

  // private handleUnconfirmedTransactions = (transactions: Transaction[]) => {
  //   console.log("Found new txs: ", transactions.length);
  //   for (const candidTransaction of transactions) {
  //     let existing = this.mempool.find(tx => tx.id === candidTransaction.id);
  //     if (existing) continue;

  //     this.addTransaction(candidTransaction);
  //   }
  // };

  // private addTransaction(transaction: Transaction) {
  //   this.mempool.push(transaction);

  //   let node = this.add.circle(
  //     Math.Between(0, +this.game.config.width),
  //     Math.Between(0, +this.game.config.height),
  //     10,
  //     0xfc5603,
  //     1
  //   );
  // }
}

let game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MainScene,
  backgroundColor: 0x06303d,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true
    }
  }
});
