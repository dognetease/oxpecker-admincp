<template>
    <div class="h-full w-full">
        <G2Chart :key="chartType" v-if="chartType === 'Line'" name="Line" :option="option"></G2Chart>
        <G2Chart :key="chartType" v-if="chartType === 'Bar'" name="Column" :option="option"></G2Chart>
    </div>
</template>

<script setup>
import G2Chart from "@/components/G2Plot/index.vue";
import { computed } from "vue";
import { toPercent } from "@/utils/index";

const props = defineProps(["chartType", "data"]);
const option = computed(() => {
    if (props.chartType === "Line") {
        return {
            xField: "time",
            yField: "value",
            seriesField: "category",
            data: props.data,
            yAxis: {
                label: {
                    formatter: toPercent,
                },
            },
            tooltip: {
                formatter(datum) {
                    const value = toPercent(datum.value, 2);
                    return {
                        name: datum.category,
                        value,
                    };
                },
            },
        };
    } else if (props.chartType === "Bar") {
        return {
            xField: "time",
            yField: "value",
            seriesField: "category",
            data: props.data,
            isGroup: "true",
            maxColumnWidth: 100,
            yAxis: {
                label: {
                    formatter: toPercent,
                },
            },
            tooltip: {
                formatter(datum) {
                    const value = toPercent(datum.value, 2);
                    return {
                        name: datum.category,
                        value,
                    };
                },
            },
        };
    }
});
</script>

<style lang="scss" scoped></style>
