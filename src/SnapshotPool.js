import {Snapshot, IEntity} from "./Common.js";

export default class SnapshotPool {
    static __nextSnapshotId = 100
    static NewId() { return SnapshotPool.__nextSnapshotId++ }

    /**
     * @type {Snapshot[]}
     * @private
     */
    static __snapshotPool = []

    /**
     * @type {function}
     * @private
     */
    static __entityConstructor = null

    /**
     * @type {IEntity[]}
     * @private
     */
    static __entityPool = []

    /**
     * @param time
     * @returns {Snapshot}
     */
    static createSnapshot(time = undefined) {
        let snap = null
        if (SnapshotPool.__snapshotPool.length > 0) {
            snap = SnapshotPool.__snapshotPool.pop()
        } else {
            snap = new Snapshot()
        }

        snap.id = SnapshotPool.NewId()
        snap.time = time || Date.now()
        return snap
    }

    static reconstructSnapshot(data) {
        const snap = SnapshotPool.createSnapshot()
        snap.decompress(data)
        return snap
    }

    /**
     * @param value {Snapshot}
     */
    static returnSnapshot(value) {
        for (let i = 0; i < value.state.length; i++) {
            SnapshotPool.__entityPool.push(value.state[i])
        }
        value.state.length = 0
        SnapshotPool.__snapshotPool.push(value)
    }

    static init(entityConstructor) {
        SnapshotPool.__entityConstructor = entityConstructor
    }

    static getEntity() {
        if (SnapshotPool.__entityPool.length > 0) {
            return SnapshotPool.__entityPool.pop()
        }

        return SnapshotPool.__entityConstructor()
    }
}