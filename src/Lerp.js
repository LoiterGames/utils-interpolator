const PI = 3.14159265359
const PI_TIMES_TWO = 6.28318530718

export default class Lerp {

    static clamp(start, end, t) {
        if (t > 0.5) return end
        return start
    }

    static linear(start, end, t) {
        return start + (end - start) * t
    }

    static sphericalDegrees(start, end, t) {
        let result
        let diff = end - start
        if (diff < -180) {
            // lerp upwards past 360
            end += 360
            result = Lerp.linear(start, end, t)
            if (result >= 360) {
                result -= 360
            }
        } else if (diff > 180) {
            // lerp downwards past 0
            end -= 360
            result = Lerp.linear(start, end, t)
            if (result < 0) {
                result += 360
            }
        } else {
            // straight lerp
            result = Lerp.linear(start, end, t)
        }

        return result
    }

    static sphericalRadians(start, end, t) {
        let result
        let diff = end - start
        if (diff < -PI) {
            // lerp upwards past PI_TIMES_TWO
            end += PI_TIMES_TWO
            result = Lerp.linear(start, end, t)
            if (result >= PI_TIMES_TWO) {
                result -= PI_TIMES_TWO
            }
        } else if (diff > PI) {
            // lerp downwards past 0
            end -= PI_TIMES_TWO
            result = Lerp.linear(start, end, t)
            if (result < 0) {
                result += PI_TIMES_TWO
            }
        } else {
            // straight lerp
            result = Lerp.linear(start, end, t)
        }

        return result
    }
}