import Rect from "./Rect";

class RaqueteBreakout extends Rect {
    protected isBig = false;
    protected timer = 0;
    protected isSuperShot = false;

    update(x: number, deltaTime: number) {
        if (x) this.x = x - this.width / 2;

        if (this.isBig) {
            this.timer -= deltaTime;
            this.width = this._width * 2;
            if (this.timer <= 0) {
                this.width = this._width;
                this.isBig = false;
            }
        }
    }

    draw(): void {
        if (this.isSuperShot) {
            this.ctx.save();
            this.ctx.shadowColor = "crimson";
            this.ctx.shadowBlur = 30;
            super.draw();
            this.ctx.restore();
        } else super.draw();
    }

    activeBig() {
        this.timer = 10;
        this.isBig = true;
    }

    activeSuperShot() {
        this.isSuperShot = true;
    }

    desactiveSuperShot() {
        this.isSuperShot = false;
    }

    get getIsSuperShot() {
        return this.isSuperShot;
    }
}

export default RaqueteBreakout;
