import { GameObjects, Input, Scene } from "phaser";
import { pixels } from "../sizing";
import { formatNumber } from "~/utils/number";
import { VoidCallback } from "~/types/utility";

import { createWindow } from "../../Decorations.svelte";

class StatBox {
  private surface: GameObjects.Graphics;
  private rect: GameObjects.Rectangle;
  private contributeRect: GameObjects.Rectangle;
  private contributeText: GameObjects.Text;
  private labelText: GameObjects.Text;
  private valueText: GameObjects.Text;

  private padX: number;
  private inX: number;
  private inWidth: number;

  private onContribute: VoidCallback | null = null;

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

    let surface = scene.add.graphics();
    this.surface = surface;
    surface.fillStyle(0x695112, 1);
    surface.fillRoundedRect(x, y, width, height, 10);
    surface.setDepth(3);

    let rect = scene.add.rectangle(this.inX, y, this.inWidth, height);
    this.rect = rect;
    rect.setOrigin(0, 0);
    rect.setFillStyle(0x212121);
    rect.setDepth(3);

    let ch = Math.round(height / 5);
    let cy = y + height - ch;
    let contributeRect = scene.add.rectangle(this.inX, cy, this.inWidth, ch);
    this.contributeRect = contributeRect;
    contributeRect.setOrigin(0, 0);
    contributeRect.setFillStyle(0x28362b);
    contributeRect.setDepth(3);
    contributeRect.setInteractive({ cursor: "pointer" });

    contributeRect.on(Input.Events.POINTER_UP, () => {
      this.onContribute?.();
    });

    let textStyle = {
      fontFamily: "Minecraft",
      color: "#ebb113",
      fontSize: 28
    };

    let contributeText = scene.add.text(0, cy, "Click to Sponsor", {
      color: "#ffe600",
      fontFamily: "Inter",
      fontSize: 20
    });
    this.contributeText = contributeText;
    contributeText.setY(cy + (ch - contributeText.height) / 2);
    contributeText.setDepth(3);
    this.center(contributeText);

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

  public setOnContribute(callback: VoidCallback) {
    this.onContribute = callback;
  }

  public destroy() {
    this.surface.destroy();
    this.rect.destroy();
    this.contributeRect.destroy();
    this.contributeText.destroy();
    this.labelText.destroy();
    this.valueText.destroy();
  }
}

export class StatsDisplay {
  private blockTimeBox: StatBox;
  private mempoolSizeBox: StatBox;

  constructor(scene: Scene) {
    let top = 0.25;
    let height = 1.95;

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

    this.blockTimeBox.setOnContribute(() => {
      createWindow({
        details: { type: "sponser", contentType: "ergo" },
        title: "Sponsor",
        initialPosition: { x: 130, y: 200 },
        initialSize: { width: 500, height: 500 }
      });
    });

    this.mempoolSizeBox.setOnContribute(() => {
      createWindow({
        details: { type: "sponser", contentType: "email" },
        title: "Sponsor",
        initialPosition: { x: 130, y: 200 },
        initialSize: { width: 500, height: 500 }
      });
    });
  }

  public setMempoolSize(size: number) {
    // TODO
    this.mempoolSizeBox.setValue(size.toString());
  }

  public setBlockTime(millisecs: number) {
    let totalSeconds = Math.floor(millisecs / 1000);

    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let numStyle = {
      pad: 2,
      mantissa: 0
    };

    let formatted = `${formatNumber(seconds, numStyle)} sec`;

    if (minutes > 0) {
      formatted = `${formatNumber(minutes, numStyle)} min ` + formatted;
    }

    this.blockTimeBox.setValue(formatted);
  }

  public destroy() {
    this.blockTimeBox.destroy();
    this.mempoolSizeBox.destroy();
  }
}
