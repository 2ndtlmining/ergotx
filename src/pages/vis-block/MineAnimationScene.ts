import Phaser from "phaser";
import { writable } from "svelte/store";

export class MineAnimationScene extends Phaser.Scene {
  isActionQueued = false;
  
  preload() {
    this.load.video("idle", "/vis-block-anims/anim-idle.mp4");
    this.load.video("action", "/vis-block-anims/anim-block.mp4");
  }

  private createVideo(name: string) {
    
  }

  create() {
    const actionVideo = this.add.video(0, 0, "action").setOrigin(0, 0);
    let winWidth = +this.game.config.width;
    let winHeight = +this.game.config.height;
    
    actionVideo.play();
    
    actionVideo.on('play', function() {
      let scale = winHeight / actionVideo.height;
      actionVideo.setScale(scale);
      // console.log(actionVideo.width);
      actionVideo.x = (winWidth - scale * actionVideo.width) / 2;
    });

  }
  
  // create() {
  //   const idleVideo = this.add.video(-1000, -10000, "idle").setOrigin(0, 0);
  //   const actionVideo = this.add.video(400, 300, "action").setOrigin(0, 0);
  //
  //   idleVideo.play(true);
  //
  //   this.input!.keyboard!.on("keydown-SPACE", () => {
  //     this.isActionQueued = true; // Queue the action video
  //   });
  //
  //   idleVideo.on("complete", () => {
  //     if (this.isActionQueued) {
  //       this.isActionQueued = false; // Reset flag
  //       idleVideo.stop(); // Stop idle video
  //       this.children.bringToTop(actionVideo);
  //       actionVideo.play(false); // Play action video once
  //     }
  //   });
  //
  //   actionVideo.on("complete", () => {
  //     actionVideo.stop(); // Stop action video
  //     idleVideo.play(true); // Resume idle video looping
  //     this.children.bringToTop(idleVideo);
  //   });
  // }
}
