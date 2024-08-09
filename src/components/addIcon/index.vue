<template>
    <i class="el-icon-circle-plus-outline icon" :style="styles"></i>
</template>

<script>
export default {
    name: "addIcon",
    props: {
        styles: {
            default: () => ({})
        }
    }
};
</script>
<style lang="scss" scoped>
.icon {
    color: hsl(0, 0%, 74.7%);
    font-size: 26px;

    &:hover {
        cursor: pointer;
        color: #67c23a;
    }
}
</style>
