<template>
    <div class="pie"></div>
</template>

<script>
import { Pie } from "@antv/g2plot";
import chartMixin from "../chartMixin";
export default {
    name: "PieChart",
    mixins: [chartMixin],
    props: {
        option: {
            type: Object,
            require: true
        }
    },

    mounted() {
        this.initPlot(Pie);
    }
};
</script>

<style lang="scss" scoped>
.pie {
    width: 100%;
    height: 100%;
}
</style>
