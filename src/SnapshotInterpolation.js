import Vault from "./Vault.js";
import {InterpolatedSnapshot, OffsetCalculator, Snapshot, SISchema, copyEntity} from "./Common.js";
import SnapshotPool from "./SnapshotPool.js";
import Lerp from "./Lerp.js";

export default class SnapshotInterpolation {

    vault = new Vault()
    _interpolationBuffer = 100

    serverTime = 0

    /**
     * @type {SISchema}
     */
    _schema = null

    _timeOffset = -1
    _timeOffsetCalculator = new OffsetCalculator()

    _currentState = new InterpolatedSnapshot()

    /**
     * @param schema {SISchema}
     * @param serverFPS {number}
     */
    constructor(schema, serverFPS = undefined) {
        if (serverFPS) {
            this._interpolationBuffer = (1000/serverFPS) * 3
        }
        this._schema = schema

        this._currentState.state = SnapshotPool.createSnapshot()
    }

    get timeOffset() {return this._timeOffset}

    /**
     * @param value {Snapshot}
     */
    addSnapshot(value) {
        this._timeOffset = this._timeOffsetCalculator.next(value.time)

        this.vault.add(value)
    }

    /**
     * @param value {Uint8Array}
     */
    addSnapshotRaw(value) {
        this.addSnapshot(SnapshotPool.reconstructSnapshot(value))
    }

    /**
     * @returns {InterpolatedSnapshot | undefined}
     */
    calcInterpolation() {
        if (this.vault.size < 3) return undefined

        const serverTime = Date.now() - this._timeOffset - this._interpolationBuffer

        const diff = this.vault.getForInterpolation(serverTime)

        const timeInsideSnapshot = serverTime - diff.older.time
        const timeBetweenSnapshots = diff.newer.time - diff.older.time

        const t = timeInsideSnapshot / timeBetweenSnapshots

        this.serverTime = Lerp.linear(diff.older.time, diff.newer.time, t)

        SnapshotPool.returnSnapshot(this._currentState.state)
        this._currentState.state = SnapshotPool.createSnapshot(this.serverTime)
        this._currentState.newer = diff.newer.id
        this._currentState.older = diff.older.id
        this._currentState.percentage = t

        for (let i = 0; i < diff.older.state.length; i++) {
            const eOld = diff.older.state[i]
            const eNew = diff.newer.state.find(_=>_.id === eOld.id) // TODO : maybe this could be improved

            if (!eNew) continue // this entity has not appeared yet

            const eCurrent = SnapshotPool.getEntity()
            copyEntity(eOld, eCurrent) // we do check for non-lerpable parameters

            for (let j = 0; j < this._schema.keys.length; j++) {
                const key = this._schema.keys[j]
                const lerpFunc = this._schema.methods[j]

                eCurrent[key] = lerpFunc(eOld[key], eNew[key], t)
            }

            this._currentState.state.state.push(eCurrent)
        }

        return this._currentState
    }
}