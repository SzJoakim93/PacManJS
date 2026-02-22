function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    if (this.sound.duration > 0 && this.sound.currentTime >= this.sound.duration - 0.08) {
      this.sound.currentTime = 0;
    }
    this.sound.play();
  }

  this.stop = function () {
    this.sound.pause();
  }

  this.playing = function () {
    return this.sound.duration > 0 && !this.sound.paused;
  }
}
