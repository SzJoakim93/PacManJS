function MultipleAnimation(imgSrc, clipCountX, clipCountY, clipWidth, clipHeight, speed) {
    this.image = new Image();
    this.image.src = imgSrc;
    this.clipWidth = clipWidth;
    this.clipHeight = clipHeight;
    this.speed = speed;
    this.maxCyle = 100 / speed;
    this.clips = [];
    this.animations = [];

    for (var i = 0; i < clipCountY; i++) {
        for (var j = 0; j < clipCountX; j++) {
            this.clips.push({ x: clipWidth * j, y: clipHeight * i });
        }
    }

    this.addAnim = function (from, to, direction, nextAnim) {
        this.animations.push({ from: from, to: to, direction: direction, nextAnim: nextAnim });
    }

    this.applyAnim = function (x, y, i) {
        ctx.drawImage(this.image, this.clips[i].x, this.clips[i].y,
            this.clipWidth, this.clipHeight, x, y, this.clipWidth, this.clipHeight);
    }
}

function MultipleAnimator(animation) {
    this.animation = animation;

    this.currAnim = 0;
    this.currClip = 0;
    this.currCyle = 0;

    this.switchAnim = function (animIndex) {
        if (this.currAnim === animIndex) {
            return;
        }
        this.currAnim = animIndex;
        this.currCyle = 0;
        this.currClip = this.animation.animations[animIndex].from;
    }

    this.applyAnim = function (x, y) {
        this.animation.applyAnim(x, y, this.currClip);
        this.currCyle++;

        if (this.currCyle >= this.animation.maxCyle) {
            this.currClip += this.animation.animations[this.currAnim].direction;
            this.currCyle = 0;
            if (this.animation.animations[this.currAnim].direction === 1
                && this.currClip > this.animation.animations[this.currAnim].to
                || this.animation.animations[this.currAnim].direction === -1
                && this.currClip < this.animation.animations[this.currAnim].to) {
                if (this.animation.animations[this.currAnim].nextAnim !== null) {
                    this.currAnim = this.animation.animations[this.currAnim].nextAnim;
                }
                this.currClip = this.animation.animations[this.currAnim].from;
            }
        }
    }
}