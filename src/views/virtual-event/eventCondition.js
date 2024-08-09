import { IncrementId } from "@/utils/incrementId.js";
import _ from "lodash";
class EventFilter {
    constructor() {
        this._data = [];
        this._idIns = new IncrementId();
    }

    reset() {
        this._data = [];
        this._idIns.reset();
    }

    init(list = []) {
        this.reset();
        this._data = _.map(list, each => {
            const filterIdIns = new IncrementId();
            return {
                id: this._idIns.getId(),
                name: each.name,
                cond: each.cond,
                option: each.option,
                filters: _.map(each.filters, filter => {
                    return {
                        id: filterIdIns.getId(),
                        name: filter.name,
                        cond: filter.cond,
                        value: filter.value,
                    };
                }),
                filterIdIns,
            };
        });
    }

    getData() {
        return this._data;
    }

    add() {
        this._data.push({
            id: this._idIns.getId(),
            name: "",
            cond: "AND",
            option: [],
            filters: [],
            filterIdIns: new IncrementId(),
        });
        return this.getData();
    }

    remove(id) {
        this._data = this._data.filter(each => each.id !== id);
        return this.getData();
    }

    update(id, item) {
        this._data = this._data.map(each => {
            if (each.id === id) {
                return {
                    ...each,
                    ...item,
                };
            }
            return each;
        });
        return this.getData();
    }

    addInnerItem(id) {
        this._data = this._data.map(each => {
            if (each.id === id) {
                const idIns = each.filterIdIns;
                each.filters.push({
                    id: idIns.getId(),
                    name: "",
                    cond: "EQ",
                    option: [],
                    value: [],
                });
            }
            return each;
        });
        return this.getData();
    }

    removeInnerItem(id, itemId) {
        this._data = this._data.map(each => {
            if (each.id === id) {
                each.filters = each.filters.filter(each => each.id !== itemId);
            }
            return each;
        });
        return this.getData();
    }

    updateInnerItem(id, itemId, item) {
        this._data = this._data.map(each => {
            if (each.id === id) {
                each.filters = each.filters.map(inner => {
                    if (inner.id === itemId) {
                        inner = {
                            ...inner,
                            ...item,
                        };
                    }
                    return inner;
                });
            }
            return each;
        });
        return this.getData();
    }
}

export { EventFilter };
