export class Vec2 {
    constructor(x = null, y = null) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
            this.x = x;
            this.y = y;
        } else if (Number.isFinite(x)) {
            this.x = x;
            this.y = x;
        } else if (x instanceof Vec2) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    static zero() {
        return new Vec2(0);
    }

    static add(a, b) {
        if (Number.isFinite(a) && b instanceof Vec2)
            return new Vec2(a + b.x, a + b.y);
        else if (a instanceof Vec2 && Number.isFinite(b))
            return new Vec2(a.x + b, a.y + b);
        else if (a instanceof Vec2 && b instanceof Vec2)
            return new Vec2(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
        if (Number.isFinite(a) && b instanceof Vec2)
            return new Vec2(a - b.x, a - b.y);
        else if (a instanceof Vec2 && Number.isFinite(b))
            return new Vec2(a.x - b, a.y - b);
        else if (a instanceof Vec2 && b instanceof Vec2)
            return new Vec2(a.x - b.x, a.y - b.y);
    }

    static minus(a) {
        return new Vec2(-a.x, -a.y);
    }

    static mul(a, b) {
        if (Number.isFinite(a) && b instanceof Vec2)
            return new Vec2(a * b.x, a * b.y);
        else if (a instanceof Vec2 && Number.isFinite(b))
            return new Vec2(a.x * b, a.y * b);
        else if (a instanceof Vec2 && b instanceof Vec2)
            return new Vec2(a.x * b.x, a.y * b.y);
    }

    static div(a, b) {
        if (Number.isFinite(b))
            return Vec2.mul(a, 1/b);
        else if (b instanceof Vec2)
            return Vec2.mul(a, Vec2.reciprocal(b));
    }

    static reciprocal(a) {
        return new Vec2(1/a.x, 1/a.y);
    }

    static dot(a, b) {
        return a.x*b.x + a.y*b.y;
    }

    static normalize(a) {
        return Vec2.div(a, Vec2.length(a));
    }

    static length(a) {
        return Math.sqrt(Vec2.dot(a, a));
    }
}
