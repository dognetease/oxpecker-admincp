<template>
    <div class="w-full h-full">
        <G2Chart name="Column" :option="option"></G2Chart>
    </div>
</template>

<script setup>
import G2Chart from "@/components/G2Plot/index.vue";
import { computed } from "vue";
const props = defineProps(["data"]);

const option = computed(() => {
    if (props.data && props.data.length) {
        return {
            xField: "time",
            yField: "value",
            seriesField: "category",
            data: props.data,
            isGroup: 'true',
        };
    }
});
</script>

<style lang="scss" scoped></style>
