function MultipleImage(img, clipCountX, clipCountY, clipWidth, clipHeight) {
    this.image = new Image();
    this.image.src = img;
    this.clip = [];
    for (var i = 0; i < clipCountX*clipCountY; i++) {
        this.clip[i] = new Clip((i%clipCountX)*clipWidth, Math.floor(i/clipCountX)*clipHeight, clipWidth, clipHeight);
    }

    this.apply = function(x, y, clipIndex) {
        ctx.drawImage(this.image,
            this.clip[clipIndex].x,
            this.clip[clipIndex].y,
            this.clip[clipIndex].w,
            this.clip[clipIndex].h,
            x,
            y,
            this.clip[clipIndex].w,
            this.clip[clipIndex].h);
    }
}