import { isString, split } from "lodash";
import { Message } from "element-ui";
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0 || !time) {
        return "null";
    }
    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time === "object") {
        date = time;
    } else {
        if (typeof time === "string" && /^[0-9]+$/.test(time)) {
            time = parseInt(time);
        }
        if (typeof time === "number" && time.toString().length === 10) {
            time = time * 1000;
        }
        date = new Date(time);
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay(),
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        // Note: getDay() returns 0 on Sunday
        if (key === "a") {
            return ["日", "一", "二", "三", "四", "五", "六"][value];
        }
        if (result.length > 0 && value < 10) {
            value = "0" + value;
        }
        return value || 0;
    });
    return time_str;
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
    const search = url.split("?")[1];
    if (!search) {
        return {};
    }
    return JSON.parse(
        '{"' +
            decodeURIComponent(search)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"')
                .replace(/\+/g, " ") +
            '"}'
    );
}

export function sign(version = 1) {
    let fill = (function (tbl) {
        return function (num, n) {
            return 0 >= n + String(num).length ? num : (tbl[n] || (tbl[n] = Array(n + 1).join("0"))) + num;
        };
    })([]);
    let key = Math.abs(parseInt(new Date().getTime() * Math.random() * 10000)).toString();
    let sum = 0;
    for (let i = 0; i < key.length; i++) {
        sum += parseInt(key.charAt(i));
    }
    sum += key.length;
    sum = fill(sum, 3 - sum.toString().length);
    return version.toString() + key + sum;
}

export function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export function getTimeRangeOption() {
    return {
        shortcuts: [
            {
                text: "今天",
                onClick(picker) {
                    const start = new Date(new Date());
                    const end = new Date(new Date());
                    picker.$emit("pick", [start, end]);
                },
            },
            {
                text: "昨天",
                onClick(picker) {
                    const start = new Date(new Date());
                    const end = new Date(new Date());
                    start.setTime(start.getTime() - 3600 * 1000 * 24);
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    picker.$emit("pick", [start, end]);
                },
            },
            {
                text: "最近三天",
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
                    picker.$emit("pick", [start, end]);
                },
            },
            {
                text: "最近一周",
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit("pick", [start, end]);
                },
            },
            {
                text: "最近一个月",
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit("pick", [start, end]);
                },
            },
            {
                text: "最近三个月",
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit("pick", [start, end]);
                },
            },
        ],
    };
}

export const isSubSet = (subList, list) => {
    if (subList.length > list.length) {
        return false;
    }
    if (subList.length === 0) {
        return true;
    }
    const s = new Set(list);
    for (const each of subList) {
        if (!s.has(each)) {
            return false;
        }
    }
    return true;
};

export function split2Array(value, sep = ",") {
    if (isString(value)) {
        if (value.length === 0) {
            return [];
        }
        return split(value, sep);
    }

    return [];
}

export const noop = () => {};

export const toPercent = (val, digit = 0) => {
    val = +val;
    return (val * 100).toFixed(digit) + "%";
};

export const showMessage = (message, type, extraOption = {}) => {
    const duration = extraOption.duration ?? 1500;

    const option = {
        message,
        type,
        duration: 0,
        showClose: true,
    };
    extraOption = _.omit(extraOption, ["message", "type", "duration"]);
    const _msg = Message({
        ...option,
        ...extraOption,
    });
    setTimeout(() => {
        _msg && _msg.close();
    }, duration);
};
