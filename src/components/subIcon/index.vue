<template>
    <i class="el-icon-remove-outline icon" :style="styles"></i>
</template>

<script>
export default {
    name: "subIcon",
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
        color: #f56c6c;
    }
}
</style>
