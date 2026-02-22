var PACMAN_SIZE = 28;
var DOT_SIZE = 10;
var POWER_PELLET_SIZE = 14;

var READY = 0;
var PLAYING = 1;
var PAUSED = 2;
var GAME_OVER = 3;
var GAINING_POINT = 4;
var COMPLETE = 5;

var readyTimeOut;
var gameOverTimeOut;

var currentPlayer = 0;
var highScore = 0;

var frightenedGhosts = 0;
var backToCageGhosts = 0;

function InGame() {
    this.livesImg = new Image();
    this.livesImg.src = "GFX/Life.png";

    this.pelletSound = new Sound("SFX/Pellet.mp3");
    this.startSound = new Sound("SFX/Start.mp3");
    this.catchSound = new Sound("SFX/Catch.mp3");
    this.ghostBackSound = new Sound("SFX/GhostBack.mp3");
    this.frightenedSound = new Sound("SFX/Frightened.mp3");
    this.dieSound = new Sound("SFX/Die.mp3");
    this.emptySound = new Sound("SFX/Empty.mp3");

    this.maze = new Maze();
    this.pac = new Pac(this.maze);
    this.enemies = [];
    this.isComplete = false;
    this.level = [1, 1];
    this.state = READY;
    this.nextFruit = 1250;

    this.gainingScore = 0;
    this.gainingScoreCoords = { x: 0, y: 0 };

    this.markEffect = [new MarkEffect(15), new MarkEffect(15)];

    readyTimeOut = new TimeoutEvent(50, function (obj) {
        obj.state = PLAYING;
        obj.pac.startAnim();
    }, this);

    gameOverTimeOut = new TimeoutEvent(100, function () {
        scene = mainMenuScene;
    }, null);

    gainPointTimeOut = new TimeoutEvent(15, function (obj) {
        obj.state = PLAYING;
    }, this);

    nextLevelTimeOut = new TimeoutEvent(100, function (obj) {
        obj.level[currentPlayer]++;
        obj.setNewLevel();
    }, this);

    this.pelletTimeOut = new TimeoutEvent(20, null);

    readyTimeOut.launch();

    for (var i = 0; i < 4; i++) {
        this.enemies[i] = new Enemy(this.maze, this.pac, i > 0 ? this.enemies[0] : null, i);
    }

    this.handleEvents = function () {
        if (keystates[KEY_PAUSE]) {
            if (this.state === PLAYING) {
                this.state = PAUSED;
            } else if (this.state === PAUSED) {
                this.state = PLAYING;
            }
        }

        readyTimeOut.handleEvent();
        gameOverTimeOut.handleEvent();
        gainPointTimeOut.handleEvent();
        nextLevelTimeOut.handleEvent();
        this.pelletTimeOut.handleEvent();

        if (!this.pac.isAlive || this.state !== PLAYING) {
            return;
        }

        this.pac.handleEvents();
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].handleEvents();
        }

        this.collision();

        if (this.pac.players[currentPlayer].score >= this.nextFruit) {
            this.nextFruit += 1250;
            spawnFruit();
        }

        if (fruitTimer > 0) {
            fruitTimer--;
        }

        if (backToCageGhosts > 0) {
            this.ghostBackSound.play();
        } else if (frightenedGhosts > 0) {
            this.frightenedSound.play();
        }

        if (!this.pelletSound.playing()
            && !this.startSound.playing()
            && !this.catchSound.playing()
            && !this.ghostBackSound.playing()
            && !this.frightenedSound.playing()
            && !this.dieSound.playing()
            && !this.pelletTimeOut.isLaunched()) {
            this.emptySound.play();
        }
    }

    this.rendering = function () {
        this.maze.draw(ctx);

        if (fruitTimer > 0) {
            this.maze.drawFruit(ctx, this.level[currentPlayer]);
        }

        if (this.state !== COMPLETE) {
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].rendering();
            }

            this.pac.rendering();
        }

        if (currentPlayer === 0) {
            this.markEffect[0].drawFont(fontsOrange, null, "1UP", 50, 4, ALIGN_LEFT);
        } else {
            fontsOrange.apply("1UP", 50, 4, ALIGN_LEFT);
        }

        fontsOrange.apply(this.pac.players[0].score.toString(), 120, 4, ALIGN_LEFT);

        fontsOrange.apply("HS", 300, 4, ALIGN_LEFT);
        fontsOrange.apply(highScore.toString(), 370, 4, ALIGN_LEFT);

        if (players > 1) {
            if (currentPlayer === 1) {
                this.markEffect[1].drawFont(fontsOrange, null, "2UP", 500, 4, ALIGN_LEFT);
            } else {
                fontsOrange.apply("2UP", 500, 4, ALIGN_LEFT);
            }

            fontsOrange.apply(this.pac.players[1].score.toString(), 570, 4, ALIGN_LEFT);
        }

        for (var i = 0; i < this.pac.players[currentPlayer].lives; i++) {
            ctx.drawImage(this.livesImg, 50 + i * 26, 380);
        }

        for (var i = 0; i < this.level[currentPlayer]; i++) {
            ctx.drawImage(fruitImgs[i], 600 - i * 32, 380);
        }

        switch (this.state) {
            case READY:
                fontsOrange.apply("READY", canvas.width / 2, canvas.height / 2 + 20, ALIGN_CENTER);
                break;
            case GAME_OVER:
                fontsRed.apply("GAME OVER", canvas.width / 2, canvas.height / 2 + 20, ALIGN_CENTER);
                break;
            case PAUSED:
                fontsOrange.apply("PAUSED", canvas.width / 2, canvas.height / 2 + 20, ALIGN_CENTER);
                break;
            case COMPLETE:
                fontsOrange.apply("COMPLETE", canvas.width / 2, canvas.height / 2 + 20, ALIGN_CENTER);
                break;
            case GAINING_POINT:
                fontsOrange.apply(this.gainingScore.toString(), this.gainingScoreCoords.x + mazeOffsetX + 10, this.gainingScoreCoords.y + mazeOffsetY + 10, ALIGN_CENTER);
                break;
        }
    }

    this.collision = function () {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].state === IN_CAGE || this.enemies[i].state === EYES) continue;
            var enemyX = this.enemies[i].enemyCoords.x + this.maze.tileSize / 2;
            var enemyY = this.enemies[i].enemyCoords.y + this.maze.tileSize / 2;
            var pacX = this.pac.pacCoords.x + PACMAN_SIZE / 2;
            var pacY = this.pac.pacCoords.y + PACMAN_SIZE / 2;
            if (Math.abs(pacX - enemyX) < 20 && Math.abs(pacY - enemyY) < 20) {
                if (this.enemies[i].state === NORMAL) {
                    this.pac.die();
                    this.dieSound.play();
                }
                else if (this.enemies[i].state === FRIGHTENED) {
                    this.enemies[i].die();
                    this.state = GAINING_POINT;
                    this.gainingScore = 200;
                    this.gainingScoreCoords = { x: Math.round(enemyX), y: Math.round(enemyY) };
                    gainPointTimeOut.launch();
                    this.catchSound.play();
                }
            }
        }

        for (var i = 0; i < this.maze.items[currentPlayer].dots.length; i++) {
            var dotX = this.maze.items[currentPlayer].dots[i].x;
            var dotY = this.maze.items[currentPlayer].dots[i].y;
            var pacX = this.pac.pacCoords.x + PACMAN_SIZE / 2;
            var pacY = this.pac.pacCoords.y + PACMAN_SIZE / 2;

            if (Math.abs(pacX - dotX) < 5 && Math.abs(pacY - dotY) < 5) {
                this.maze.items[currentPlayer].dots.splice(i, 1);
                this.pac.eatDot();
                this.pelletSound.play();
                this.pelletTimeOut.launch(true);
                if (fruitTimer > 0) {
                    fruitTimer += 5;
                }
                if (this.maze.items[currentPlayer].dots.length === 0) {
                    this.state = COMPLETE;
                    nextLevelTimeOut.launch();
                }
                break;
            }
        }

        for (var i = 0; i < this.maze.items[currentPlayer].powerPellets.length; i++) {
            var pelletX = this.maze.items[currentPlayer].powerPellets[i].x;
            var pelletY = this.maze.items[currentPlayer].powerPellets[i].y;
            var pacX = this.pac.pacCoords.x + PACMAN_SIZE / 2;
            var pacY = this.pac.pacCoords.y + PACMAN_SIZE / 2;

            if (Math.abs(pacX - pelletX) < 5 && Math.abs(pacY - pelletY) < 5) {
                this.maze.items[currentPlayer].powerPellets.splice(i, 1);
                this.pac.eatPowerDot();
                for (var j = 0; j < this.enemies.length; j++) {
                    if (this.enemies[j].state !== IN_CAGE) {
                        this.enemies[j].toFrightened();
                    }
                }
                break;
            }
        }

        if (fruitTimer > 0) {
            var fruitX = fruitCoord.x;
            var fruitY = fruitCoord.y;
            var pacX = this.pac.pacCoords.x + PACMAN_SIZE / 2;
            var pacY = this.pac.pacCoords.y + PACMAN_SIZE / 2;

            if (Math.abs(pacX - fruitX) < 5 && Math.abs(pacY - fruitY) < 5) {
                this.state = GAINING_POINT;
                this.gainingScore = fruitPoints[this.level[currentPlayer] - 1];
                this.gainingScoreCoords = { x: Math.round(fruitX), y: Math.round(fruitY) };
                this.pac.eatFruit(this.level[currentPlayer]);
                this.catchSound.play();
                fruitTimer = 0;
                gainPointTimeOut.launch();
            }
        }

        if (this.maze.items[currentPlayer].dots.length === 0) {
            this.isComplete = true;
        }
    }

    this.reset = function () {
        fruitTimer = 0;
        backToCageGhosts = 0;
        frightenedGhosts = 0;
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].reset();
        }

        if (players > 1) {
            currentPlayer = (currentPlayer + 1) % players;
        }
    }

    this.setNewLevel = function () {
        this.maze.reset();
        this.pac.reset();
        this.isComplete = false;
        this.state = READY;

        readyTimeOut.reset();
        readyTimeOut.launch();

        gameOverTimeOut.reset();

        this.pac.setLevel(this.level[currentPlayer]);
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].setLevel(this.level[currentPlayer]);
        }
    }

    this.startNewGame = function () {
        this.level = [difficulty + 1, difficulty + 1];
        this.startSound.play();
        readyTimeOut.setTime(120);
        this.setNewLevel();
        this.pac.setNewGame();
        readyTimeOut.setTime(50);
    }
}
