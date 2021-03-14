var game = new Phaser.Game(700, 800, Phaser.CANVAS, 'Star Fighters: The Empire Reborn', { preload: preload, create: create, update: update, render: render });

var hanShotFirst = false;

function pigeonCache() {
    if (hanShotFirst == false) {
        hanShotFirst = true;
    } else {
        hanShotFirst = false;
    }
    return hanShotFirst;
}

var cheatMode = false;

document.addEventListener('DOMContentLoaded', init);

function init() {
    document.getElementById('pigeon').addEventListener('click', pigeonCache);
}

var player;
var tieEnemies;
var tieX1Enemies;
var starfield;
var cursors;
var bank;
var shipTrail;
var explosions;
var playerDeath;
var bullets;
var bulletsSFX;
var fireButton;
var bulletTimer = 0;
var shields;
var score = 0;
var scoreText;
var tieEnemyLaunchTimer;
var tieEnemySpacing = 1000;
var tieX1EnemyLaunchTimer;
var tieX1EnemyLaunched = false;
var tieX1EnemySpacing = 2500;
var destroyerLaunchTimer;
var destroyerLaunched = false;
var destroyerSpacing = 10000;
var bossLaunchTimer;
var bossLaunched = false;
var bossSpacing = 20000;
var bossBulletTimer = 0;
var bossYdirection = -1;
var gameOver;

var ACCLERATION = 600;
var DRAG = 400;
var MAXSPEED = 500;

function preload() {
    // Loading of images
    game.load.image('background', 'assets/background.png');
    game.load.image('ship', 'assets/aileX_70.png');
    game.load.image('falcon', 'assets/pigeonMillenial.png');
    game.load.image('bullet', 'assets/beam.png');
    game.load.image('tie', 'assets/tie.png');
    game.load.image('tieX1', 'assets/tieX1.png');
    game.load.image('tieX1Bullet', 'assets/tieBullets.png');
    game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
    game.load.spritesheet('tieTouch', 'assets/tieTouch.png', 128, 128);
    game.load.image('destroyer', 'assets/destructeur.png');
    game.load.image('destroyerBullets', 'assets/destructeurShot.png');
    game.load.image('boss', 'assets/etoiledelamort.png');
    game.load.image('deathRay', 'assets/deathray2test.png');
    game.load.image('gameOver', 'assets/gameOver.png');
    game.load.image('screenTitle', 'assets/screentitle.png');

    // Loading of music
    game.load.audio('theme', ['assets/theme.mp3', 'assets/theme.ogg', 'assets/theme.wav']);
    game.load.audio('pew', ['assets/pewpew.mp3', 'assets/pewpew.ogg']);
    game.load.audio('kaboom', ['assets/explosion.mp3', 'assets/explosion.ogg']);
    game.load.audio('over', ['assets/gameoversound.mp3', 'assets/gameoversound.ogg']);
    game.load.audio('death_ray', ['assets/deathray.mp3', 'assets/deathray.ogg']);
}

