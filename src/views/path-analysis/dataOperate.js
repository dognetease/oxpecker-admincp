import { IncrementId } from "@/utils/incrementId";

export default class sankeyData {
    constructor() {
        this._option = {
            sourceField: "source",
            targetField: "target",
            weightField: "value",
            nodeAlign: "left",
            nodeWidthRatio: 0.008,
            nodePaddingRatio: 0.03,
            label: {
                formatter: this._labelFormatter.bind(this),
            },
            tooltip: {
                formatter: this._tooltipFormatter.bind(this),
            },
        };
        this._mp = new Map();
        this._order = "begin";
        this._incrementId = new IncrementId(0);
    }

    _labelFormatter(info) {
        const id = info.name;
        return this._mp.get(id)?.eventId;
    }

    _tooltipFormatter(info) {
        const { isNode, name: id, source, target } = info;
        if (isNode) {
            const item = this._mp.get(id);
            return {
                name: item.eventId,
                value: item.value,
            };
        } else {
            const sourceItem = this._mp.get(source);
            const targetItem = this._mp.get(target);
            let ratio = targetItem.value / sourceItem.value;
            if (this._order === "end") {
                ratio = 1 / ratio;
            }
            const value = this._order === "end" ? sourceItem.value : targetItem.value;
            return {
                name: `${sourceItem.eventId} -> ${targetItem.eventId}`,
                value: `${value} (${(ratio * 100).toFixed(2) + "%"})`,
            };
        }
    }

    removeChildren(parentId) {
        const children = this._findChildrenId(parentId);
        const deletedKeys = [];
        while (children.length) {
            const p = children.shift();
            deletedKeys.push(p);
            children.push(...this._findChildrenId(p));
        }

        for (const key of deletedKeys) {
            this._mp.delete(key);
        }
    }

    _findChildrenId(parentId) {
        const idList = [];
        for (const key of this._mp.keys()) {
            const item = this._mp.get(key);
            if (item.parentId === parentId) {
                idList.push(key);
            }
        }
        return idList;
    }

    setOrder(order = "begin") {
        this._order = order;
        this._resetSet();
    }

    flushData(nodeName, nodeCount, data = []) {
        this._resetSet();
        const root = {
            id: this._incrementId.getId(),
            parentId: null,
            value: nodeCount,
            eventId: nodeName,
            visited: true,
        };

        this._mp.set(root.id, root);
        this._appendData(root.id, data);
    }

    appendData(parentId, data = []) {
        this._appendData(parentId, data);
    }

    getNode(id) {
        return this._mp.get(id);
    }

    updateNode(id, partial = {}) {
        const item = this._mp.get(id);
        if (item) {
            this._mp.set(id, {
                ...item,
                ...partial,
            });
        }
    }

    replaceData(list = []) {
        if (list.length === 0) {
            return;
        }
        this._mp.clear();
        for (const each of list) {
            this._mp.set(each.id, each);
        }
    }

    _resetSet() {
        this._mp.clear();
        this._incrementId.reset();
    }

    _appendData(parentId, data = []) {
        for (const each of data) {
            const item = {
                id: this._incrementId.getId(),
                parentId,
                value: each.count,
                eventId: each.eventId,
            };
            this._mp.set(item.id, item);
        }
    }

    getChartData() {
        return this._getChartData();
    }

    getDataList() {
        const list = [...this._mp.values()].map(each => {
            return {
                id: each.id,
                parentId: each.parentId,
                eventId: each.eventId,
                count: each.value,
            };
        });
        return list;
    }

    getOption() {
        const option = {
            ...this._option,
            data: this._getChartData(),
            nodeAlign: this._order === "begin" ? "left" : "right",
        };
        return option;
    }

    _getChartData() {
        let list = [...this._mp.values()]
            .filter(each => each.parentId !== null)
            .map(each => {
                return {
                    value: each.value,
                    source: each.parentId,
                    target: each.id,
                };
            });
        if (this._order === "end") {
            list = list.map(each => {
                const tmp = each.source;
                each.source = each.target;
                each.target = tmp;
                return each;
            });
        }
        return list;
    }

    getEventList(end = "") {
        const eventList = [];
        let current = this._mp.get(end);
        while (current) {
            eventList.push(current.eventId);
            current = this._mp.get(current.parentId);
        }
        return eventList.reverse();
    }
}
