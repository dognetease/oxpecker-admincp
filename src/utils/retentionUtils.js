import dayjs from "dayjs";
import retentionApi from "@/api/retention-view";
import { noop } from "@/utils/index";

export const getTableColumn = (duration, unit) => {
    const columns = [
        { value: "startDate", label: "初始行为日期" },
        { value: "startUserCount", label: "初始行为用户数" },
    ];

    let cur = 2;
    switch (unit) {
        case "DAY":
            while (cur <= duration) {
                columns.push({ value: "day" + cur, label: "第" + cur + "天" });
                cur++;
            }
            break;
        case "WEEK":
            while (cur <= duration) {
                columns.push({ value: "week" + cur, label: "第" + cur + "周" });
                cur++;
            }
            break;
        case "MONTH":
            while (cur <= duration) {
                columns.push({ value: "month" + cur, label: "第" + cur + "月" });
                cur++;
            }
            break;
        default:
            throw new Error("留存table错误类型");
    }

    return columns;
};

export const getRetentionQuery = queries => {
    const params = Object.assign({}, queries);
    //firstCondition过滤
    params.firstCondition = params.firstCondition
        .filter(item => item && item.attributeName && item.filterType && item.valueSet)
        .map(item => {
            if (item && item.valueSet && item.attributeName && item.filterType) {
                return item;
            }
        });
    //secondCondition过滤
    params.secondCondition = params.secondCondition
        .filter(item => item && item.attributeName && item.filterType && item.valueSet)
        .map(item => {
            if (item && item.valueSet && item.attributeName && item.filterType) {
                return item;
            }
        });
    //condition过滤
    params.condition = params.condition
        .filter(item => item && item.attributeName && item.filterType && item.valueSet)
        .map(item => {
            if (item && item.valueSet && item.attributeName && item.filterType) {
                return item;
            }
        });
    params.unit = params.duration.split("-")[1];
    params.duration = params.duration.split("-")[0];

    // 处理时间头尾
    const [startTime, endTime] = getTime(queries);
    // 初始行为日期
    params.startDatas = getStartDates(startTime, endTime, params.unit, params.duration);

    // 删除多余字段
    Reflect.deleteProperty(params, "time");
    return params;
};

const getTime = searchData => {
    let startTime = searchData.time?.[0];
    let endTime = searchData.time?.[1];
    return [startTime, endTime];
};

const getStartDates = (startTime, endTime, unit, duration) => {
    let startDatas = [];
    const now = dayjs().format("YYYY-MM-DD");
    switch (unit) {
        case "DAY":
            startTime = dayjs(startTime).format("YYYY-MM-DD");
            endTime = dayjs(endTime).add(duration, "day").format("YYYY-MM-DD");
            while (dayjs(now).isAfter(startTime) && dayjs(endTime).isAfter(startTime)) {
                startDatas.push(startTime);
                startTime = dayjs(startTime).add(1, "day").format("YYYY-MM-DD");
            }
            return startDatas;
        case "WEEK":
            if (dayjs(startTime).day() === 0) {
                startTime = dayjs(startTime).subtract(1, "day");
            }
            startTime = dayjs(startTime).startOf("week").add(1, "day").format("YYYY-MM-DD");
            endTime = dayjs(endTime).startOf("week").add(1, "day").add(duration, "week").format("YYYY-MM-DD");
            while (dayjs(endTime).isAfter(startTime)) {
                startDatas.push(startTime);
                startTime = dayjs(startTime).add(1, "week").format("YYYY-MM-DD");
            }
            return startDatas;
        case "MONTH":
            startTime = dayjs(startTime).startOf("month").format("YYYY-MM-DD");
            endTime = dayjs(endTime).startOf("month").add(duration, "month").format("YYYY-MM-DD");
            while (dayjs(now).isAfter(startTime) && dayjs(endTime).isAfter(startTime)) {
                startDatas.push(startTime);
                startTime = dayjs(startTime).add(1, "month").startOf("month").format("YYYY-MM-DD");
            }
            return startDatas;
        default:
            throw new Error("留存table错误类型");
    }
};

const getStartDiff = (startTime, endTime, unit) => {
    switch (unit) {
        case "DAY":
            return dayjs(startTime).diff(endTime, "day");
        case "WEEK":
            return dayjs(startTime).diff(endTime, "week");
        case "MONTH":
            return dayjs(startTime).diff(endTime, "month");
        default:
            throw new Error("留存table错误类型");
    }
};

export const getRetentionData = async (params, cb, finallyCb) => {
    const startDatas = params.startDatas;
    Reflect.deleteProperty(params, "startDatas");
    finallyCb = finallyCb ?? noop;
    for (let index = 0; index < startDatas.length; index++) {
        const newParams = Object.assign({}, params);
        newParams.startDate = startDatas[index];

        // 计算时间间隔
        const now = dayjs().format("YYYY-MM-DD");
        const diff = getStartDiff(now, newParams.startDate, newParams.unit) + 1;
        const duration = Math.min(diff, params.duration);
        if (duration < 2) {
            finallyCb();
            return;
        }

        newParams.duration = duration;
        const data = await retentionApi.query(newParams);

        formatTableData(newParams, data, cb);
    }

    finallyCb();
};

export const formatTableData = (params, data, cb) => {
    let lineData = { startDate: params.startDate, startUserCount: data ? data[0] : 0 };
    let linePercentData = { startDate: params.startDate, startUserCount: data ? data[0] : 0 };
    switch (params.unit) {
        case "DAY":
            data.forEach((value, index) => {
                lineData["day" + (index + 1)] = value;
                const percentValue = linePercentData.startUserCount
                    ? changeDecimalToPercentage(value / linePercentData.startUserCount)
                    : 0 + "%";
                linePercentData["day" + (index + 1)] = percentValue;
            });
            cb(lineData, linePercentData);
            break;
        case "WEEK":
            data.forEach((value, index) => {
                lineData["week" + (index + 1)] = value;
                const percentValue = linePercentData.startUserCount
                    ? changeDecimalToPercentage(value / linePercentData.startUserCount)
                    : 0 + "%";
                linePercentData["week" + (index + 1)] = percentValue;
            });
            cb(lineData, linePercentData);
            break;
        case "MONTH":
            data.forEach((value, index) => {
                lineData["month" + (index + 1)] = value;
                const percentValue = linePercentData.startUserCount
                    ? changeDecimalToPercentage(value / linePercentData.startUserCount)
                    : 0 + "%";
                linePercentData["month" + (index + 1)] = percentValue;
            });
            cb(lineData, linePercentData);
            break;
        default:
            throw new Error("留存table错误类型");
    }
};

const changeDecimalToPercentage = data => {
    var data1 = (data * 100).toFixed(2) + "%";
    return data1;
};
