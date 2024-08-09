export default {
    appKey: {
        label: "选择应用",
        column: "appKey",
        showInTable: false
    },
    type: {
        label: "类型",
        options: [{ label: "eventId", value: "eventId" }]
    },
    eventId: {
        label: "EventId",
        column: "eventId",
        showInTable: true
    },
    appName: {
        label: "埋点应用",
        showInTable: true,
        column: "appName"
    },
    appKey: {
        label: "appKey",
        column: "appKey",
    },
    description: {
        label: "描述",
        showInTable: true,
        column: "description"
    },
    version: {
        label: "版本号",
        showInTable: true,
        column: "version"
    },
    operator: {
        label: "提交者",
        column: "operator",
        showInTable: true
    },
    tag: {
        label: "标签",
        showInTable: true,
        column: "tag"
    },
    status: {
        label: "状态",
        showInTable: true,
        column: "status",
        formatter: function (row, col, value, index) {
            if (value === 0) {
                return "未发布";
            } else if (value === 1) {
                return "已发布";
            } else if (value === 2) {
                return "已禁用";
            } else {
                return "未知";
            }
        }
    },
    productCode: {
        label: "产品线",
        column: "productCode"
    },
    developer: {
        label: "开发者",
        column: "developer"
    },
    publicProp: {
        label: "已有公共属性"
    },
    eventAttributeDTOList: {
        label: "属性",
        column: "eventAttributeDTOList",
        typeOptions: [
            { label: "数值", value: "number" },
            { label: "字符", value: "string" }
        ]
    },
    eventTagDTOList: {
        label: "标签",
        column: "eventTagDTOList"
    }
};
