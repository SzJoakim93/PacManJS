
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 400;

var mainMenuScene = new MainMenu();
var inGameScene = new InGame();

var scene = mainMenuScene;

function sizeCanvas() {
    var scaleX = (innerWidth - 20) / canvas.width;
    var scaleY = (innerHeight - 20) / canvas.height;

    var scaleToFit = Math.min(scaleX, scaleY);

    canvas.style.transformOrigin = "50% 0 0"; //scale from top left
    canvas.style.transform = "translateX(" + (innerWidth / 2 - canvas.width / 2).toString() + "px) scale(" + scaleToFit.toString() + ")";
}

sizeCanvas();
addEventListener("resize", sizeCanvas);

var fontsOrange = new Font("GFX/FontsOrange.png", 10, 9, 16, 16);
var fontsRed = new Font("GFX/FontsRed.png", 10, 9, 16, 16);
var fontsGray = new Font("GFX/FontsGray.png", 10, 9, 16, 16);
var mark = new Image();
mark.src = "GFX/Mark.png";

function _requestAnimationFrame(draw) {
    if (requestAnimationFrame) {
        requestAnimationFrame(draw);
    } else if (webkitRequestAnimationFrame) {
        webkitRequestAnimationFrame(draw);
    } else if (mozRequestAnimationFrame) {
        mozRequestAnimationFrame(draw);
    } else if (msRequestAnimationFrame) {
        msRequestAnimationFrame(draw);
    }
}

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scene.handleEvents();
    scene.rendering();
}

limitLoop(main, 30);