function create() {

    //Generation of audio files
    var music = game.add.audio('theme', 1);
    music.play('', 0, 1, true);


    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 700, 800, 'background');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  The hero!
    if (hanShotFirst == false) {
        player = game.add.sprite(400, 700, 'ship');
    } else {
        player = game.add.sprite(400, 700, 'falcon');
    }
    player.health = 200;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);

    player.weaponLevel = 1
    player.events.onKilled.add(function () {
        shipTrail.kill();
    });
    player.events.onRevived.add(function () {
        shipTrail.start(false, 5000, 10);
    });

    //  The bad dudes!
    tieEnemies = game.add.group();
    tieEnemies.enableBody = true;
    tieEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    tieEnemies.createMultiple(5, 'tie');
    tieEnemies.setAll('anchor.x', 0.5);
    tieEnemies.setAll('anchor.y', 0.5);
    tieEnemies.setAll('scale.x', 0.7);
    tieEnemies.setAll('scale.y', 0.7);
    tieEnemies.setAll('angle', 180);
    tieEnemies.forEach(function (enemy) {
        addEnemyEmitterTrail(enemy);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
        enemy.damageAmount = 20;
        enemy.events.onKilled.add(function () {
            enemy.trail.kill();
        });
    });

    game.time.events.add(1000, launchTieEnemy);

    //  TieX1's bullets
    tieX1EnemiesBullets = game.add.group();
    tieX1EnemiesBullets.enableBody = true;
    tieX1EnemiesBullets.physicsBodyType = Phaser.Physics.ARCADE;
    tieX1EnemiesBullets.createMultiple(30, 'tieX1Bullet');
    tieX1EnemiesBullets.setAll('alpha', 0.9);
    tieX1EnemiesBullets.setAll('anchor.x', 1);
    tieX1EnemiesBullets.setAll('anchor.y', 1);
    tieX1EnemiesBullets.setAll('outOfBoundsKill', true);
    tieX1EnemiesBullets.setAll('checkWorldBounds', true);
    tieX1EnemiesBullets.forEach(function (enemy) {
        enemy.body.setSize(30, 30);
    });

    //  tie X1 baddies!
    tieX1Enemies = game.add.group();
    tieX1Enemies.enableBody = true;
    tieX1Enemies.physicsBodyType = Phaser.Physics.ARCADE;
    tieX1Enemies.createMultiple(30, 'tieX1');
    tieX1Enemies.setAll('anchor.x', 0.5);
    tieX1Enemies.setAll('anchor.y', 0.5);
    tieX1Enemies.setAll('scale.x', 1);
    tieX1Enemies.setAll('scale.y', 0.7);
    tieX1Enemies.setAll('angle', 180);
    tieX1Enemies.forEach(function (enemy) {
        enemy.damageAmount = 40;
    });

    destroyerBullets = game.add.group();
    destroyerBullets.enableBody = true;
    destroyerBullets.physicsBodyType = Phaser.Physics.ARCADE;
    destroyerBullets.createMultiple(30, 'destroyerBullets');
    destroyerBullets.setAll('alpha', 0.9);
    destroyerBullets.setAll('anchor.x', 0.5);
    destroyerBullets.setAll('anchor.y', 0.5);
    destroyerBullets.setAll('outOfBoundsKill', true);
    destroyerBullets.setAll('checkWorldBounds', true);
    destroyerBullets.forEach(function (enemy) {
        enemy.body.setSize(40, 40);
    });

    // The mini Boss
    destroyer = game.add.group();
    destroyer.enableBody = true;
    destroyer.physicsBodyType = Phaser.Physics.ARCADE;
    destroyer.createMultiple(100, 'destroyer');
    destroyer.setAll('anchor.x', 0.5);
    destroyer.setAll('anchor.y', 0.5);
    destroyer.setAll('scale.x', 10);
    destroyer.setAll('scale.y', 1);
    destroyer.setAll('angle', 180);
    destroyer.forEach(function (enemy) {
        enemy.damageAmount = 50;
    });

    game.time.events.add(20000, launchDestroyer);


    //  The boss
    boss = game.add.sprite(0, 0, 'boss');
    boss.exists = false;
    boss.alive = false;
    boss.anchor.setTo(0.5, 0.5);
    boss.damageAmount = 50;
    boss.angle = 180;
    boss.scale.x = 2;
    boss.scale.y = 1;
    game.physics.enable(boss, Phaser.Physics.ARCADE);
    boss.body.maxVelocity.setTo(50, 40);
    boss.dying = false;
    boss.finishOff = function () {
        if (!boss.dying) {
            boss.dying = true;
            bossDeath.x = boss.x;
            bossDeath.y = boss.y;
            bossDeath.start(false, 1000, 50, 20);
            //  kill boss after explosions
            game.time.events.add(1000, function () {
                var explosion = explosions.getFirstExists(false);
                var beforeScaleX = explosions.scale.x;
                var beforeScaleY = explosions.scale.y;
                var beforeAlpha = explosions.alpha;
                explosion.reset(boss.body.x + boss.body.halfWidth, boss.body.y + boss.body.halfHeight);
                explosion.alpha = 0.4;
                explosion.scale.x = 3;
                explosion.scale.y = 3;
                var animation = explosion.play('explosion', 30, false, true);
                animation.onComplete.addOnce(function () {
                    explosion.scale.x = beforeScaleX;
                    explosion.scale.y = beforeScaleY;
                    explosion.alpha = beforeAlpha;
                });
                boss.kill();
                booster.kill();
                boss.dying = false;
                bossDeath.on = false;
                // queue next boss
                bossLaunchTimer = game.time.events.add(game.rnd.integerInRange(bossSpacing, bossSpacing + 5000), launchBoss);
            });

            // reset spacing for other enemies
            tieX1EnemySpacing = 2500;
            tieEnemySpacing = 1000;

            // bonus health
            if (cheatMode == true) {
                player.health = Math.min(9999999, player.health + 9999999);
                shields.render();
            } else {
                player.health = Math.min(200, 200);
                shields.render();
            }
        }
    };

    //  Boss death ray
    function addRay(leftRight) {
        var ray = game.add.sprite(leftRight * boss.width * 0.75, 0, 'deathRay');
        ray.alive = false;
        ray.visible = false;
        boss.addChild(ray);
        ray.crop({ x: 0, y: 5, width: 40, height: 40 });
        ray.anchor.x = 0.5;
        ray.anchor.y = 0.5;
        ray.scale.x = 2.5;
        ray.damageAmount = boss.damageAmount;
        game.physics.enable(ray, Phaser.Physics.ARCADE);
        ray.body.setSize(ray.width / 5, ray.height / 4);
        ray.update = function () {
            this.alpha = game.rnd.realInRange(0.6, 1);
        };
        boss['ray' + (leftRight > 0 ? 'Right' : 'Left')] = ray;
    }
    addRay(0.01);
    addRay(-0.01);


    boss.fire = function () {
        if (game.time.now > bossBulletTimer) {
            var raySpacing = 3000;
            var chargeTime = 1500;
            var rayTime = 1000;

            function chargeAndShoot(side) {
                ray = boss['ray' + side];
                ray.name = side
                ray.revive();
                ray.y = 80;
                ray.alpha = 0;
                ray.scale.y = 13;
                game.add.tween(ray).to({ alpha: 1 }, chargeTime, Phaser.Easing.Linear.In, true).onComplete.add(function (ray) {
                    ray.scale.y = 150;
                    game.add.tween(ray).to({ y: -1500 }, rayTime, Phaser.Easing.Linear.In, true).onComplete.add(function (ray) {
                        ray.kill();
                    });
                });
            }
            if (player.alive == true) {
                var sfx4 = game.add.audio('death_ray');
                sfx4.play();
                chargeAndShoot('Right');
                chargeAndShoot('Left');

                bossBulletTimer = game.time.now + raySpacing;
            }
        }
    };

    boss.update = function () {
        if (!boss.alive) return;

        boss.rayLeft.update();
        boss.rayRight.update();

        if (boss.y > 140) {
            boss.body.acceleration.y = -50;
        }
        if (boss.y < 140) {
            boss.body.acceleration.y = 50;
        }
        if (boss.x > player.x + 50) {
            boss.body.acceleration.x = -50;
        } else if (boss.x < player.x - 50) {
            boss.body.acceleration.x = 50;
        } else {
            boss.body.acceleration.x = 0;
        }

        //  Squish and rotate boss for illusion of "banking"
        var bank = boss.body.velocity.x / MAXSPEED;
        boss.scale.x = 1 - Math.abs(bank) / 3;
        boss.angle = 180 - bank * 20;

        booster.x = boss.x + -5 * bank;
        booster.y = boss.y + 10 * Math.abs(bank) - boss.height / 2;

        //  fire if player is in target
        var angleToPlayer = game.math.radToDeg(game.physics.arcade.angleBetween(boss, player)) - 90;
        var anglePointing = 180 - Math.abs(boss.angle);
        if (anglePointing - angleToPlayer < 18) {
            boss.fire();
        }
    }

    //  boss's boosters without particles
    booster = game.add.emitter(boss.body.x, boss.body.y - boss.height / 2);
    booster.width = 0;
    booster.makeParticles('');
    booster.forEach(function (p) {
        p.crop({ x: 120, y: 0, width: 45, height: 50 });
        p.anchor.x = game.rnd.pick([1, -1]) * 0.95 + 0.5;
        p.anchor.y = 0.75;
    });

    booster.setXSpeed(0, 0);
    booster.setRotation(0, 0);
    booster.setYSpeed(-30, -50);
    booster.gravity = 0;
    booster.setAlpha(1, 0.1, 400);
    booster.setScale(0.3, 0, 0.7, 0, 5000, Phaser.Easing.Quadratic.Out);
    boss.bringToTop();

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  Add an emitter for the ship's trail
    shipTrail = game.add.emitter(player.x, player.y + 10, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('bullet');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);

    //  An explosion pool
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(function (explosion) {
        explosion.animations.add('explosion');
    });

    //  Big explosion
    playerDeath = game.add.emitter(player.x, player.y);
    playerDeath.width = 50;
    playerDeath.height = 50;
    playerDeath.makeParticles('tieTouch', [0, 1, 2, 3, 4, 5, 6], 200);
    playerDeath.setAlpha(0.9, 0, 800);
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);

    //  Big explosion for boss
    bossDeath = game.add.emitter(boss.x, boss.y);
    bossDeath.width = boss.width / 2;
    bossDeath.height = boss.height / 2;
    bossDeath.makeParticles('explosion', [0, 1, 2, 3, 4, 5, 6], 200);
    bossDeath.setAlpha(0.9, 0, 900);
    bossDeath.setScale(0.3, 1.0, 0.3, 1.0, 1000, Phaser.Easing.Quintic.Out);


    //  Shields stat
    shields = game.add.text(game.world.width - 300, 10, 'Shield: ' + player.health, { font: '32px Courier New', fill: '#FFA500' });
    shields.render = function () {
        shields.text = 'Shield: ' + Math.max(player.health, 0);
    };
    shields.render();


    //  Score
    scoreText = game.add.text(10, 10, 'Score', { font: '32px Courier New', fill: '#FFA500' });
    scoreText.render = function () {
        scoreText.text = 'Score: ' + score;
    };
    scoreText.render();

    //  Game over canvas and restart
    gameOver = game.add.image(game.world.centerX * 0, game.world.centerY * 0, 'gameOver');
    gameOver.visible = false;
}

