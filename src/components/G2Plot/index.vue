<template>
    <div class="plot" ref="plotElmRef"></div>
</template>

<script setup>
import useChart from "./useChart.js";
import { watch } from "vue";

const props = defineProps({
    name: {
        type: String,
        require: true,
    },
    option: {
        type: Object,
        require: true,
    },
    eventList: {
        type: Array,
        default: () => [],
    },
});

const { plotElmRef, render } = useChart(props.name, props.option, props.eventList);
watch(
    () => props.option,
    val => {
        render(val);
    },
    { deep: true }
);
</script>

<script>
export default {
    name: "G2Plot",
};
</script>
<style lang="scss" scoped>
.plot {
    width: 100%;
    height: 100%;
}
</style>
