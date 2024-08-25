import Phaser from "phaser";

export class MineAnimationScene extends Phaser.Scene {
  isActionQueued = false;
  
  preload() {
    this.load.video("idle", "/vis-block-anims/anim-idle.mp4");
    this.load.video("action", "/vis-block-anims/anim-block.mp4");
  }

  private createVideo(name: string) {
    const video = this.add.video(0, 0, name).setOrigin(0, 0);
    let winWidth = +this.game.config.width;
    let winHeight = +this.game.config.height;

    // video.play();

    video.on('play', function() {
      let scale = winHeight / video.height;
      video.setScale(scale);
      video.x = (winWidth - scale * video.width) / 2;
    }); 
    
    return video;
  }

  create() {
    let actionVideo = this.createVideo("action");
    let idleVideo = this.createVideo("idle");
    
    // window.va = actionVideo;
    // window.vi = idleVideo;
    
    idleVideo.play(true);
    // actionVideo.play();
    // actionVideo.pause();
    
    // idleVideo.on("complete", () => {
    //   idleVideo.play();
    // });

    this.input!.keyboard!.on("keydown-SPACE", () => {
      idleVideo.pause();
      actionVideo.seekTo(0);
      actionVideo.play();
      this.children.bringToTop(actionVideo);
    });

    actionVideo.on("complete", () => {
      actionVideo.stop();
      idleVideo.seekTo(0);
      idleVideo.resume();
      this.children.bringToTop(idleVideo);
    });

  }
}
