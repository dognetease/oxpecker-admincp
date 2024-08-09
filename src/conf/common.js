export const getCondOption = () => {
    return [
        { label: "等于", value: "EQ" },
        { label: "不等于", value: "NE" },
        { label: "有值", value: "N_MTY" },
        { label: "没值", value: "MTY" },
        { label: "包含", value: "CTR" },
        { label: "不包含", value: "N_CTR" },
        { label: "大于", value: "GT" },
        { label: "大于等于", value: "GE" },
        { label: "小于", value: "LT" },
        { label: "小于等于", value: "LE" },
    ];
};

export const getRestrictOption = () => {
    return [
        { label: "总次数", value: "COUNT", disabled: false, name: "*" },
        { label: "触发用户数", value: "DISTINCT_COUNT", disabled: false, name: "userId" },
        { label: "人均次数", value: "PERSON_AVG_COUNT", disabled: false, name: "userId" },
    ];
};

export const getRestrictChildOption = () => {
    return [
        { label: "去重数", value: "DISTINCT_COUNT", disabled: false },
        { label: "平均值", value: "AVG", disabled: true },
        { label: "最小值", value: "MIN", disabled: true },
        { label: "最大值", value: "MAX", disabled: true },
        { label: "求和", value: "SUM", disabled: true },
        { label: "p50", value: "P50", disabled: true },
        { label: "p90", value: "P90", disabled: true },
        { label: "p99", value: "P99", disabled: true },
    ];
};

export const getInterval = () => {
    return [
        { label: "自动", value: "AUTO" },
        { label: "分钟", value: "MINUTE" },
        { label: "小时", value: "HOUR" },
        { label: "天", value: "DAY" },
        { label: "周", value: "WEEK" },
        { label: "月", value: "MONTH" },
    ];
};
