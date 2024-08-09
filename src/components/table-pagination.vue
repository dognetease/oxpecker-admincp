<template>
    <div class="page">
        <el-pagination
            background
            :hide-on-single-page="true"
            :total="total"
            :page-size="pagesize"
            :page-sizes="[10, 20, 50, 100]"
            :current-page="page"
            @size-change="$emit('size-change', $event)"
            @current-change="$emit('current-change', $event)"
            layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
    </div>
</template>

<script setup>
const props = defineProps({
    total: {
        type: Number,
        default: 0,
    },
    pagesize: {
        type: Number,
        default: 20,
    },
    page: {
        type: Number,
        default: 1,
    },
});
</script>

<style lang="scss" scoped>
.page {
    display: flex;
    justify-content: flex-end;
}
</style>
