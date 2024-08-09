<template>
    <G2Plot name="Pie" :option="option"></G2Plot>
</template>

<script setup>
import G2Plot from "@/components/G2Plot/index.vue";
import { computed } from "vue";

const option = computed(() => {
    return {

    }
});
</script>

<style lang="scss" scoped></style>
