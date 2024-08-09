<template>
    <div class="wrapper">
        <el-table :data="tableData" border size="small">
            <el-table-column prop="name" label="属性名"> </el-table-column>
            <el-table-column prop="nameDesc" label="属性名描述"></el-table-column>
            <el-table-column prop="value" label="属性值" class-name="value-wrapper">
                <template slot-scope="scope">
                    <div class="value" v-for="(item, idx) in scope.row.valueList" :key="'' + idx + item.value">
                        {{ item.value }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="valueDesc" label="属性值描述" class-name="value-wrapper">
                <template slot-scope="scope">
                    <div class="value" v-for="(item, idx) in scope.row.valueList" :key="'' + idx + item.valueDesc">
                        {{ item.valueDesc }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="data">
                    <el-button round type="primary" size="mini" @click="$emit('edit-attr-detail', data.row.id)"
                        >编辑属性值</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { computed } from "vue";
defineProps(["tableData"]);
defineEmits(["add-attribute", "edit-attr-detail"]);
const data = computed(() => {
    return this.tableData.reduce((acc, cur) => {
        const { name, nameDesc, valueList = [], id } = cur;
        acc = acc.concat(
            valueList.map((each) => {
                return {
                    ...each,
                    name,
                    nameDesc,
                    id
                };
            })
        );
        return acc;
    }, []);
});
</script>

<style lang="scss" scoped>
.wrapper {
    ::v-deep(td.value-wrapper) {
        padding: 0;

        .cell {
            padding: 0;
            display: flex;
            flex-direction: column;

            .value {
                padding: 10px;
                border-top: 1px solid rgb(235, 238, 245);
                box-sizing: border-box;
                height: 43px;
                // line-height: 43px;

                &:first-child {
                    border-top: none;
                }

                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    ::v-deep(th.value-wrapper) {
        .cell {
            padding: 0 10px;
        }
    }
}
</style>
