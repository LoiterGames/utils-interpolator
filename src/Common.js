/**
 * @callback LerpFunction
 * @template T
 * @param start {T}
 * @param end {T}
 * @param t {number}
 * @returns {T}
 */
import SnapshotPool from "./SnapshotPool.js";

const LerpFunction = (start, end, t) => {

}

class SISchema {

    /**
     * @type {string[]}
     */
    keys = []

    /**
     * @template T
     * @type {LerpFunction[]}
     */
    methods = []
}


/**
 * @interface {IEntity}
 */
class IEntity {
    id = -1
}

/**
 * @param from {IEntity}
 * @param to {IEntity}
 */
export const copyEntity = (from, to) => {
    for (let key in from) {
        to[key] = from[key]
    }
}

/**
 * @class {Snapshot}
 */
class Snapshot {
    id = -1
    time = -1

    /**
     * @type {IEntity[]}
     */
    state = []

    /**
     * @param value {[]}
     * @returns {Snapshot}
     */
    decompress(value) {

    }

    /**
     * @param value {Snapshot}
     * @returns {[]}
     */
    compress(value) {

    }

    /**
     * @param other {Snapshot}
     */
    copy(other) {
        this.id = other.id
        this.time = other

        for (let i = 0; i < other.state.length; i++) {
            const e = SnapshotPool.getEntity()
            copyEntity(other[i], e)
            this.state.push(e)
        }
    }
}

class InterpolatedSnapshot {
    /**
     * @type {Snapshot}
     */
    state = null

    percentage = -1
    older = -1
    newer = -1
}

//
// internal classes

export class Quat {x; y; z; w}

export class SnapshotDiff {
    /**
     * @type {Snapshot}
     */
    older = null

    /**
     * @type {Snapshot}
     */
    newer = null
}

export class OffsetCalculator {
    _offsetHistory = []
    _maxLen = 6

    constructor(maxLen = undefined) {
        if (maxLen) this._maxLen = maxLen
    }

    next(timeServer) {
        const timeLocal = Date.now()
        const off = timeLocal - timeServer
        this._offsetHistory.push(off)
        if (this._offsetHistory.length > this._maxLen) {
            this._offsetHistory.shift()
        }

        let sum = 0
        for (let i = 0; i < this._offsetHistory.length; i++) {
            sum += this._offsetHistory[i]
        }

        return sum / this._offsetHistory.length
    }
}

export {IEntity, Snapshot, SISchema, InterpolatedSnapshot}