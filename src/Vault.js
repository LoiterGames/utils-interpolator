import {SnapshotDiff, Snapshot} from "./Common.js";
import SnapshotPool from "./SnapshotPool.js";

export default class Vault {

    /**
     * @type {Snapshot[]}
     * @private
     */
    _vault = []
    _vaultSize = 60

    __cachedDiff = new SnapshotDiff()

    /**
     * @param id
     * @returns {Snapshot}
     */
    getById(id) {
        return null
    }

    /**
     * @param i {number}
     * @param min {number}
     * @param max {number}
     * @param _data {Snapshot[]}
     * @param anchor {number}
     * @returns {SnapshotDiff}
     * @private
     */
    _findElements(i, min, max, _data, anchor) {
        if (max - min <= 1) {
            this.__cachedDiff.older = _data[min]
            this.__cachedDiff.newer = _data[max]
            return this.__cachedDiff
        }

        const el = _data[i]
        if (el.time < anchor) {
            return this._findElements(i + Math.floor((max-i)/2), i, max, _data, anchor)
        } else {
            return this._findElements(min + Math.floor((i-min)/2), min, i, _data, anchor)
        }
    }
    /**
     * @param time
     * @returns {SnapshotDiff}
     */
    getForInterpolation(time) {
        return this._findElements(Math.floor(this._vault.length/2), 0, this._vault.length-1, this._vault, time)
    }

    /**
     * @param time {number}
     * @returns {Snapshot}
     */
    getClosest(time = undefined) {
        if (typeof (time) === "undefined") return this._vault[0]

        const diff = this.getForInterpolation(time)
        const timeOlder = Math.abs(diff.older.time - time)
        const timeNewer = Math.abs(diff.newer.time - time)
        if (timeOlder < timeNewer) return diff.older
        else return diff.newer
    }

    /**
     * @param value {Snapshot}
     */
    add(value) {
        let insertIndex = 0
        for (let i = this._vault.length-1; i >= 0; i--) {
            const s = this._vault[i]
            if (s.time < value.time) {
                insertIndex = i+1
                break
            }
        }

        this._vault.splice(insertIndex, 0, value)

        if (this._vault.length > this._vaultSize) {
            SnapshotPool.returnSnapshot(this._vault.shift())
        }
    }

    addRaw(value) {

    }

    clear() {
        //todo: implement this
        this._vault.length = 0
    }

    /** @returns {number} */
    get size() { return this._vault.length }
    /** @param value {number} */
    setMaxSize(value) {this._vaultSize = value}
    /** @returns {number} */
    getMaxSize() {return this._vaultSize}
}