function update() {
    //  Scroll the background
    starfield.tilePosition.y += 2;

    //  Reset the player, then check for movement keys
    player.body.acceleration.x = 0;

    if (cursors.left.isDown) {
        player.body.acceleration.x = -ACCLERATION;
    } else if (cursors.right.isDown) {
        player.body.acceleration.x = ACCLERATION;
    }

    //  Stop at screen edges
    if (player.x > game.width - 50) {
        player.x = game.width - 50;
        player.body.acceleration.x = 0;
    }
    if (player.x < 50) {
        player.x = 50;
        player.body.acceleration.x = 0;
    }

    //  Fire bullet
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
        var sfx1 = game.add.audio('pew', 0.2);
        sfx1.play();
        fireBullet();
    }

    //  Move ship towards mouse pointer
    if (game.input.x < game.width - 20 &&
        game.input.x > 20 &&
        game.input.y > 20 &&
        game.input.y < game.height - 20) {
        var minDist = 200;
        var dist = game.input.x - player.x;
        player.body.velocity.x = MAXSPEED * game.math.clamp(dist / minDist, -1, 1);
    }

    //  Squish and rotate ship for illusion of "banking"
    bank = player.body.velocity.x / MAXSPEED;
    player.scale.x = 1 - Math.abs(bank) / 2;
    player.angle = bank * 30;

    //  Keep the shipTrail lined up with the ship
    shipTrail.x = player.x;

    //  Check collisions
    game.physics.arcade.overlap(player, tieEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(tieEnemies, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(player, tieX1Enemies, shipCollide, null, this);
    game.physics.arcade.overlap(tieX1Enemies, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(player, destroyer, shipCollide, null, this);
    game.physics.arcade.overlap(destroyer, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(boss, bullets, hitEnemy, bossHitTest, this);
    game.physics.arcade.overlap(player, boss.rayLeft, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(player, boss.rayRight, enemyHitsPlayer, null, this);

    game.physics.arcade.overlap(tieX1EnemiesBullets, player, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(destroyerBullets, player, enemyHitsPlayer, null, this);

    //  Game over?
    if (!player.alive && gameOver.visible === false) {

        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({ alpha: 1 }, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();

        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart, this);
            spaceRestart = fireButton.onDown.addOnce(_restart, this);

            function _restart() {
                tapRestart.detach();
                spaceRestart.detach();
                restart();
            }
        }
    }
}

function render() { }

function fireBullet() {
    switch (player.weaponLevel) {
        case 1:
            //  To avoid them being allowed to fire too fast we set a time limit
            if (game.time.now > bulletTimer) {
                var BULLET_SPEED = 400;
                var BULLET_SPACING = 250;
                //  Grab the first bullet we can from the pool
                var bullet = bullets.getFirstExists(false);

                if (bullet) {
                    //  And fire it
                    //  Make bullet come out of tip of ship with right angle
                    var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                    bullet.reset(player.x + bulletOffset, player.y);
                    bullet.angle = player.angle;
                    game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
                    bullet.body.velocity.x += player.body.velocity.x;

                    bulletTimer = game.time.now + BULLET_SPACING;
                }
            }
            break;

        case 2:

            if (cheatMode != false) {
                if (game.time.now > bulletTimer) {
                    var BULLET_SPEED = 400;
                    var BULLET_SPACING = 300;


                    for (var i = 0; i < 5; i++) {
                        var bullet = bullets.getFirstExists(false);
                        if (bullet) {

                            var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                            bullet.reset(player.x + bulletOffset, player.y);

                            var spreadAngle;
                            if (i === 0) spreadAngle = -20;
                            if (i === 1) spreadAngle = 0;
                            if (i === 2) spreadAngle = 20;
                            if (i === 3) spreadAngle = 10;
                            if (i === 4) spreadAngle = -10;
                            bullet.angle = player.angle + spreadAngle;
                            game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                            bullet.body.velocity.x += player.body.velocity.x;
                        }
                        bulletTimer = game.time.now + BULLET_SPACING;
                    }
                }
            } else {
                if (game.time.now > bulletTimer) {
                    var BULLET_SPEED = 400;
                    var BULLET_SPACING = 400;


                    for (var i = 0; i < 3; i++) {
                        var bullet = bullets.getFirstExists(false);
                        if (bullet) {
                            //  Make bullet come out of tip of ship with right angle
                            var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                            bullet.reset(player.x + bulletOffset, player.y);
                            //  "Spread" angle of 1st and 3rd bullets
                            var spreadAngle;
                            if (i === 0) spreadAngle = -20;
                            if (i === 1) spreadAngle = 0;
                            if (i === 2) spreadAngle = 20;
                            bullet.angle = player.angle + spreadAngle;
                            game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                            bullet.body.velocity.x += player.body.velocity.x;
                        }
                        bulletTimer = game.time.now + BULLET_SPACING;
                    }
                }

            }
    }
}



function launchTieEnemy() {
    var ENEMY_SPEED = 300;

    var enemy = tieEnemies.getFirstExists(false);
    if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), -20);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = ENEMY_SPEED;
        enemy.body.drag.x = 100;

        enemy.trail.start(false, 800, 1);

        //  Update function for each enemy ship to update rotation etc
        enemy.update = function () {
            enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

            enemy.trail.x = enemy.x;
            enemy.trail.y = enemy.y - 10;

            //  Kill enemies once they go off screen
            if (enemy.y > game.height + 200) {
                enemy.kill();
                enemy.y = -20;
            }
        }
    }

    //  Send another enemy soon
    tieEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(tieEnemySpacing, tieEnemySpacing + 1000), launchTieEnemy);
}

