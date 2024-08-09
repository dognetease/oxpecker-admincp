
export default {
    appName: {
        label: "埋点应用",
        showInTable: true,
        column: "appName"
    },
    eventId: {
        label: "EventId",
        column: "eventId",
        showInTable: true
    },
    eventDesc: {
        label: "事件描述",
        column: "eventDesc"
    },
    eventType: {
        label: '事件类型',
        column: 'eventType',
        showInTable: true
    },
    appKey: {
        label: "埋点应用",
        column: "appKey",
        showInTable: false
    },
    description: {
        label: "描述",
        showInTable: true,
        column: "description"
    },
    descriptionThumbnailUrl: {
        label: "descriptionThumbnailUrl",
        showInTable: false,
        column: "descriptionThumbnailUrl"
    },
    descriptionUrl: {
        label: "descriptionUrl",
        showInTable: false,
        column: "descriptionUrl"
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
    remark: {
        label: "备注",
        showInTable: true,
        column: "remark"
    },
    status: {
        label: "状态",
        showInTable: true,
        column: "status",
        formatter: function (row, col, value, index) {
            if (value === 3) {
                return "待开发";
            } else if (value === 0) {
                return "待发布";
            } else if (value === 1) {
                return "已发布";
            } else if (value === 2) {
                return "已禁用";
            } else {
                return "未知";
            }
        }
    },
    // effectiveTime: {
    //     label: "生效时间",
    //     column: "effectiveTime",
    //     showInTable: true,
    //     formatter: function (row, col, value, index) {
    //         return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : value;
    //     }
    // },
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
