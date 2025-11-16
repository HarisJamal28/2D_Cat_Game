class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('background', 'assets/background_madz_game.png');
    this.load.audio('BGMusic', './assets/BGMusic.mp3');
    this.load.audio('meow', './assets/Maddy_Cheer.mp3');

    this.load.image('player_stand', 'assets/cat_base_stand.png');
    this.load.image('player_walk_1', 'assets/cat_base_walk_1.png');
    this.load.image('player_walk_2', 'assets/cat_base_walk_2.png');
    this.load.image('player_jump', 'assets/cat_base_jumping.png');
    this.load.image('player_fall', 'assets/cat_base_falling.png');

    this.load.image('player_hud', 'assets/cat_hud.png');
    this.load.image('heart3', 'assets/hearts_full_1.png');
    this.load.image('heart2', 'assets/hearts_2.png');
    this.load.image('heart1', 'assets/hearts_1.png');
    this.load.image('heart0', 'assets/no_hearts.png');

    this.load.image('cage', 'assets/cage_base_shut.png');
    this.load.image('cage_anim_1', 'assets/cage_base_open_1.png');
    this.load.image('cage_anim_2', 'assets/cage_base_open_2.png');
    this.load.image('cage_anim_3', 'assets/cage_base_open_3.png');
    this.load.image('cage_anim_4', 'assets/cage_base_open_4.png');

    this.load.image('enemy', 'assets/cat_enemy_base.png');
    this.load.image('enemy_jump', 'assets/enemy_cat_jump.png');
    this.load.image('enemy_fall', 'assets/enemy_cat_falling.png');

    this.load.image('enemy_1', 'assets/cat_enemy_walk_1.png');
    this.load.image('enemy_2', 'assets/enemy_cat_falling.png');
    this.load.image('enemy_3', 'assets/cat_enemy_walk_2.png');

    this.load.audio('enemyStomp', 'assets/enemy_cat_destroy.mp3');
    this.load.audio('enemyHiss', 'assets/enemy_cat_spawn.mp3');
  }

  flashPlayerRed(player, duration = 200) {
    player.setTint(0xff0000);
    this.time.delayedCall(duration, () => {
      player.clearTint();
    });
  }

  create() {
    this.playerHealth = 3;
    this.physics.world.gravity.y = 100;
    const width = this.scale.width;
    const height = this.scale.height;
    this.scoreMessages = ['Amazing!', 'Stompy!', 'Maddy Da Baddie!'];

    this.stompSound = this.sound.add('enemyStomp',{ volume:0.3 });
    this.HissSound = this.sound.add('enemyHiss',{ volume: 0.1 });

    if (this.bgMusic) this.bgMusic.stop();

    this.bgMusic = this.sound.add('BGMusic', { volume: 0.1, loop: true });
    this.bgMusic.play();
    this.meow = this.sound.add('meow',{ volume:0.3 });

    this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(width, height).setScrollFactor(0);

    const groundHeight = 100;
    const groundY = height - groundHeight / 2;
    const ground = this.add.rectangle(width / 2, groundY, width, groundHeight, 0x654321);
    this.physics.add.existing(ground, true);

    this.cat = this.physics.add.sprite(width / 2, groundY - groundHeight / 2, 'player_stand');
    this.cat.setOrigin(0.5, 1);
    this.cat.setCollideWorldBounds(true);
    this.cat.body.setGravityY(500);

    const bodyWidth = 80;
    const bodyHeight = 80;
    this.cat.body.setSize(bodyWidth, bodyHeight);
    const offsetX = (128 - bodyWidth) / 2;
    const offsetY = 128 - bodyHeight;
    this.cat.body.setOffset(offsetX, offsetY);

    this.physics.add.collider(this.cat, ground);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.walkFrames = ['player_walk_1', 'player_walk_2'];
    this.walkFrameIndex = 0;
    this.walkFrameTimer = 0;

    this.anims.create({
      key: 'enemy_walk',
      frames: [{ key: 'enemy_1' }, { key: 'enemy_2' }, { key: 'enemy_3' }],
      frameRate: 4,
      repeat: -1
    });

    const hudSize = 128;
    this.playerHUD = this.add.image(20, 20, 'player_hud').setOrigin(0, 0).setScrollFactor(0).setDisplaySize(hudSize, hudSize);

    const heartSize = 150;
    this.heartIcon = this.add.image(this.playerHUD.x + hudSize, 0, 'heart3').setOrigin(0, 0).setScrollFactor(0).setDisplaySize(heartSize, heartSize);

    this.scoreValue = 0;
    this.scoreText = this.add.text(this.scale.width - 250, 30, 'Score: 0', { fontSize: '24px', fontFamily: '"Press Start 2P"', fill: '#ffffff' }).setOrigin(0, 0).setScrollFactor(0).setDepth(5);

    this.cages = this.physics.add.group();
    this.physics.add.collider(this.cages, ground);

    this.enemies = this.physics.add.group();
    this.physics.add.collider(this.enemies, ground);

    this.spawnCages();
    this.physics.add.collider(this.enemies, ground);

    this.physics.add.collider(this.cat, this.enemies, (player, enemy) => {
      if (player.body.bottom <= enemy.body.top + 10 && player.body.velocity.y > 0) {
        enemy.destroy();
        this.stompSound.play();
        this.scoreValue += 10;
        this.scoreText.setText('Score: ' + this.scoreValue);
        if (this.scoreValue % 50 === 0) {
          const message = Phaser.Utils.Array.GetRandom(this.scoreMessages);
          this.showScoreMessage(message);
          this.meow.play();
        }
        player.setVelocityY(-200);
      } else {
        if (!player.invulnerable) {
          player.invulnerable = true;
          this.playerHealth -= 1;
          this.updateHearts();
          this.flashPlayerRed(player, 200);
          if (player.x < enemy.x) player.setVelocityX(-150); else player.setVelocityX(150);
          player.setVelocityY(-100);
          this.time.delayedCall(500, () => { player.invulnerable = false; });
          if (this.playerHealth <= 0) this.gameOver();
        }
      }
    });

    this.isPaused = false;
    this.pauseOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0).setScrollFactor(0).setDepth(10).setVisible(false);
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED', { fontSize: '48px', fontFamily: '"Press Start 2P"', fill: '#ffffff', shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true } }).setOrigin(0.5).setScrollFactor(0).setDepth(11).setVisible(false);

    this.scale.on('resize', (gameSize) => {
      const width = gameSize.width;
      const height = gameSize.height;
      const newGroundY = height - groundHeight / 2;
      ground.width = width;
      ground.y = newGroundY;
      this.cat.x = width / 2;
      this.cat.y = newGroundY - groundHeight / 2;
      this.pauseOverlay.width = width;
      this.pauseOverlay.height = height;
      this.pauseText.setPosition(width / 2, height / 2);
    });

    this.anims.create({
      key: 'cage_open',
      frames: [{ key: 'cage_anim_1' }, { key: 'cage_anim_2' }, { key: 'cage_anim_3' }, { key: 'cage_anim_4' }],
      frameRate: 2,
      repeat: 0
    });

    this.time.delayedCall(3000, () => {
      this.cages.children.iterate((cage) => {
        cage.play('cage_open');
        cage.on('animationcomplete', () => {
          cage.setTexture('cage_anim_4');
          this.startSpawningEnemies(cage);
        });
      });
    });
  }

  spawnCages() {
    const width = this.scale.width;
    const margin = 50;
    const topY = 200;

    const leftCage = this.cages.create(margin, topY, 'cage');
    leftCage.setScale(0.5);
    leftCage.setBounce(0);
    leftCage.body.setAllowGravity(true);
    leftCage.setVelocityY(500);

    const rightCage = this.cages.create(width - margin, topY - 50, 'cage');
    rightCage.setScale(0.5);
    rightCage.setBounce(0);
    rightCage.body.setAllowGravity(true);
    rightCage.setVelocityY(500);
  }

  startSpawningEnemies(cage) {
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.enemies.getChildren().length < 3) {
          const groundY = this.scale.height - 100;
          this.enemySpawnCount++;
          const enemy = this.enemies.create(cage.x, 0, 'enemy');
          const scale = 1;
          enemy.setScale(scale);
          enemy.setCollideWorldBounds(true);
          enemy.setBounce(0);
          enemy.body.setAllowGravity(true);
          const bodyWidth = enemy.width * scale - 25;
          const bodyHeight = enemy.height * scale / 1.9;
          enemy.body.setSize(bodyWidth, bodyHeight);
          enemy.body.setOffset((enemy.displayWidth - bodyWidth), (enemy.displayHeight - bodyHeight));
          const groundTop = groundY - 50;
          enemy.y = groundTop - enemy.body.height / 2;
          enemy.play('enemy_walk');
          this.physics.add.collider(enemy, this.ground);
          enemy.isJumping = false;
          if (this.enemySpawnCount % 2 !== 0) {
            if (Phaser.Math.Between(0, 1) === 1) this.HissSound.play();
          }
        }
      }
    });
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.isPaused = !this.isPaused;
      this.physics.world.isPaused = this.isPaused;
      this.pauseOverlay.setVisible(this.isPaused);
      this.pauseText.setVisible(this.isPaused);
    }
    if (this.isPaused) return;

    let speed = 200;
    let walkInterval = 250;
    let moving = false;

    if (this.cursors.left.isDown || this.AKey.isDown) {
      speed = this.shiftKey.isDown ? 350 : 200;
      walkInterval = this.shiftKey.isDown ? 100 : 250;
      this.cat.setVelocityX(-speed);
      this.cat.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown || this.DKey.isDown) {
      speed = this.shiftKey.isDown ? 350 : 200;
      walkInterval = this.shiftKey.isDown ? 100 : 250;
      this.cat.setVelocityX(speed);
      this.cat.setFlipX(false);
      moving = true;
    } else this.cat.setVelocityX(0);

    if ((this.cursors.up.isDown || this.WKey.isDown || this.spaceKey.isDown) && this.cat.body.blocked.down) this.cat.setVelocityY(-400);

    if (!this.cat.body.blocked.down) {
      if (this.cat.body.velocity.y < 0) this.cat.setTexture('player_jump');
      else this.cat.setTexture('player_fall');
    } else if (moving) {
      this.walkFrameTimer += delta;
      if (this.walkFrameTimer >= walkInterval) {
        this.walkFrameTimer = 0;
        this.walkFrameIndex = (this.walkFrameIndex + 1) % this.walkFrames.length;
      }
      this.cat.setTexture(this.walkFrames[this.walkFrameIndex]);
    } else {
      this.cat.setTexture('player_stand');
      this.walkFrameTimer = 0;
      this.walkFrameIndex = 0;
    }

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.body) return;
      const speed = 80;
      const dx = this.cat.x - enemy.x;
      if (Math.abs(dx) > 5) {
        enemy.setVelocityX(Math.sign(dx) * speed);
        enemy.setFlipX(dx < 0);
      } else enemy.setVelocityX(0);

      if (enemy.body.blocked.down && !enemy.isJumping) {
        const jumpChance = Phaser.Math.Between(0, 100);
        if (jumpChance < 10) { enemy.setVelocityY(-150); enemy.isJumping = true; }
      }
      if (enemy.body.blocked.down) enemy.isJumping = false;

      if (!enemy.body.blocked.down) {
        if (enemy.body.velocity.y < -20 && enemy.currentAnim !== 'jump') { enemy.setTexture('enemy_jump'); enemy.currentAnim = 'jump'; }
        else if (enemy.body.velocity.y > 20 && enemy.currentAnim !== 'fall') { enemy.setTexture('enemy_fall'); enemy.currentAnim = 'fall'; }
      } else if (enemy.currentAnim !== 'walk') { enemy.play('enemy_walk'); enemy.currentAnim = 'walk'; }
    });
  }

  showScoreMessage(message) {
    const msgText = this.add.text(this.cat.x, this.cat.y - 100, message, { fontSize: '32px', fontFamily: '"Press Start 2P"', fill: '#ffff00', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: msgText, y: msgText.y - 50, alpha: 0, duration: 1000, ease: 'Power1', onComplete: () => { msgText.destroy(); } });
  }

  gameOver() {
    this.physics.world.pause();
    this.enemies.children.iterate(enemy => enemy.setVelocity(0, 0));

    const width = this.scale.width;
    const height = this.scale.height;

    this.gameOverOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0).setDepth(20);
    this.gameOverText = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', { fontSize: '48px', fontFamily: '"Press Start 2P"', fill: '#ff0000', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(21);
    this.restartButton = this.add.text(width / 2, height / 2 + 50, 'RESTART', { fontSize: '32px', fontFamily: '"Press Start 2P"', fill: '#ffffff', backgroundColor: '#000000', padding: { x: 20, y: 10 }, stroke: '#ff0000', strokeThickness: 3 }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
    this.restartButton.on('pointerdown', () => { this.scene.restart(); });
  }

  updateHearts() {
    const heartKey = `heart${this.playerHealth}`;
    this.heartIcon.setTexture(heartKey);
    this.heartIcon.displayWidth = 150;
    this.heartIcon.displayHeight = 150;
  }
}
