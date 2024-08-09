/**
 * 这个hooks是用来解析事件分析和占比分析的数据format展示的
 * 详细类型
 *
 * 它其实只是一个简单的闭包函数
 */
import _ from "lodash";
export const useDetailDataFormat = () => {
    let formatData = {
        restrictions: [],
        groupKey: [],
        groupValue: [],
        dates: [],
        dataList: [],
    };

    const format = (data = {}) => {
        const {
            displays = [],
            groupFields: groupKey,
            groupValueList: groupValue = [],
            timeList: dates = [],
            rows: dataList = [],
        } = data;
        // index其实就是key
        const restrictions = displays.map((el, i) => {
            el.key = String(i);
            return el;
        });
        dataList.forEach(item => {
            const v = {};
            const sourceV = item.v;
            for (let i = 0; i < restrictions.length; i++) {
                const r = restrictions[i];
                const key = r.key;
                v[key] = sourceV[key];
            }
            item.v = v;
        });

        formatData = {
            restrictions,
            groupKey,
            groupValue,
            dates,
            dataList,
        };
    };

    const getChart = (g, r) => {
        const { restrictions, groupValue, dataList } = formatData;
        g = g ?? groupValue;
        r = r ?? restrictions;
        if (g.length === 0 || r.length === 0) {
            return [];
        }
        const gSet = new Set(g);
        const rMap = new Map();
        _.each(r, el => {
            rMap.set(el.key, el);
        });
        return _.chain(dataList)
            .filter(el => {
                const isSelectGroup = gSet.has(el.g);
                return isSelectGroup;
            })
            .reduce((acc, each) => {
                const { g, v, t } = each;
                const list = [];
                _.each(v, (value, key) => {
                    if (rMap.has(key)) {
                        list.push({
                            time: t,
                            value,
                            category: `(${g})的${rMap.get(key).nameString}`,
                        });
                    }
                });
                return _.concat(acc, list);
            }, [])
            .value();
    };
    return {
        setSourceData(data) {
            format(data);
        },

        getChartDataByCond(group, restrict) {
            return getChart(group, restrict);
        },

        getDates() {
            return formatData.dates.slice();
        },

        getTableData() {
            const { groupKey, restrictions, dataList } = formatData;
            const isSearchTotal = groupKey.includes("*");
            const key = groupKey.join(",");
            return _.map(dataList, each => {
                const { t, g, v } = each;
                const item = {
                    time: t,
                };
                if (!isSearchTotal) {
                    item[key] = g;
                }
                _.each(restrictions, el => {
                    const { key } = el;
                    item[key] = v[key];
                });
                return item;
            });
        },
        getTableColumn() {
            const column = [
                {
                    label: "时间",
                    prop: "time",
                },
            ];
            const { groupKey, restrictions } = formatData;
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
                    label: `${each.nameString}`,
                    prop: "" + each.key,
                });
            });

            return column;
        },

        getGroups() {
            return formatData.groupValue.slice();
        },

        getRestrictions() {
            return formatData.restrictions.slice();
        },
    };
};
