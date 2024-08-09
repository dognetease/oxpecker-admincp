export default {
    time: {
        label: "时间选择",
        column: "time"
    },
    productCode: {
        label: "产品",
        column: "productCode"
    },
    appKey: {
        label: "应用",
        column: "appKey"
    },
    eventId: {
        label: "选择事件",
        column: "eventId"
    },
    displays: {
        label: "属性",
        column: "fieldAttributes",
        defaultOptions: [
            { label: "总次数", value: "COUNT" },
            { label: "触发用户数", value: "DISTINCT_USER_COUNT" },
            { label: "人均次数", value: "PERSON_AVG_COUNT" }
        ]
    },
    conditions: {
        label: "筛选条件",
        column: "filter",
        operatorOptions: [
            { label: "等于", value: "EQ" },
            { label: "不等于", value: "NE" },
            { label: "有值", value: "N_MTY" },
            { label: "没值", value: "MTY" },
            { label: "包含", value: "CTR" },
            { label: "不包含", value: "N_CTR" },
            { label: "大于", value: "GT" },
            { label: "大于等于", value: "GE" },
            { label: "小于", value: "LT" },
            { label: "小于等于", value: "LE" }
        ]
    },
    conditionRelationType: {
        label: "条件关系"
    },
    groupFields: {
        label: "选择维度",
        column: "groupFields",
        defaultOptions: [{ label: "总体", value: "*" }]
    },
    eventAttributesOptions: {},
    aggregationType: {
        label: "计算规则",
        column: "aggregationType",
        options: [
            { label: "去重数", value: "DISTINCT_COUNT" },
            { label: "平均值", value: "AVG" },
            { label: "最小值", value: "MIN" },
            { label: "最大值", value: "MAX" },
            { label: "求和", value: "SUM" },
            { label: "p50", value: "P50" },
            { label: "p90", value: "P90" },
            { label: "p99", value: "P99" }
        ],
        disabledOptions: [
            { label: "去重数", value: "DISTINCT_COUNT" },
            { label: "平均值", value: "AVG", disabled: true },
            { label: "最小值", value: "MIN", disabled: true },
            { label: "最大值", value: "MAX", disabled: true },
            { label: "求和", value: "SUM", disabled: true },
            { label: "p50", value: "P50", disabled: true },
            { label: "p90", value: "P90", disabled: true },
            { label: "p99", value: "P99", disabled: true }
        ]
    },
    interval: [
        { label: "自动", value: "AUTO" },
        { label: "分钟", value: "MINUTE" },
        { label: "小时", value: "HOUR" },
        { label: "天", value: "DAY" },
        { label: "周", value: "WEEK" },
        { label: "月", value: "MONTH" }
    ],
    default: {
        productCode: "97a1222d",
        appKey: "OX-115eda60",
        eventId: "dom_load_event"
    },
    chart: {
        data: {
            dimensions: {
                name: "",
                data: []
            },
            measures: []
        },
        legend: {
            type: "scroll"
        }
    },
    table: {
        data: [],
        columns: []
    }
};
