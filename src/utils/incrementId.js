class IncrementId {
    constructor(id = -1) {
        this._originId = id;
        this._id = id;
    }

    getId() {
        this._id++;
        return this._id;
    }

    reset() {
        this._id = this._originId;
    }
}

export {
    IncrementId
}
