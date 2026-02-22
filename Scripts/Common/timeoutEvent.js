function TimeoutEvent(time, callbackFunc, obj, isInfinite) {
    this.maxTime = time;
    this.currentTime = 0;
    this.callbackFunc = callbackFunc;
    this.obj = obj;

    this.launch = function (isForced = false) {
        if (this.currentTime === 0 || isForced) {
            this.currentTime = this.maxTime;
        }
    }

    this.handleEvent = function () {
        if (this.currentTime > 0) {
            this.currentTime--;

            if (this.currentTime === 1) {
                if (this.callbackFunc) {
                    if (this.obj) {
                        callbackFunc(this.obj);
                    } else {
                        callbackFunc();
                    }
                }

                this.currentTime = isInfinite ? this.maxTime : 0;
            }
        }
    }

    this.isLaunched = function () {
        return this.currentTime > 0;
    }

    this.reset = function () {
        this.currentTime = 0;
    }

    this.setTime = function (time) {
        this.maxTime = time;
    }
}