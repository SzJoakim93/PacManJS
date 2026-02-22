var mazeOffsetX;
var mazeOffsetY;

var cageCoords = { x: 9, y: 5 };
var fruitCoord = { x: 9 * 32 + 16, y: 6 * 32 + 16 };
var fruitTimer = 0;

function spawnFruit() {
    fruitTimer = 150;
}

function Maze() {
    this.dotBigImg = new Image();
    this.dotBigImg.src = "GFX/DotBig.png";

    this.tileSize = 32;
    this.wallColor = "#00aa00"; // Green walls
    this.doorColor = "#aa0000"; // Red door

    // Tile IDs:
    // 0: Horizontal (Left-Right)
    // 1: Vertical (Up-Down)
    // 2: Corner ┐ (Left-Down)
    // 3: Corner ┌ (Right-Down)
    // 4: Corner └ (Right-Up)
    // 5: Corner ┘ (Left-Up)
    // 6: Cross ┴ (Left-Right-Up)
    // 7: Cross ┬ (Left-Right-Down)
    // 8: Cross ├ (Up-Down-Right)
    // 9: Cross ┤ (Up-Down-Left)
    // 10: Cross ┼ (All)
    // 11: Ghost House Left-End
    // 12: Ghost House Middle
    // 13: Ghost House Exit (Door)
    // 14: Ghost House Right-End
    // Correcting the map to be more logical (connections must match)
    // Row 5 (Ghost House) needs to be careful.
    // Let's manually redesign a simple consistent map.
    this.map = [
        [3, 0, 0, 7, 0, 0, 0, 0, 2, -1, 3, 0, 0, 0, 0, 7, 0, 0, 2],
        [1, -1, -1, 1, -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1],
        [8, 0, 0, 10, 0, 7, 0, 0, 6, 0, 6, 0, 0, 7, 0, 10, 0, 0, 9],
        [4, 0, 0, 9, -1, 4, 0, 0, 2, -1, 3, 0, 0, 5, -1, 8, 0, 0, 5],
        [-1, -1, -1, 1, -1, 3, 0, 0, 6, 0, 6, 0, 0, 2, -1, 1, -1, -1, -1],
        [0, 0, 0, 10, 0, 9, 11, 12, 12, 13, 12, 12, 14, 8, 0, 10, 0, 0, 0],
        [-1, -1, -1, 1, -1, 8, 0, 0, 0, 0, 0, 0, 0, 9, -1, 1, -1, -1, -1],
        [3, 0, 0, 10, 0, 6, 0, 0, 2, -1, 3, 0, 0, 6, 0, 10, 0, 0, 2],
        [4, 0, 2, 8, 0, 7, 0, 0, 6, 0, 6, 0, 0, 7, 0, 9, 3, 0, 5],
        [3, 0, 6, 5, -1, 4, 0, 0, 2, -1, 3, 0, 0, 5, -1, 4, 6, 0, 2],
        [4, 0, 0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 0, 0, 5]
    ];

    this.blocked = [
        [true, false, true, false],
        [false, true, false, true],
        [true, true, false, false],
        [true, false, false, true],
        [false, false, true, true],
        [false, true, true, false],
        [false, false, true, false],
        [true, false, false, false],
        [false, false, false, true],
        [false, true, false, false],
        [false, false, false, false],
        [true, false, true, true],
        [true, false, true, false],
        [false, false, true, false],
        [true, true, true, false]
    ];

    mazeOffsetX = (ctx.canvas.width - (this.map[0].length * this.tileSize)) / 2;
    mazeOffsetY = (ctx.canvas.height - (this.map.length * this.tileSize)) / 2;

    this.canMove = function (col, row, direction, allowDoor) {
        var tile = this.map[row][col];
        var blocked = this.blocked[tile];

        if (allowDoor) {
            // Allow entering Ghost House (At 9,4 going Down)
            if (col === cageCoords.x && row === cageCoords.y - 1 && direction === 3) {
                return true;
            }
            // Allow exiting Ghost House (At 9,5 going Up)
            if (col === cageCoords.x && row === cageCoords.y && direction === 2) {
                return true;
            }
        }

        if (direction === 0 && blocked[3]) {
            return false;
        }
        if (direction === 1 && blocked[1]) {
            return false;
        }
        if (direction === 2 && blocked[0]) {
            return false;
        }
        if (direction === 3 && blocked[2]) {
            return false;
        }

        return true;
    }

    this.reset = function () {
        this.items = [
            {
                dots: [],
                powerPellets: []
            },
            {
                dots: [],
                powerPellets: []
            }
        ];

        // Initialize dots based on map
        var ppLocs = [[0, 1], [18, 1], [0, 9], [18, 9]];
        for (var r = 0; r < this.map.length; r++) {
            for (var c = 0; c < this.map[r].length; c++) {
                var isPowerPellet = false;
                // Check if this tile is a power pellet location
                for (var i = 0; i < ppLocs.length; i++) {
                    if (c === ppLocs[i][0] && r === ppLocs[i][1]) {
                        isPowerPellet = true;
                        break;
                    }
                }

                for (var j = 0; j < players; j++) {
                    if (isPowerPellet) {
                        this.items[j].powerPellets.push({ x: c * this.tileSize + this.tileSize / 2, y: r * this.tileSize + this.tileSize / 2 });
                    } else {
                        var tile = this.map[r][c];
                        if (tile >= 0 && tile <= 10) {
                            if (r >= cageCoords.y - 1 && r <= cageCoords.y + 1 && c >= cageCoords.x - 4 && c <= cageCoords.x + 4
                                || r === cageCoords.y && c !== 3 && c !== 15
                                || r === 8 && c === 9) continue;
                            if (tile === 0) { //on horizontal place two dots to one tile horizontaly
                                this.items[j].dots.push({ x: c * this.tileSize + this.tileSize / 4, y: r * this.tileSize + this.tileSize / 2, type: 0 });
                                this.items[j].dots.push({ x: c * this.tileSize + this.tileSize * 3 / 4, y: r * this.tileSize + this.tileSize / 2, type: 0 });
                            } else if (tile === 1) { //on vertical place two dots to one tile verticaly
                                this.items[j].dots.push({ x: c * this.tileSize + this.tileSize / 2, y: r * this.tileSize + this.tileSize / 4, type: 0 });
                                this.items[j].dots.push({ x: c * this.tileSize + this.tileSize / 2, y: r * this.tileSize + this.tileSize * 3 / 4, type: 0 });
                            } else { //on corners and crosses place one dot to one tile
                                this.items[j].dots.push({ x: c * this.tileSize + this.tileSize / 2, y: r * this.tileSize + this.tileSize / 2, type: 0 });
                            }
                        }
                    }
                }
            }
        }
    }

    //this.reset();

    this.draw = function (ctx) {
        ctx.strokeStyle = this.wallColor;
        ctx.lineWidth = 2;
        ctx.fillStyle = this.wallColor; // For dots

        for (var r = 0; r < this.map.length; r++) {
            for (var c = 0; c < this.map[r].length; c++) {
                var tile = this.map[r][c];
                var x = mazeOffsetX + c * this.tileSize;
                var y = mazeOffsetY + r * this.tileSize;
                var s = this.tileSize;

                // Directions: 0:Top, 1:Right, 2:Bottom, 3:Left
                // Blocked: true if wall (Draw Line)
                var blocked = this.blocked[tile];

                if (tile === -1) {
                    continue;
                }

                // Draw Lines on Blocked Sides
                ctx.beginPath();
                if (blocked[0]) { ctx.moveTo(x, y); ctx.lineTo(x + s, y); } // Top
                if (blocked[1]) { ctx.moveTo(x + s, y); ctx.lineTo(x + s, y + s); } // Right
                if (blocked[2]) { ctx.moveTo(x, y + s); ctx.lineTo(x + s, y + s); } // Bottom
                if (blocked[3]) { ctx.moveTo(x, y); ctx.lineTo(x, y + s); } // Left
                ctx.stroke();

                // Draw Door Special
                if (tile === 13) {
                    ctx.save();
                    ctx.strokeStyle = this.doorColor;
                    ctx.beginPath();
                    ctx.moveTo(x, y + s / 2); // Door usually in middle? Or on Top line?
                    // User said "13: ghost house exit". Usually top line is the door.
                    // If tile 13 is the path *below* the door, then Top is blocked by door line.
                    // If tile 13 is the door itself, maybe draw line on Top.
                    ctx.moveTo(x, y); ctx.lineTo(x + s, y); // Top Line (Door)
                    ctx.stroke();
                    ctx.restore();
                }

                // Draw Dots on Corners
                // Logic: If Corner is (Top, Left) -> Check Blocked[Top] and Blocked[Left]
                // If BOTH are FALSE (Open), Draw Dot.
                // TL (Top, Left - 0, 3)
                if (!blocked[0] && !blocked[3]) { this.drawDot(ctx, x, y); }
                // TR (Top, Right - 0, 1)
                if (!blocked[0] && !blocked[1]) { this.drawDot(ctx, x + s, y); }
                // BR (Bottom, Right - 2, 1)
                if (!blocked[2] && !blocked[1]) { this.drawDot(ctx, x + s, y + s); }
                // BL (Bottom, Left - 2, 3)
                if (!blocked[2] && !blocked[3]) { this.drawDot(ctx, x, y + s); }
            }
        }

        // Draw Pellets
        this.drawItems(ctx);
    };

    this.drawDot = function (ctx, x, y) {
        ctx.beginPath();
        ctx.fillRect(x - 1, y - 1, 2, 2);
        ctx.fill();
    };

    this.drawItems = function (ctx) {
        // Dots
        ctx.fillStyle = "#aa5500"; // Salmon color
        for (var i = 0; i < this.items[currentPlayer].dots.length; i++) {
            var d = this.items[currentPlayer].dots[i];
            ctx.fillRect(d.x - 2 + mazeOffsetX, d.y - 2 + mazeOffsetY, 4, 4);
        }

        // Power Pellets
        for (var i = 0; i < this.items[currentPlayer].powerPellets.length; i++) {
            var p = this.items[currentPlayer].powerPellets[i];
            ctx.drawImage(this.dotBigImg, p.x - 7 + mazeOffsetX, p.y - 6 + mazeOffsetY);
        }
    };

    this.drawFruit = function (ctx, level) {
        ctx.drawImage(fruitImgs[level - 1], fruitCoord.x - 7 + mazeOffsetX, fruitCoord.y - 6 + mazeOffsetY);
    };

    this.normalizePosition = function (obj) {
        // Obj must have x, y, direction, speed
        // Returns true if "centered" enough to turn/decide

        var x = obj.x;
        var y = obj.y;
        var s = obj.speed;

        // Check if close to center of a tile
        // TileSize = 32. Center is at Index*32? No, coordinates are top-left of tile.
        // We want to snap when x is multiple of 32.

        var tolerance = s / 2 + 0.5; // Slightly lenient

        var modX = x % this.tileSize;
        var modY = y % this.tileSize;

        // If moving Horizontal (0, 1), we care about X being aligned? 
        // No, if moving Horizontal, we are ALREADY aligned on Y usually. 
        // We want to detect if we reached a NEW tile (X % 32 approx 0).

        // Actually, for turning:
        // If moving Left/Right, we can only turn Up/Down if X is aligned.
        // If moving Up/Down, we can only turn Left/Right if Y is aligned.

        var alignedX = false;
        var alignedY = false;

        if (modX < tolerance || modX > this.tileSize - tolerance) {
            alignedX = true;
        }
        if (modY < tolerance || modY > this.tileSize - tolerance) {
            alignedY = true;
        }

        return { alignedX: alignedX, alignedY: alignedY, modX: modX, modY: modY };
    }
}