function launchTieX1Enemy() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 180;
    var spread = 60;
    var frequency = 140;
    var verticalSpacing = 70;
    var numEnemiesInWave = 2;

    //  Launch wave
    for (var i = 0; i < numEnemiesInWave; i++) {
        var enemy = tieX1Enemies.getFirstExists(false);
        if (enemy) {
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = 2000;
            enemy.bullets = 1;
            enemy.lastShot = 0;

            //  Update function for each enemy
            enemy.update = function () {
                //  Wave movement
                this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;

                //  Squish and rotate ship for illusion of "banking"
                bank = Math.cos((this.y + 60) / frequency)
                this.scale.x = 0.5 - Math.abs(bank) / 8;
                this.angle = 180 - bank * 2;

                //  Fire
                enemyBullet = tieX1EnemiesBullets.getFirstExists(false);
                if (enemyBullet &&
                    this.alive &&
                    this.bullets &&
                    this.y > game.width / 8 &&
                    game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle);
                }

                //  Kill enemies once they go off screen
                if (this.y > game.height + 200) {
                    this.kill();
                    this.y = -20;
                }
            };
        }
    }

    //  Send another wave soon
    tieX1EnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(tieX1EnemySpacing, tieX1EnemySpacing + 4000), launchTieX1Enemy);
}

