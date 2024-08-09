<template>
    <div class="attr-group">
        <h4>字符串类型属性</h4>
        <el-table
            class="query-buried-attr-string"
            :data="attrString"
            :span-method="objectSpanMethod"
            stripe
            border
            style="width: 100%"
        >
            <el-table-column label="属性名称" prop="attributeName" align="center"></el-table-column>
            <el-table-column label="映射字段" prop="attributeMappingName" align="center"></el-table-column>
            <el-table-column label="属性描述" prop="description" align="center"></el-table-column>
            <el-table-column label="属性值" prop="value" align="center"></el-table-column>
            <el-table-column label="属性值描述" prop="desc" align="center"></el-table-column>
        </el-table>

        <h4 class="number-title">数字类型属性</h4>
        <el-table class="query-buried-attr-num" :data="attrNumber" stripe border style="width: 100%">
            <el-table-column label="属性名称" prop="attributeName" align="center"></el-table-column>
            <el-table-column label="映射字段" prop="attributeMappingName" align="center"></el-table-column>
            <el-table-column label="属性描述" prop="description" align="center"></el-table-column>
            <el-table-column label="最小值" prop="minValue" align="center"></el-table-column>
            <el-table-column label="最大值" prop="maxValue" align="center"></el-table-column>
            <el-table-column label="单位" prop="unit" align="center"> </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
const props = defineProps({
    attrString: {
        type: Array,
        default: () => [],
    },
    attrNumber: {
        type: Array,
        default: () => [],
    },
});

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2) {
        if (row.isSpanStart && row.spanRowsCount) {
            return {
                rowspan: row.spanRowsCount,
                colspan: 1,
            };
        } else {
            return {
                rowspan: 0,
                colspan: 0,
            };
        }
    }
};
</script>

<style lang="scss" scoped>
.attr-group {
    h4 {
        font-size: 14px;
        font-weight: bold;
    }
    .number-title {
        margin-top: 30px;
    }
}
</style>
