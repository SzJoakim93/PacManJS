var MAX_DIFFICULTY = 7;
var MAX_PLAYERS = 2;

var difficulty = 0;
var players = 1;

// Level Data based on original Pac-Man specs (approximate), adjusted for faster MS-DOS feel
// Speeds are multipliers of base speed (using pixel values directly for simplicity in this engine)
// Original MS-DOS variant is often perceived as ~25% faster overall.
// Let's define base MaxSpeed as ~5.0.
// Level 1: Pac: 80%, Ghost: 75% -> Pac: 4.0, Ghost: 3.75
// Level 2-4: Pac: 90%, Ghost: 85% -> Pac: 4.5, Ghost: 4.25
// Level 5-20: Pac: 100%, Ghost: 95% -> Pac: 5.0, Ghost: 4.75
// Level 21+: Pac: 90%, Ghost: 95% -> Pac: 4.5, Ghost: 4.75
// Frightened:
// Level 1: Pac: 90%, Ghost: 50% -> Pac: 4.5, Ghost: 2.5
// Level 2-4: Pac: 95%, Ghost: 55% -> Pac: 4.75, Ghost: 2.75
// Level 5+: Pac: 100%, Ghost: 60% -> Pac: 5.0, Ghost: 3.0
// Fright Times (frames assuming 60fps):
// L1: 6s (360), L2: 5s (300), L3: 4s (240), L4: 3s (180), L5: 2s (120), L6: 5s (300)... complex.
// Simplified Fright Times: decreasing.

var LEVEL_DATA = [
    { id: 0, pacSpeed: 4.0, ghostSpeed: 3.75, pacFrightSpeed: 4.5, ghostFrightSpeed: 2.5, frightTime: 360 }, // Level 1
    { id: 1, pacSpeed: 4.5, ghostSpeed: 4.25, pacFrightSpeed: 4.75, ghostFrightSpeed: 2.75, frightTime: 300 }, // Level 2
    { id: 2, pacSpeed: 4.5, ghostSpeed: 4.25, pacFrightSpeed: 4.75, ghostFrightSpeed: 2.75, frightTime: 240 }, // Level 3
    { id: 3, pacSpeed: 4.5, ghostSpeed: 4.25, pacFrightSpeed: 4.75, ghostFrightSpeed: 2.75, frightTime: 180 }, // Level 4
    { id: 4, pacSpeed: 5.0, ghostSpeed: 4.75, pacFrightSpeed: 5.0, ghostFrightSpeed: 3.0, frightTime: 120 }, // Level 5
    // Repeating pattern for higher levels or cap it
];

function getLevelData(level) {
    if (level < 1) level = 1;
    var index = level - 1;
    if (index >= LEVEL_DATA.length) {
        // Fallback to last defined level or specific logic for 21+
        // For now, clamp to level 5 stats (index 4)
        index = 4;
        // Adjust fright time if needed for higher levels (usually it drops to 0 or near 0)
        if (level > 10) return { pacSpeed: 4.5, ghostSpeed: 4.75, pacFrightSpeed: 5.0, ghostFrightSpeed: 3.0, frightTime: 60 };
        return LEVEL_DATA[4];
    }
    return LEVEL_DATA[index];
}