function launchDestroyer() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 80;
    var frequency = 800;
    var verticalSpacing = 200;
    var numEnemiesInWave = 1;


    for (var i = 0; i < numEnemiesInWave; i++) {
        var enemy = destroyer.getFirstExists(false);
        if (enemy) {
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = 1000;
            enemy.bullets = 100;
            enemy.lastShot = 0;

            //  Update function for each enemy
            enemy.update = function () {

                //  Squish and rotate ship for illusion of "banking"
                bank = Math.cos((this.y + 60) / frequency)
                this.scale.x = 1.5 - Math.abs(bank) / 8;
                this.angle = 180 - bank * 2;

                //  Fire
                destroyerEnemyBullet = destroyerBullets.getFirstExists(false);
                if (destroyerEnemyBullet &&
                    this.alive &&
                    this.bullets &&
                    this.y > game.width / 8 &&
                    game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    destroyerEnemyBullet.reset(this.x, this.y + this.height / 2);
                    destroyerEnemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(destroyerEnemyBullet, player, bulletSpeed);
                    destroyerEnemyBullet.angle = game.math.radToDeg(angle);
                }

                //  Kill enemies once they go off screen
                if (this.y > game.height + 200) {
                    this.kill();
                    this.y = -20;
                }
            };
        }
    }

    //  Send another wave soon
    destroyerLaunchTimer = game.time.events.add(game.rnd.integerInRange(destroyerSpacing, destroyerSpacing + 10000), launchDestroyer);
}

