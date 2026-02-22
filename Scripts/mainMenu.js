function MainMenu() {
    this.mainTitle = new Image();
    this.mainTitle.src = "GFX/MainTitle.png";
    this.selected = 0;

    this.MAX_MENU_OPTIONS = 3;

    this.handleEvents = function () {

    }

    this.rendering = function () {
        ctx.drawImage(this.mainTitle, canvas.width / 2 - this.mainTitle.width / 2, 68);
        this.drawMenuText("START GAME", canvas.width / 2, 194, 0);
        this.drawMenuText("CHANGE DIFFICULTY", canvas.width / 2, 224, 1);
        this.drawMenuText("CHANGE PLAYERS", canvas.width / 2, 254, 2);

        fontsOrange.apply("HIGH SCORE", canvas.width / 2, 8, ALIGN_CENTER);

        fontsRed.apply(highScore.toString(), canvas.width / 2, 32, ALIGN_CENTER);

        fontsOrange.apply("PLAYERS", 64, 324, ALIGN_LEFT);
        fontsOrange.apply("DIFFICULTY", 64, 354, ALIGN_LEFT);

        fontsRed.apply(players.toString(), 240, 324, ALIGN_LEFT);
        ctx.drawImage(fruitImgs[difficulty], 240, 354);
    }

    this.select = function () {
        switch (this.selected) {
            case 0:
                inGameScene.startNewGame();
                scene = inGameScene;
                break;
            case 1:
                difficulty++;
                if (difficulty >= MAX_DIFFICULTY) {
                    difficulty = 0;
                }
                break;
            case 2:
                players++;
                if (players > MAX_PLAYERS) {
                    players = 1;
                }
                break;
        }
    }

    this.selectPrev = function () {
        this.selected--;
        if (this.selected < 0) {
            this.selected = this.MAX_MENU_OPTIONS - 1;
        }
    }

    this.selectNext = function () {
        this.selected++;
        if (this.selected > this.MAX_MENU_OPTIONS - 1) {
            this.selected = 0;
        }
    }

    this.drawMenuText = function (text, x, y, i) {
        if (this.selected === i) {
            ctx.drawImage(mark, x - mark.width / 2, y - 2);
            fontsGray.apply(text, x, y, ALIGN_CENTER);
        } else {
            fontsOrange.apply(text, x, y, ALIGN_CENTER);
        }
    }
}