import "./global.css";

import Phaser, { Geom, Math } from "phaser";

import { UpdateService } from "./ergo_api";
import { Transaction } from "./types";

const { Rectangle } = Geom;

class Person {

}

class MainScene extends Phaser.Scene {
  private updateService!: UpdateService;
  private mempool: Transaction[] = [];

  init() {
    this.updateService = new UpdateService().onUnconfirmedTransactions(
      this.handleUnconfirmedTransactions
    );

    this.updateService.start();
  }

  private handleUnconfirmedTransactions = (transactions: Transaction[]) => {
    console.log("Found new txs: ", transactions.length);
    for (const candidTransaction of transactions) {
      let existing = this.mempool.find(tx => tx.id === candidTransaction.id);
      if (existing) continue;

      this.addTransaction(candidTransaction);
    }
  };

  private addTransaction(transaction: Transaction) {
    this.mempool.push(transaction);

    let node = this.add.circle(
      Math.Between(0, +this.game.config.width),
      Math.Between(0, +this.game.config.height),
      10,
      0xfc5603,
      1
    );
  }
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
      gravity: { x: 0, y: 200 }
    }
  }
});