function launchBoss() {
    boss.reset(game.width / 2, -boss.height);
    booster.start(false, 1000, 10);
    boss.health = 501;
    bossBulletTimer = game.time.now + 5000;
}

function addEnemyEmitterTrail(enemy) {
    var enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100);
    enemyTrail.width = 10;
    enemyTrail.makeParticles('tieTouch', [1, 2, 3, 4, 5]);
    enemyTrail.setXSpeed(20, -20);
    enemyTrail.setRotation(50, -50);
    enemyTrail.setAlpha(0.4, 0, 800);
    enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
    enemy.trail = enemyTrail;
}


function shipCollide(player, enemy) {
    enemy.kill();

    player.damage(enemy.damageAmount);
    shields.render();

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 100, false, true);
        var sfx2 = game.add.audio('kaboom', 1);
        sfx2.play();
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        game.sound.stopAll();
        var sfx3 = game.add.audio('over', 1);
        sfx3.play();
        playerDeath.start(false, 1000, 10, 10);
    }
}


function hitEnemy(enemy, bullet) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 100, false, true);
    if (enemy.finishOff && enemy.health < 5) {
        enemy.finishOff();
    } else {
        enemy.damage(enemy.damageAmount);
    }
    bullet.kill();

    // Increase score
    if (cheatMode != false) {
        score += enemy.damageAmount * 1000;
        scoreText.render();
    } else {
        score += enemy.damageAmount * 10;
        scoreText.render();
    }
    //  Enemies come quicker as score increases
    tieEnemySpacing *= 0.9;

    //  TieX1 enemies come in after a score of 1000
    if (!tieX1EnemyLaunched && score > 1000) {
        tieX1EnemyLaunched = true;
        launchTieX1Enemy();
        //  Slow Tie enemies down now that there are other enemies
        tieEnemySpacing *= 2;
    }
    //Launch mini boss
    if (!destroyerLaunched && score > 5000) {
        tieEnemySpacing = 2000;
        tieX1EnemySpacing = 6000;
    }

    //  Launch boss
    if (!bossLaunched && score > 15000) {
        tieEnemySpacing = 5000;
        tieX1EnemySpacing = 12000;
        //  dramatic pause before boss
        game.time.events.add(1500, function () {
            bossLaunched = true;
            launchBoss();
        });
    }

    //  Weapon upgrade
    if (score > 5000 && player.weaponLevel < 2) {
        player.weaponLevel = 2;
    }
}

