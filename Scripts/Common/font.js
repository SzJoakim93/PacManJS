var ALIGN_LEFT = 0;
var ALIGN_CENTER = 1;
var ALIGN_RIGHT = 2;

function Font(img, clipCountX, clipCountY, clipWidth, clipHeight) {
    this.fontImage = new MultipleImage(img, clipCountX, clipCountY, clipWidth, clipHeight);

    this.apply = function (word, x, y, align) {
        switch (align) {
            case ALIGN_LEFT:
                break;
            case ALIGN_CENTER:
                x -= word.length * clipWidth / 2;
                break;
            case ALIGN_RIGHT:
                x -= word.length * clipWidth;
                break;
        }
        for (var i = 0; i < word.length; i++) {
            if (word.charCodeAt(i) - 33 >= 0) {
                this.fontImage.apply(x + i * clipWidth, y, word.charCodeAt(i) - 33);
            }
        }
    }
}