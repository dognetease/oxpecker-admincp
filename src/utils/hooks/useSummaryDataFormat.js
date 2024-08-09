/**
 * 这个hooks是用来解析事件分析和占比分析的数据format展示的
 * 汇总类型
 *
 * 它其实只是一个简单的闭包函数
 */
import _ from "lodash";
export const useSummaryDataFormat = () => {
    const formatData = {};

    const format = (data, timeStr) => {
        const { displays = [], eventName, groupFields = [], groupValueList = [], rows = [] } = data;
        formatData.restrictions = _.map(displays, (el, i) => {
            el.key = "" + i;
            return el;
        });
        formatData.event = eventName;
        formatData.groupKey = groupFields;
        formatData.groupValues = groupValueList;
        formatData.dataList = _.reduce(
            rows,
            (acc, cur) => {
                cur.t = timeStr;
                const v = cur.v;
                const items = [];
                Reflect.deleteProperty(cur, "v");
                for (let i = 0; i < v.length; i++) {
                    const val = v[i];
                    items.push({
                        ...cur,
                        v: val,
                        ...formatData.restrictions[i],
                    });
                }
                acc.push(...items);
                return acc;
            },
            []
        );
    };

    const getKeys = (groupKeys, restrictKeys) => {
        const { groupValues, restrictions } = formatData;
        groupKeys = groupKeys ?? groupValues;
        restrictKeys = restrictKeys ?? restrictions;
        return [groupKeys, _.map(restrictKeys, el => el.key)];
    };

    return {
        setSourceData(data, timeStr) {
            format(data, timeStr);
        },

        getTableData() {
            const { dataList, groupKey } = formatData;
            const gKey = groupKey.join(",");
            const data = _.chain(dataList)
                .groupBy(each => {
                    return `${each.t} ~ ${each.g}`;
                })
                .reduce((acc, value) => {
                    const item = {
                        time: "",
                        [gKey]: "",
                    };

                    _.each(value, el => {
                        const { t, v, key, g } = el;
                        item.time = t;
                        item[gKey] = g;
                        item[key] = v;
                    });
                    acc.push(item);
                    return acc;
                }, [])
                .value();
            return data;
        },
        getTableColumn() {
            const column = [
                {
                    label: "时间",
                    prop: "time",
                },
            ];
            const { groupKey, restrictions, event } = formatData;
            // 维度的列
            if (!groupKey.includes("*")) {
                const key = groupKey.join(",");
                column.push({
                    label: key,
                    prop: key,
                });
            }
            _.each(restrictions, each => {
                column.push({
                    label: `${event}的${each.nameString}`,
                    prop: "" + each.key,
                });
            });

            return column;
        },

        getGroups() {
            return formatData.groupValues.slice();
        },

        getRestrictions() {
            return formatData.restrictions.slice();
        },

        getChartDataByCond(group, restrict) {
            const [gKeys, rKeys] = getKeys(group, restrict);
            const groupKeys = new Set(gKeys);
            const restrictKeys = new Set(rKeys);
            const { dataList, event } = formatData;
            return _.chain(dataList)
                .filter(el => groupKeys.has(el.g) && restrictKeys.has(el.key))
                .map(el => {
                    return {
                        name: `${event}的${el.nameString}`,
                        event: event,
                        nameLabel: el.nameString,
                        group: el.g,
                        value: el.v,
                    };
                })
                .value();
        },
    };
};
