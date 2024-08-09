import dayjs from "dayjs";
export default {
    id: {
        label: "自增主键",
        column: "id",
        showInTable: true
    },
    productName: {
        label: "产品线名称",
        column: "productName",
        showInTable: true
    },
    productCode: {
        label: "产品线",
        column: "productCode",
        showInTable: true
    },
    userId: {
        label: "userId",
        column: "userId",
        showInTable: true
    },
    operator: {
        label: "操作人",
        column: "operator",
        showInTable: true
    },
    createTime: {
        label: "创建时间",
        column: "createTime",
        showInTable: true,
        formatter: function (row, col, value, index) {
            return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : value;
        }
    },
    updateTime: {
        label: "更新时间",
        column: "updateTime",
        showInTable: true,
        formatter: function (row, col, value, index) {
            return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : value;
        }
    }
};
