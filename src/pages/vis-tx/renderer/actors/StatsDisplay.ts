import { GameObjects, Scene } from "phaser";
import { pixels } from "../sizing";

// const center = ()

class StatBox {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {}
}

export class StatsDisplay {
  private rect: GameObjects.Rectangle;

  public blockTimeText: GameObjects.Text;
  public mempoolSizeText: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.temp(scene);
    this.initBlockTimeDisplay(scene);
    this.initPendingTxDisplay(scene);
  }

  private initBlockTimeDisplay(scene: Phaser.Scene) {
    let width = 300;
    let height = 125;
    let padX = 20;

    let x = 50;
    let y = 10;

    let inX = x + padX;
    let inWidth = width - 2 * padX;

    let surface = scene.add.rectangle(x, y, width, height);
    surface.setOrigin(0, 0);
    surface.setFillStyle(0xc2c3c4);
    surface.setDepth(3);

    let rect = scene.add.rectangle(inX, y, inWidth, height);
    rect.setOrigin(0, 0);
    rect.setFillStyle(0x212121);
    rect.setDepth(3);

    let textStyle = {
      fontFamily: "Minecraft",
      color: "#D77F0E",
      fontSize: 28
    };

    let line1 = scene.add
      .text(0, y + 25, "Last Block In", textStyle)
      .setOrigin(0, 0)
      .setDepth(3);

    let line2 = scene.add
      .text(0, y + 65, "01 min 02 sec", textStyle)
      .setDepth(3);

    line1.setX(inX + (inWidth - line1.width) / 2);
    line2.setX(inX + (inWidth - line2.width) / 2);
  }

  private initPendingTxDisplay(scene: Phaser.Scene) {
    let width = 300;
    let height = 125;
    let padX = 20;

    let x = 500;
    let y = 10;

    let inX = x + padX;
    let inWidth = width - 2 * padX;

    let surface = scene.add.rectangle(x, y, width, height);
    surface.setOrigin(0, 0);
    surface.setFillStyle(0xc2c3c4);
    surface.setDepth(3);

    let rect = scene.add.rectangle(inX, y, inWidth, height);
    rect.setOrigin(0, 0);
    rect.setFillStyle(0x212121);
    rect.setDepth(3);

    let textStyle = {
      fontFamily: "Minecraft",
      color: "#D77F0E",
      fontSize: 28
    };

    let line1 = scene.add
      .text(0, y + 25, "Pending Txs", textStyle)
      .setOrigin(0, 0)
      .setDepth(3);

    let line2 = scene.add.text(0, y + 65, "32", textStyle).setDepth(3);

    line1.setX(inX + (inWidth - line1.width) / 2);
    line2.setX(inX + (inWidth - line2.width) / 2);
  }

  private temp(scene: any) {
    this.blockTimeText = scene.add.text(-1000, -1000, "", {
      color: "white",
      fontSize: 20
    });

    this.mempoolSizeText = scene.add.text(-1000, -1000, "", {
      color: "white",
      fontSize: 20
    });
  }

  public destroy() {}
}

/*
constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    {
      let surface = scene.add.rectangle(50, 10, 400, 120);
      surface.setOrigin(0, 0);
      surface.setFillStyle(0xc2c3c4);
      surface.setDepth(3);

      let rect = scene.add.rectangle(50 + 20, 10, 400 - 40, 120);
      rect.setOrigin(0, 0);
      rect.setFillStyle(0x212121);
      rect.setDepth(3);

      let textStyle = {
        fontFamily: "Minecraft",
        color: "#D77F0E",
        fontSize: 32,
      };

      scene.add.text(50 + 20 + 70, 10 + 20, "Last Block In", textStyle).setDepth(3);
      scene.add.text(50 + 20 + 70, 10 + 60, "01 min 02 sec", textStyle).setDepth(3);
    }

    // -------------------------------------------------------------

    {
      let surface = scene.add.rectangle(500, 10, 400, 120);
      surface.setOrigin(0, 0);
      surface.setFillStyle(0xc2c3c4);
      surface.setDepth(3);

      let rect = scene.add.rectangle(500 + 20, 10, 400 - 40, 120);
      rect.setOrigin(0, 0);
      rect.setFillStyle(0x212121);
      rect.setDepth(3);

      let textStyle = {
        fontFamily: "Minecraft",
        color: "#D77F0E",
        fontSize: 32,
      };

      scene.add.text(500 + 20 + 70, 10 + 20, "Last Block In", textStyle).setDepth(3);
      scene.add.text(500 + 20 + 70, 10 + 60, "01 min 02 sec", textStyle).setDepth(3);
    }

    // -------------------------------------------------------------

    this.blockTimeText = scene.add
    .text(-1000, -1000, "", {
      color: "white",
      fontSize: 20
    })
    .setDepth(3);

    this.mempoolSizeText = scene.add
    .text(-1000, -1000, "", {
      color: "white",
      fontSize: 20
    })
    .setDepth(3);
  }


*/
