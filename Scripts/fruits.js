var fruitImgs = [];
for (var i = 0; i < 7; i++) {
    fruitImgs[i] = new Image();
    fruitImgs[i].src = "GFX/Fruit" + (i + 1).toString() + ".png";
}

var fruitPoints = [100, 300, 500, 700, 1000, 2000, 3000, 5000];