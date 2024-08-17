import { GameObjects, Scene } from "phaser";
import { pixels } from "../sizing";
import { formatNumber } from "~/utils/number";

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
    surface.setFillStyle(0x695112);
    surface.setDepth(3);

    let rect = scene.add.rectangle(this.inX, y, this.inWidth, height);
    this.rect = rect;
    rect.setOrigin(0, 0);
    rect.setFillStyle(0x212121);
    rect.setDepth(3);

    let textStyle = {
      fontFamily: "Minecraft",
      color: "#ebb113",
      fontSize: 28
    };

    this.labelText = scene.add
      .text(this.inX, y + 25, label, textStyle)
      .setOrigin(0, 0)
      .setDepth(3);

    this.valueText = scene.add
      .text(this.inX, y + 65, value, textStyle)
      .setDepth(3);

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
  private blockTimeBox: StatBox;
  private mempoolSizeBox: StatBox;

  constructor(scene: Scene) {
    let top = 0.25;
    let height = 1.6;

    this.blockTimeBox = new StatBox(
      scene,
      "Last Block In",
      "00 min 00 sec",
      pixels(0.75),
      pixels(top),
      pixels(4),
      pixels(height)
    );

    this.mempoolSizeBox = new StatBox(
      scene,
      "Pending Txs",
      "0",
      pixels(5.25),
      pixels(top),
      pixels(4),
      pixels(height)
    );
  }

  public setMempoolSize(size: number) {
    // TODO
    this.mempoolSizeBox.setValue(size.toString());
  }

  public setBlockTime(millisecs: number) {
    // this.blockTimeBox.setValue((millisecs / 1000).toFixed(0));
    let totalSeconds = Math.floor(millisecs / 1000);

    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let numStyle = {
      pad: 2,
      mantissa: 0
    };

    let formatted = `${formatNumber(minutes, numStyle)} min ${formatNumber(
      seconds,
      numStyle
    )} sec`;
    this.blockTimeBox.setValue(formatted);
  }

  public destroy() {
    this.blockTimeBox.destroy();
    this.mempoolSizeBox.destroy();
  }
}
