import { GameObjects, Scene } from "phaser";
import { pixels } from "../sizing";

class StatBox {
  private surface: GameObjects.Rectangle;
  private rect: GameObjects.Rectangle;
  private labelText: GameObjects.Text;
  private valueText: GameObjects.Text;

  private padX: number;
  private inX: number;
  private inWidth: number;

  constructor(
    scene: Scene,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.padX = 20;
    this.inX = x + this.padX;
    this.inWidth = width - 2 * this.padX;

    let surface = scene.add.rectangle(x, y, width, height);
    this.surface = surface;
    surface.setOrigin(0, 0);
    // surface.setFillStyle(0xc2c3c4);
    surface.setFillStyle(0x695112);
    surface.setDepth(3);

    let rect = scene.add.rectangle(this.inX, y, this.inWidth, height);
    this.rect = rect;
    rect.setOrigin(0, 0);
    rect.setFillStyle(0x212121);
    rect.setDepth(3);

    let textStyle = {
      fontFamily: "Minecraft",
      // color: "#D77F0E",
      color: "#ebb113",
      fontSize: 28
    };

    this.labelText = scene.add
      .text(this.inX, y + 25, label, textStyle)
      .setOrigin(0, 0)
      .setDepth(3);

    this.valueText = scene.add.text(this.inX, y + 65, value, textStyle).setDepth(3);

    this.center(this.labelText);
    this.center(this.valueText);
  }

  private center(text: GameObjects.Text) {
    text.setX(this.inX + (this.inWidth - text.width) / 2);
  }

  public setValue(value: string) {
    this.valueText.setText(value);
    this.center(this.valueText);
  }

  public destroy() {
    this.surface.destroy();
    this.rect.destroy();
    this.labelText.destroy();
    this.valueText.destroy();
  }
}

export class StatsDisplay {
  public blockTimeText: GameObjects.Text;
  public mempoolSizeText: GameObjects.Text;

  private blockTimeBox: StatBox;
  private pendingTxBox: StatBox;

  constructor(
    scene: Scene,
  ) {
    this.temp(scene);

    let top = 0.25;
    let height = 1.6;

    this.blockTimeBox = new StatBox(
      scene,
      "Last Block In", "00 min 00 sec",
      pixels(0.75), pixels(top),
      pixels(4), pixels(height)
    );

    this.pendingTxBox = new StatBox(
      scene,
      "Pending Txs", "0",
      pixels(5.25), pixels(top),
      pixels(4), pixels(height)
    );
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

  public destroy() {
    this.blockTimeBox.destroy();
    this.pendingTxBox.destroy();
  }
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
