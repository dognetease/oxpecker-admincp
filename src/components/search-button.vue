<template>
    <el-button type="primary" icon="el-icon-search" :loading="loading" @click="$emit('click')"
        >{{ loading ? "查询中..." : "查询" }}</el-button
    >
</template>

<script setup>
const props = defineProps(["loading"]);
const emits = defineEmits(["click"]);
</script>

<style lang="scss" scoped></style>
