const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
   pixelArt: true, 
  backgroundColor: '#87ceeb', // sky blue background
  scene: [TitleScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // default gravity (you can override per sprite)
      debug: false // set to true if you want to see physics bodies
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);


// Optional: handle resizing dynamically
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
