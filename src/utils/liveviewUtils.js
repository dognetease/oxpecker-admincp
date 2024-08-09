const getIndexes = (list) => {
    return list.map((each) => {
        return {
            ...each,
            checked: true
        };
    });
};

const getDimensions = (list) => {
    return list.map((name) => {
        return {
            key: name,
            value: name,
            label: name,
            checked: false
        };
    });
};

const getScrollLegend = (data = []) => {
    return {
        data,
        type: "scroll",
        orient: "horizontal",
        left: 10,
        top: 10
    };
};

const getCommonGrid = () => {
    return {
        left: "3%",
        right: "3%",
        bottom: "3%",
        containLabel: true
    };
};

const getCommonTooltip = (trigger = "axis") => {
    return {
        trigger,
        confine: true,
        textStyle: {
            align: "left"
        }
    };
};

// 事件分析 明细
export class ChartDetailData {
    constructor() {
        this.chartDataMap = null;
        this.sortedDimensions = [];
        this.timeList = [];
        this.displays = [];
        this.eventId = "";
    }

    setChartOriginData(data = {}) {
        const { displays = [], timeList = [], rows = [], groupValueList = [], eventId = "" } = data;
        let mp = {};
        const timeMap = {};
        for (let i = 0; i < timeList.length; i++) {
            const time = timeList[i];
            timeMap[time] = i;
        }
        for (const row of rows) {
            const { g: groupLabel, t: time, v: values } = row;
            if (!mp[groupLabel]) {
                mp[groupLabel] = new Array(timeList.length).fill(0).map((_, index) => {
                    return {
                        g: groupLabel,
                        v: new Array(displays.length).fill(0),
                        t: timeList[index]
                    };
                });
            }
            const index = timeMap[time];
            const obj = mp[groupLabel][index];
            const newValues = obj.v;
            for (let i = 0; i < values.length; i++) {
                newValues[i] = values[i];
            }
        }

        this.chartDataMap = mp;
        this.sortedDimensions = groupValueList;
        this.timeList = timeList;
        this.displays = displays.map(({ aggregationType, nameString }, index) => {
            return {
                key: aggregationType + "_" + nameString + "_" + index,
                value: aggregationType,
                label: nameString,
                index
            };
        });
        this.eventId = eventId;
    }

    getIndexes() {
        return getIndexes(this.displays);
    }

    getDimensions() {
        return getDimensions(this.sortedDimensions);
    }

    getLineOption(indexes = [], dimensions = []) {
        if (indexes.length === 0 || dimensions.length === 0) {
            return {
                hasData: false,
                option: {}
            };
        }
        const series = this.getSeries(indexes, dimensions);
        let data = [];
        for (let i = 0; i < this.timeList.length; i++) {
            const time = this.timeList[i];
            for (let j = 0; j < series.length; j++) {
                const item = series[j];
                const name = item.name;
                const value = item.data[i];
                data.push({
                    category: name,
                    value,
                    time
                });
            }
        }
        const g2plotOption = {
            xField: "time",
            yField: "value",
            data,
            seriesField: "category",
        };
        return {
            hasData: true,
            option: g2plotOption
        };
    }

    getBarOption(indexes = [], dimensions = []) {
        if (indexes.length === 0 || dimensions.length === 0) {
            return {
                hasData: false,
                option: {}
            };
        }
        const series = this.getSeries(indexes, dimensions);
        const data = [];
        for (let i = 0; i < this.timeList.length; i++) {
            const time = this.timeList[i];
            for (let j = 0; j < series.length; j++) {
                const item = series[j];
                const name = item.name;
                const value = item.data[i];
                data.push({
                    name,
                    value,
                    time
                });
            }
        }
        return {
            hasData: true,
            option: {
                data,
                isGroup: true,
                xField: "time",
                yField: "value",
                seriesField: "name",
                maxColumnWidth: 100
            }
        };
    }

    getSeries(indexes = [], dimensions = []) {
        let data = [];
        for (const d of dimensions) {
            const selectedDimension = this.chartDataMap[d];
            for (const i of indexes) {
                const name = this.getName(d, i);
                let list = [];
                for (const each of selectedDimension) {
                    const { v } = each;
                    list.push(v[i]);
                }

                data.push({
                    type: "",
                    data: list,
                    name
                });
            }
        }
        return data;
    }

    getName(groupLabel, displayIndex) {
        const label = this.displays[displayIndex].label;
        return `${this.eventId}(${groupLabel})的${label}`;
    }
}

// 事件分析 汇总
export class ChartSummaryData {
    constructor() {
        this.chartDataMap = null;
        this.sortedDimensions = [];
        this.displays = [];
        this.eventId = "";
    }

    setChartOriginData({ displays = [], groupValueList = [], rows = [], eventId = "" }) {
        let mp = {};
        for (const row of rows) {
            const { g: groupLabel, v: values } = row;
            mp[groupLabel] = values;
        }
        this.chartDataMap = mp;
        this.sortedDimensions = groupValueList;
        this.displays = displays.map(({ aggregationType, nameString }, index) => {
            return {
                key: aggregationType + "_" + nameString + "_" + index,
                value: aggregationType,
                label: nameString,
                index
            };
        });
        this.eventId = eventId;
    }

    getIndexes() {
        return getIndexes(this.displays);
    }

    getDimensions() {
        return getDimensions(this.sortedDimensions);
    }

    getBarOption(indexes = [], dimensions = []) {
        if (indexes.length === 0 || dimensions.length === 0) {
            return {
                hasData: false,
                option: {}
            };
        }

        const series = [];
        for (const i of indexes) {
            let ret = {
                name: this.getName(i),
                type: "bar",
                data: []
            };
            for (const dKey of dimensions) {
                ret.data.push(this.chartDataMap[dKey][i]);
            }
            series.push(ret);
        }
        const data = series
            .reduce((acc, cur) => {
                const { data: dataList = [] } = cur;
                const ret = [];
                for (let i = 0; i < dataList.length; i++) {
                    ret.push({
                        name: cur.name,
                        dimension: dimensions[i],
                        value: dataList[i]
                    });
                }
                acc = acc.concat(ret)
                return acc;
            }, [])
        return {
            hasData: true,
            option: {
                xField: "dimension",
                yField: "value",
                seriesField: "name",
                data,
                isGroup: true,
                maxColumnWidth: 100
            }
        };
    }

    getPieOption(indexes = [], dimensions = []) {
        if (indexes.length === 0 || dimensions.length === 0) {
            return {
                hasData: false,
                optionList: []
            };
        }

        let optionList = [];
        for (const i of indexes) {
            const data = [];
            for (const dKey of dimensions) {
                data.push({
                    value: this.chartDataMap[dKey][i],
                    name: dKey
                });
            }
            const option = {
                data,
                angleField: "value",
                radius: 1,
                innerRadius: 0.6,
                colorField: "name",
                padding: "auto",
                appendPadding: 30,
                statistic: {
                    title: false,
                    content: {
                        style: {
                            whiteSpace: "pre-wrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "18px",
                            lineHeight: 1.2
                        },
                        content: this.displays[i].label
                    }
                }
            };

            optionList.push(option);
        }

        return {
            hasData: true,
            optionList
        };
    }

    getName(displayIndex) {
        const label = this.displays[displayIndex].label;
        return `${this.eventId}的${label}`;
    }
}
