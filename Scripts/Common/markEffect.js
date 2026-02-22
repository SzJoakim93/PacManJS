function MarkEffect(efficient) {
    this.efficient = efficient;
    this.timer = efficient;

    this.drawImage = function (img1, img2, x, y) {
        if (this.timer > this.efficient / 2) {
            ctx.drawImage(img1, x, y);
        } else if (img2) {
            ctx.drawImage(img2, x, y);
        }

        this.timer--;
        if (this.timer === 0) {
            this.timer = this.efficient;
        }
    }

    this.drawFont = function (font1, font2, text, x, y, align) {
        if (this.timer > this.efficient / 2) {
            font1.apply(text, x, y, align);
        } else if (font2) {
            font2.apply(text, x, y, align);
        }

        this.timer--;
        if (this.timer === 0) {
            this.timer = this.efficient;
        }
    }
}