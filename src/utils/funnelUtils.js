export class FunnelData {
    constructor() {
        this._map = new Map();
    }

    setData(data = []) {
        this._map.clear();
        for (const each of data) {
            this._map.set(each.id, each);
        }
    }

    getChartData() {
        const data = [...this._map.values()];
        return data.map(({ id, count = 0 }) => {
            return {
                label: id,
                count,
            };
        });
    }

    getItemById(id) {
        return this._map.get(id);
    }
}
