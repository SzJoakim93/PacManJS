function Pac(maze) {
    this.maze = maze;
    this.pacAnim = new MultipleAnimation("GFX/Pac.png", 4, 4, 26, 26, 600);

    this.pacAnim.addAnim(2, 2, 1, null); //idle

    this.pacAnim.addAnim(0, 3, 1, 5);
    this.pacAnim.addAnim(4, 7, 1, 6);
    this.pacAnim.addAnim(8, 11, 1, 7);
    this.pacAnim.addAnim(12, 15, 1, 8);

    this.pacAnim.addAnim(3, 0, -1, 1);
    this.pacAnim.addAnim(7, 4, -1, 2);
    this.pacAnim.addAnim(11, 8, -1, 3);
    this.pacAnim.addAnim(15, 12, -1, 4);

    this.pac = new MultipleAnimator(this.pacAnim);
    this.pacDeadAnim = new Animation("GFX/PacDead.png", 13, 1, 26, 26, 20);
    this.pacDeadAnimator = new Animator(this.pacDeadAnim, function (obj) {
        obj.loseLife();
    }, this);

    this.pacCoords = { x: 9 * this.maze.tileSize, y: 8 * this.maze.tileSize, direction: 0, nextDirection: 0 };
    this.speed = 4;
    this.isAlive = true;
    this.players = [
        {
            lives: 3,
            score: 0,
            nextLife: 5000
        },
        {
            lives: 3,
            score: 0,
            nextLife: 5000
        }
    ];

    this.handleEvents = function () {
        // Note: Frightened speed for Pac-Man? 
        // Original game: Pac-Man speeds up in frightened mode (usually) or stays same. Level Data has pacFrightSpeed.
        // We should check if ANY ghost is frightened? Or if global state is "Power Pellet Active"?
        // simplified: if (inGameScene.isFrightened) ... but inGameScene doesn't have that flag directly exposed easily, 
        // we iterate enemies. Let's assume normal speed for now or check enemies.
        // optimization: let InGame scene handle "frightened mode" boolean.
        // For now, let's just use normal speed or maybe check if we can access a global "frightened" state.
        // Actually, let's peek at enemies.
        var isFrightened = false;
        for (var i = 0; i < inGameScene.enemies.length; i++) {
            if (inGameScene.enemies[i].state === FRIGHTENED) {
                isFrightened = true;
                break;
            }
        }
        var currentSpeed = this.speed;
        if (isFrightened) currentSpeed = this.frightenedSpeed;

        // Wrap around horizontally
        var mapWidth = (this.maze.map[0].length - 1) * this.maze.tileSize;

        if (this.pacCoords.x > mapWidth + 10) {
            this.pacCoords.x = -10;
        } else if (this.pacCoords.x < -10) {
            this.pacCoords.x = mapWidth + 10;
        }

        // Wrap around vertically (just in case, though usually not used in standard maps)
        var mapHeight = (this.maze.map.length - 1) * this.maze.tileSize;

        if (this.pacCoords.y > mapHeight + 10) {
            this.pacCoords.y = -10;
        } else if (this.pacCoords.y < -10) {
            this.pacCoords.y = mapHeight + 10;
        }

        var alignment = this.maze.normalizePosition({ x: this.pacCoords.x, y: this.pacCoords.y, direction: this.pacCoords.direction, speed: currentSpeed });

        // Move if aligned or if direction is valid
        // Original logic: "if x%32!=0 ... or canMove..."
        // New logic: Move always, but check collision ahead.
        // The canMove function takes (col, row). calculate based on center?

        // We need current Tile Coords.
        var cx = Math.round(this.pacCoords.x / this.maze.tileSize);
        var cy = Math.round(this.pacCoords.y / this.maze.tileSize);

        // Move
        if (!alignment.alignedX && (this.pacCoords.direction === 0 || this.pacCoords.direction === 1) ||
            !alignment.alignedY && (this.pacCoords.direction === 2 || this.pacCoords.direction === 3) ||
            this.maze.canMove(cx, cy, this.pacCoords.direction)) {
            switch (this.pacCoords.direction) {
                case 0: this.pacCoords.x -= currentSpeed; this.pacCoords.y = cy * this.maze.tileSize; break; // Correct Y when moving X
                case 1: this.pacCoords.x += currentSpeed; this.pacCoords.y = cy * this.maze.tileSize; break;
                case 2: this.pacCoords.y -= currentSpeed; this.pacCoords.x = cx * this.maze.tileSize; break; // Correct X when moving Y
                case 3: this.pacCoords.y += currentSpeed; this.pacCoords.x = cx * this.maze.tileSize; break;
            }
        }

        // Try to turn
        if (this.pacCoords.nextDirection !== this.pacCoords.direction) {
            // If reversing, always allow (unless blocked, but usually reversing is allowed immediately)
            // 0<->1, 2<->3
            var isReverse = (this.pacCoords.direction === 0 && this.pacCoords.nextDirection === 1) ||
                (this.pacCoords.direction === 1 && this.pacCoords.nextDirection === 0) ||
                (this.pacCoords.direction === 2 && this.pacCoords.nextDirection === 3) ||
                (this.pacCoords.direction === 3 && this.pacCoords.nextDirection === 2);

            if (isReverse) {
                this.pac.switchAnim(this.pacCoords.nextDirection + 1);
                this.pacCoords.direction = this.pacCoords.nextDirection;
            } else {
                // Turning 90 degrees requires alignment
                var canTurn = false;
                if ((this.pacCoords.nextDirection === 0 || this.pacCoords.nextDirection === 1) && alignment.alignedY) canTurn = true;
                if ((this.pacCoords.nextDirection === 2 || this.pacCoords.nextDirection === 3) && alignment.alignedX) canTurn = true;

                if (canTurn) {
                    // Check if wall in next direction
                    if (this.maze.canMove(cx, cy, this.pacCoords.nextDirection)) {
                        // Snap to grid
                        this.pacCoords.x = cx * this.maze.tileSize;
                        this.pacCoords.y = cy * this.maze.tileSize;

                        this.pac.switchAnim(this.pacCoords.nextDirection + 1);
                        this.pacCoords.direction = this.pacCoords.nextDirection;
                    }
                }
            }
        }

        if (keystates[KEY_LEFT]) {
            this.pacCoords.nextDirection = 0;
        }
        else if (keystates[KEY_RIGHT]) {
            this.pacCoords.nextDirection = 1;
        }
        else if (keystates[KEY_UP]) {
            this.pacCoords.nextDirection = 2;
        }
        else if (keystates[KEY_DOWN]) {
            this.pacCoords.nextDirection = 3;
        }

        if (this.players[currentPlayer].score >= this.players[currentPlayer].nextLife) {
            this.players[currentPlayer].lives++;
            this.players[currentPlayer].nextLife += 5000;
        }
    }

    this.rendering = function () {
        if (this.isAlive) {
            this.pac.applyAnim(Math.round(this.pacCoords.x) + mazeOffsetX + 2, Math.round(this.pacCoords.y) + mazeOffsetY + 2);
        } else {
            this.pacDeadAnimator.applyAnim(Math.round(this.pacCoords.x) + mazeOffsetX + 2, Math.round(this.pacCoords.y) + mazeOffsetY + 2);
        }
    }

    this.die = function () {
        this.isAlive = false;
        this.pacDeadAnimator.reset();
    }

    this.eatDot = function () {
        this.players[currentPlayer].score += 10;
    }

    this.eatPowerDot = function () {
        this.players[currentPlayer].score += 50;
    }

    this.eatFruit = function (level) {
        this.players[currentPlayer].score += fruitPoints[level - 1];
    }

    this.eatGhost = function () {
        this.players[currentPlayer].score += 200;
    }

    this.loseLife = function () {
        this.players[currentPlayer].lives--;

        if (this.players[0].lives === 0 && (this.players[1].lives === 0 || players === 1)) {
            inGameScene.state = GAME_OVER;
            gameOverTimeOut.launch();
            this.pacDeadAnimator.setActive(false);
            if (this.players[currentPlayer].score > highScore) {
                highScore = this.players[currentPlayer].score;
            }
        } else {
            this.reset();
            this.isAlive = true;
            inGameScene.state = READY;
            inGameScene.reset();
            readyTimeOut.launch();
        }
    }

    this.reset = function () {
        this.pacCoords = { x: 9 * this.maze.tileSize, y: 8 * this.maze.tileSize, direction: 0, nextDirection: 0 };
        this.pac.switchAnim(0);
        this.pacDeadAnimator.setActive(true);
    }

    this.startAnim = function () {
        this.pac.switchAnim(1);
    }

    this.setLevel = function (level) {
        var levelData = getLevelData(level);
        this.speed = levelData.pacSpeed;
        this.frightenedSpeed = levelData.pacFrightSpeed;
    }

    this.setNewGame = function () {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].score = 0;
            this.players[i].lives = 3;
        }
        this.isAlive = true;
        this.reset();
    }
}