//  Don't count a hit in the lower right and left quarants to aproximate better collisions
function bossHitTest(boss, bullet) {
    if ((bullet.x > boss.x + boss.width / 5 &&
        bullet.y > boss.y) ||
        (bullet.x < boss.x - boss.width / 5 &&
            bullet.y > boss.y)) {
        return false;
    } else {
        return true;
    }
}

function enemyHitsPlayer(player, bullet) {
    bullet.kill();

    player.damage(bullet.damageAmount);
    shields.render()

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        var sfx2 = game.add.audio('kaboom');
        sfx2.play();
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        game.sound.stopAll();
        var sfx3 = game.add.audio('over');
        sfx3.play();
        playerDeath.start(false, 1000, 10, 10);
    }
}


function restart() {
    //  Reset the enemies
    if (hanShotFirst == true) {
        cheatMode = true;
        tieEnemies.callAll('kill');
        game.time.events.remove(tieEnemyLaunchTimer);
        game.time.events.add(1000, launchTieEnemy);
        tieX1Enemies.callAll('kill');
        tieX1EnemiesBullets.callAll('kill');
        game.time.events.remove(tieX1EnemyLaunchTimer);
        game.time.events.add(5000, launchDestroyer);
        destroyer.callAll('kill');
        destroyerBullets.callAll('kill');
        game.time.events.remove(destroyerLaunchTimer);
        boss.kill();
        booster.kill();
        game.time.events.remove(bossLaunchTimer);

        tieX1Enemies.callAll('kill');
        game.time.events.remove(tieX1EnemyLaunchTimer);
        destroyer.callAll('kill');
        game.time.events.remove(destroyerLaunchTimer);
        //  Revive the player
        player = game.add.sprite(400, 700, 'falcon');
        player.anchor.setTo(0.5, 0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
        player.body.drag.setTo(DRAG, DRAG);
        player.weaponLevel = 1;
        player.revive();
        player.health = 9999999;
        shields.render();
        score = 0;
        scoreText.render();

        //  Hide the text
        gameOver.visible = false;

        //  Reset pacing
        tieEnemySpacing = 1000;
        tieX1EnemyLaunched = false;
        destroyerLaunched = false;
        bossLaunched = false;

        // Relaunch music?
        game.sound.stopAll();
        var music = game.add.audio('theme');
        music.play('', 0, 1, true);
    } else {
        cheatMode = false;
        location.replace('../index.html');
    }
}