function Animation(imgSrc, clipCountX, clipCountY, clipWidth, clipHeight, speed) {
    this.image = new Image();
    this.image.src = imgSrc;
    this.clipWidth = clipWidth;
    this.clipHeight = clipHeight;
    this.clips = [];
    this.maxCyle = 100 / speed;

    for (var i = 0; i < clipCountY; i++) {
        for (var j = 0; j < clipCountX; j++) {
            this.clips.push({ x: clipWidth * j, y: clipHeight * i });
        }
    }

    this.applyAnim = function (x, y, i) {
        ctx.drawImage(this.image, this.clips[i].x, this.clips[i].y,
            this.clipWidth, this.clipHeight, x, y, this.clipWidth, this.clipHeight);
    }
}

function Animator(animation, callback, callbackObject) {
    this.animation = animation;
    this.callback = callback;
    this.callbackObject = callbackObject;
    this.isActive = true;

    this.currClip = 0;
    this.currCyle = 0;

    this.applyAnim = function (x, y) {
        if (!this.isActive) return;
        this.animation.applyAnim(x, y, this.currClip);

        this.currCyle++;

        if (this.currCyle >= this.animation.maxCyle) {
            this.currClip++;
            this.currCyle = 0;
            if (this.currClip >= this.animation.clips.length) {
                if (this.callback) {
                    if (this.callbackObject) {
                        this.callback(this.callbackObject);
                    } else {
                        this.callback();
                    }
                }
                this.currClip = 0;
            }
        }
    }

    this.reset = function () {
        this.currClip = 0;
        this.currCyle = 0;
    }

    this.setActive = function (active) {
        this.isActive = active;
    }
}
