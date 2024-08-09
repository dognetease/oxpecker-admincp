<template>
    <div class="bar"></div>
</template>

<script>
import { Column } from "@antv/g2plot";
import chartMixin from "../chartMixin";
export default {
    name: "BarChart",
    mixins: [chartMixin],
    props: {
        option: {
            type: Object,
            require: true
        }
    },

    mounted() {
        this.initPlot(Column);
    }
};
</script>

<style lang="scss" scoped>
.bar {
    width: 100%;
    height: 100%;
}
</style>
