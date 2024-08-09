<template>
    <div>
        <el-table style="width: 100%" :data="displayList" border>
            <el-table-column
                v-for="col in column"
                :label="col.label"
                :key="col.label"
                :prop="col.prop"
                :width="col.width"
            >
            </el-table-column>
        </el-table>
        <div class="flex justify-end">
            <TablePagination
                style="padding-left: 0; padding-right: 0"
                :page.sync="current"
                :limit.sync="pageSize"
                :total="total"
            ></TablePagination>
        </div>
    </div>
</template>

<script setup>
import TablePagination from "@/components/Pagination/index.vue";
import _ from "lodash";
import { ref, computed, watch } from "vue";

const props = defineProps(["data", "column"]);

const pageSize = ref(20);
const current = ref(0);

const displayList = computed(() => {
    const begin = current.value * pageSize.value;
    const end = begin + pageSize.value + 1;
    return _.slice(props.data, begin, end);
});

const total = computed(() => {
    return props.data?.length ?? 0;
});

watch(
    () => props.data,
    () => {
        pageSize.value = 20;
        current.value = 0;
    }
);
</script>

<style lang="scss" scoped></style>
