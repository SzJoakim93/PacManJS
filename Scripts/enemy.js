var enemyAnims = [];
for (var i = 0; i < 4; i++) {
    enemyAnims[i] = new MultipleAnimation("GFX/Ghost" + (i + 1).toString() + ".png", 2, 4, 28, 28, 50);
    enemyAnims[i].addAnim(0, 1, 1, null);
    enemyAnims[i].addAnim(2, 3, 1, null);
    enemyAnims[i].addAnim(4, 5, 1, null);
    enemyAnims[i].addAnim(6, 7, 1, null);
}

var frightenedAnim = new MultipleAnimation("GFX/GhostFrightened.png", 2, 1, 28, 28, 5);
frightenedAnim.addAnim(0, 0, 1, null); //black
frightenedAnim.addAnim(0, 1, 1, null); //switch between black and white
var eyesImg = new Image();
eyesImg.src = "GFX/GhostEyes.png";

var NORMAL = 0;
var FRIGHTENED = 1;
var EYES = 2;
var IN_CAGE = 3;

function Enemy(maze, pac, firstEnemy, index) {
    this.maze = maze;
    this.pac = pac;
    this.animator = new MultipleAnimator(enemyAnims[index]);
    this.frightenedAnimator = new MultipleAnimator(frightenedAnim);

    this.initCoords = { x: (index < 2 ? 7 + index : 8 + index) * this.maze.tileSize, y: 5 * this.maze.tileSize, direction: index < 2 ? 1 : 0 };
    this.enemyCoords = { x: this.initCoords.x, y: this.initCoords.y, direction: this.initCoords.direction };
    this.speed = 4;
    this.frightenedSpeed = 2;
    this.state = IN_CAGE;
    this.frightenedTimer = new TimeoutEvent(200, function (obj) {
        obj.state = NORMAL;
        frightenedGhosts--;
    }, this);

    this.cageTimer = new TimeoutEvent(100 + 200 * index, function (obj) {
        obj.state = NORMAL;
    }, this);
    this.firstEnemy = firstEnemy;

    this.lastDecisionTile = { x: -1, y: -1 };

    this.handleEvents = function () {
        if (this.state === FRIGHTENED) {
            this.frightenedTimer.handleEvent();
            if (this.frightenedTimer.currentTime < 100) {
                this.frightenedAnimator.switchAnim(1);
            }
        }

        if (this.state === IN_CAGE) {
            this.cageTimer.handleEvent();
        }

        // Wrap around horizontally
        var mapWidth = (this.maze.map[0].length - 1) * this.maze.tileSize;

        if (this.enemyCoords.x > mapWidth + 10) {
            this.enemyCoords.x = -10;
        } else if (this.enemyCoords.x < -10) {
            this.enemyCoords.x = mapWidth + 10;
        }

        // Wrap around vertically
        var mapHeight = (this.maze.map.length - 1) * this.maze.tileSize;

        if (this.enemyCoords.y > mapHeight + 10) {
            this.enemyCoords.y = -10;
        } else if (this.enemyCoords.y < -10) {
            this.enemyCoords.y = mapHeight + 10;
        }

        // Determine current speed based on state
        var currentSpeed = this.speed;
        if (this.state === FRIGHTENED) currentSpeed = this.frightenedSpeed;
        else if (this.state === EYES) currentSpeed = 6; // Fast eyes return
        else if (this.state === IN_CAGE) currentSpeed = 0; // Or bounce logic if implemented

        var alignment = this.maze.normalizePosition({ x: this.enemyCoords.x, y: this.enemyCoords.y, direction: this.enemyCoords.direction, speed: currentSpeed });

        var cx = Math.round(this.enemyCoords.x / this.maze.tileSize);
        var cy = Math.round(this.enemyCoords.y / this.maze.tileSize);

        if (this.state !== IN_CAGE) {
            // Move
            switch (this.enemyCoords.direction) {
                case 0: this.enemyCoords.x -= currentSpeed; this.enemyCoords.y = cy * this.maze.tileSize; break;
                case 1: this.enemyCoords.x += currentSpeed; this.enemyCoords.y = cy * this.maze.tileSize; break;
                case 2: this.enemyCoords.y -= currentSpeed; this.enemyCoords.x = cx * this.maze.tileSize; break;
                case 3: this.enemyCoords.y += currentSpeed; this.enemyCoords.x = cx * this.maze.tileSize; break;
            }
        }

        // Check for intersection/decision point
        // We decide when we are aligned to the center of a tile
        // And we are NOT in between tiles (which normalizePosition checks).
        // Actually, we should only decide if we effectively "reached" a new tile center.
        // Or if we are Aligned?

        // Logic: If alignedX AND alignedY (meaning we are at a tile center), we make a decision.
        // But if moving, we might skip the exact center.
        // normalizePosition returns 'true' if we are within range.

        // We only want to decide ONCE per tile.
        // So maybe check if we are close to center, AND we haven't decided for this tile yet?
        // Or just check if we can switch direction.

        // Original code: if (x % 32 === 0 && y % 32 === 0)

        // New code:
        if (alignment.alignedX && alignment.alignedY) {

            // Check if we already decided for this tile
            if (this.lastDecisionTile.x !== cx || this.lastDecisionTile.y !== cy) {
                // Make a decision
                this.lastDecisionTile.x = cx;
                this.lastDecisionTile.y = cy;

                // Snap to center to be clean?
                // If we snap every frame we are near center, we might get stuck or jitter.
                // Only snap if we are going to Change Direction?
                // Actually, we calculate direction every tile?

                // We need to know if we are at a "Decision Point".
                // A decision point is a tile center.
                // We can re-calculate direction.

                // To prevent jitter or multiple calculations, maybe we only allow calculation if we are "very close"
                // or just rely on the fact that we move continuous.

                // Let's rely on alignment.

                // Snap for calculation
                // this.enemyCoords.x = cx * this.maze.tileSize;
                // this.enemyCoords.y = cy * this.maze.tileSize; 
                // Don't snap forcefully unless turning, otherwise smooth movement breaks.

                var newDir = this.enemyCoords.direction;

                if (this.state === NORMAL) {
                    newDir = this.calculateDirection(Math.round(this.pac.pacCoords.x / this.maze.tileSize), Math.round(this.pac.pacCoords.y / this.maze.tileSize));
                } else if (this.state === FRIGHTENED) {
                    newDir = this.calculateDirection(Math.round(this.pac.pacCoords.x / this.maze.tileSize), Math.round(this.pac.pacCoords.y / this.maze.tileSize));
                } else if (this.state === EYES) {
                    newDir = this.calculateDirection(cageCoords.x, cageCoords.y);
                }

                // Only switch if different (and valid?) calculateDirection returns valid bestDir.
                if (newDir !== this.enemyCoords.direction) {
                    // Check if we actually CAN turn (should be guaranteed by calculateDirection logic usually)
                    // But wait, calculateDirection checks canMove from specific coordinates.
                    // If we are slightly off, canMove might fail?
                    // We should pass cx, cy to calculateDirection if possible, or it uses this.enemyCoords.

                    // If we change direction (specifically 90 degrees), we MUST snap to grid.
                    // Otherwise we walk into walls.
                    if ((this.enemyCoords.direction < 2 && newDir >= 2) || (this.enemyCoords.direction >= 2 && newDir < 2)) {
                        this.enemyCoords.x = cx * this.maze.tileSize;
                        this.enemyCoords.y = cy * this.maze.tileSize;
                    }

                    this.enemyCoords.direction = newDir;
                    this.animator.switchAnim(this.enemyCoords.direction);
                }
            }
        }

        if (this.state === EYES && Math.abs(this.enemyCoords.x - cageCoords.x * this.maze.tileSize) < 4 && Math.abs(this.enemyCoords.y - cageCoords.y * this.maze.tileSize) < 4) {
            this.state = NORMAL;
            backToCageGhosts--;
        }
    }

    this.rendering = function () {
        switch (this.state) {
            case FRIGHTENED:
                this.frightenedAnimator.applyAnim(Math.round(this.enemyCoords.x) + mazeOffsetX + 2, Math.round(this.enemyCoords.y) + mazeOffsetY + 2);
                break;
            case EYES:
                ctx.drawImage(eyesImg, Math.round(this.enemyCoords.x) + mazeOffsetX + 2, Math.round(this.enemyCoords.y) + mazeOffsetY + 2);
                break;
            default:
                this.animator.applyAnim(Math.round(this.enemyCoords.x) + mazeOffsetX + 2, Math.round(this.enemyCoords.y) + mazeOffsetY + 2);
                break;
        }
    }

    this.calculateDirection = function (targetX, targetY) {
        var x = Math.round(this.enemyCoords.x / this.maze.tileSize);
        var y = Math.round(this.enemyCoords.y / this.maze.tileSize);

        // Force exit if in cage
        if (y === cageCoords.y && x >= cageCoords.x - 3 && x <= cageCoords.x + 3) {
            if (x < cageCoords.x) return 1; // Right
            if (x > cageCoords.x) return 0; // Left
            return 2; // Up
        }

        // Overwrite target based on state and identity if not in EYES/GhostHouse
        if (this.state !== EYES) {
            // Default Scatter Targets
            if (this.state === FRIGHTENED) {
                // Enemy1: Upper-Right (Width, 0)
                if (index === 0) { targetX = this.maze.map[0].length - 1; targetY = 0; }
                // Enemy2: Lower-Right (Width, Height)
                else if (index === 1) { targetX = this.maze.map[0].length - 1; targetY = this.maze.map.length - 1; }
                // Enemy3: Upper-Left (0, 0)
                else if (index === 2) { targetX = 0; targetY = 0; }
                // Enemy4: Lower-Left (0, Height)
                else if (index === 3) { targetX = 0; targetY = this.maze.map.length - 1; }
            } else if (this.state === NORMAL) {
                var pacX = Math.round(this.pac.pacCoords.x / this.maze.tileSize);
                var pacY = Math.round(this.pac.pacCoords.y / this.maze.tileSize);
                var pacDir = this.pac.pacCoords.direction;

                // Enemy1 (Blinky): Direct Chase
                if (index === 0) {
                    targetX = pacX;
                    targetY = pacY;
                    // Angry mode: If dots < 20, maybe speed up?
                    // User said "Angry mode triggered...". Usually logic remains Chase, but properties change.
                    // For pathfinding, it's just chasing Pac-Man directly.
                }
                // Enemy2 (Inky): Vector from E1 to (Pac+2) * 2
                else if (index === 1) {
                    // Pivot: 2 tiles in front of Pac-Man
                    var pivotX = pacX;
                    var pivotY = pacY;
                    if (pacDir === 0) pivotX -= 2; // Left
                    if (pacDir === 1) pivotX += 2; // Right
                    if (pacDir === 2) { pivotY -= 2; pivotX -= 2; } // Up (Bug: Up/Left)
                    if (pacDir === 3) pivotY += 2; // Down

                    var blinkyX = Math.round(this.firstEnemy.enemyCoords.x / this.maze.tileSize);
                    var blinkyY = Math.round(this.firstEnemy.enemyCoords.y / this.maze.tileSize);

                    var vecX = pivotX - blinkyX;
                    var vecY = pivotY - blinkyY;

                    targetX = blinkyX + vecX * 2;
                    targetY = blinkyY + vecY * 2;
                }
                // Enemy3 (Pinky): 2 tiles in front of Pac-Man (With Bug)
                else if (index === 2) { // User defined Enemy3 as Pinky behavior
                    targetX = pacX;
                    targetY = pacY;
                    if (pacDir === 0) targetX -= 4; // Use 4 ahead for Pinky standard? User said "2 Pac-Dots". Okay, 2.
                    if (pacDir === 1) targetX += 4;
                    if (pacDir === 2) { targetY -= 4; targetX -= 4; } // Bug: Up/Left
                    if (pacDir === 3) targetY += 4;
                    // Wait, standard Pinky is 4 tiles. User said "2 Pac-Dots".
                    // I will follow User instruction: "2 Pac-Dots in front"
                    targetX = pacX;
                    targetY = pacY;
                    if (pacDir === 0) targetX -= 2;
                    if (pacDir === 1) targetX += 2;
                    if (pacDir === 2) { targetY -= 2; targetX -= 2; }
                    if (pacDir === 3) targetY += 2;
                }
                // Enemy4 (Clyde): Chase unless distances < 8
                else if (index === 3) {
                    var distSq = (x - pacX) * (x - pacX) + (y - pacY) * (y - pacY);
                    if (distSq < 64) { // 8 tiles squared
                        // Scatter Target: Lower-Left
                        targetX = 0;
                        targetY = this.maze.map.length - 1;
                    } else {
                        targetX = pacX;
                        targetY = pacY;
                    }
                }
            }
        }

        var validMoves = [];
        // Check all 4 directions
        for (var dir = 0; dir < 4; dir++) {
            if (this.maze.canMove(x, y, dir, this.state === EYES)) {
                // Prevent reversing direction unless it's the only option
                // 0<->1, 2<->3
                var isReverse = false;
                if (this.enemyCoords.direction === 0 && dir === 1) isReverse = true;
                if (this.enemyCoords.direction === 1 && dir === 0) isReverse = true;
                if (this.enemyCoords.direction === 2 && dir === 3) isReverse = true;
                if (this.enemyCoords.direction === 3 && dir === 2) isReverse = true;

                validMoves.push({ dir: dir, reverse: isReverse });
            }
        }

        // Filter out reverse moves if we have alternatives
        var nonReverseMoves = validMoves.filter(function (m) { return !m.reverse; });
        var candidates = nonReverseMoves.length > 0 ? nonReverseMoves : validMoves;

        if (candidates.length === 0) return this.enemyCoords.direction; // Should not happen

        // Find best move (min distance to target)
        var bestDir = candidates[0].dir;
        var minDst = 999999999;

        for (var i = 0; i < candidates.length; i++) {
            var d = candidates[i].dir;
            var nx = x;
            var ny = y;

            if (d === 0) nx--;
            if (d === 1) nx++;
            if (d === 2) ny--;
            if (d === 3) ny++;

            // Simple Euclidean distance squared
            var dst = (nx - targetX) * (nx - targetX) + (ny - targetY) * (ny - targetY);
            if (dst < minDst) {
                minDst = dst;
                bestDir = d;
            }
        }

        return bestDir;
    }

    this.toFrightened = function () {
        if (this.state === EYES) return;
        if (this.state !== FRIGHTENED) {
            frightenedGhosts++;
        }
        this.state = FRIGHTENED;
        this.frightenedAnimator.switchAnim(0);
        this.frightenedTimer.reset();
        this.frightenedTimer.launch();
    }

    this.reset = function () {
        this.enemyCoords = { x: this.initCoords.x, y: this.initCoords.y, direction: this.initCoords.direction };
        this.state = IN_CAGE;
        this.frightenedTimer.reset();
        this.cageTimer.reset();
        this.cageTimer.launch();
        this.lastDecisionTile = { x: -1, y: -1 };
    }

    this.die = function () {
        this.state = EYES;
        backToCageGhosts++;
        frightenedGhosts--;
    }

    this.setLevel = function (level) {
        var levelData = getLevelData(level);
        this.speed = levelData.ghostSpeed;
        this.frightenedSpeed = levelData.ghostFrightSpeed;

        var frightenedTime = 200 - 10 * level;
        var cageTime = 10 + 100 * index;
        this.frightenedTimer.setTime(frightenedTime);
        this.cageTimer.setTime(cageTime);
        this.reset();
    }
}