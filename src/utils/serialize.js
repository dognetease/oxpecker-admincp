export class Serialize {
    constructor(key = "") {
        this._pageKey = key;
        this._keySuffix = "_local_storage_cache";
    }

    _getKey() {
        return this._pageKey + this._keySuffix;
    }

    _isEmpty(ele) {
        if (typeof ele === "string" && ele.length === 0) {
            return true;
        }
        if (ele === null || ele === undefined) {
            return true;
        }

        if (Array.isArray(ele) && ele.length === 0) {
            return true;
        }

        if (typeof ele === "object" && Object.keys(ele).length === 0) {
            return true;
        }
        return false;
    }

    serialize(data) {
        if (this._isEmpty(data)) {
            return false;
        }

        const jsonData = JSON.stringify(data);
        const key = this._getKey();
        window.localStorage.setItem(key, jsonData);
        return true;
    }

    clearCache() {
        const key = this._getKey();
        window.localStorage.removeItem(key);
    }

    deserialize() {
        const key = this._getKey();
        const data = JSON.parse(window.localStorage.getItem(key));
        this.clearCache();
        return data;
    }

    isCache() {
        const key = this._getKey();
        const data = JSON.parse(window.localStorage.getItem(key));
        return data !== null && data !== undefined;
    }
}
