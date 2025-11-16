class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    this.load.spritesheet('logoAnim', 'assets/Madz_Logo.png', {
      frameWidth: 100,
      frameHeight: 60
    });
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Background color
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1e90ff)
      .setOrigin(0, 0);

    // Title text
    this.add.text(centerX, centerY - 180, `Madzy's Little Adventure`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffffff',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Create animation (7 frames → 0 to 6)
    this.anims.create({
      key: 'logoIdle',
      frames: this.anims.generateFrameNumbers('logoAnim', {
        start: 0,
        end: 6
      }),
      frameRate: 3,  // adjust if you want faster/slower animation
      repeat: -1
    });

    // Add sprite and play animation
    const logo = this.add.sprite(centerX, centerY - 20, 'logoAnim')
      .setScale(4)      // adjust to size you like
      .setOrigin(0.5)
      // .setSmooth(false);

    logo.play('logoIdle');

    // "Press SPACE" prompt
    this.add.text(centerX, centerY + 180, 'Press SPACE to Start', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#ffff66',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Start game
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
