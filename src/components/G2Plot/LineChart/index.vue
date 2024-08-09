<template>
    <div class="line"></div>
</template>

<script>
import { Line } from "@antv/g2plot";
import chartMixin from "../chartMixin";
export default {
    name: "LineChart",
    mixins: [chartMixin],
    props: {
        option: {
            type: Object,
            require: true
        }
    },

    mounted() {
        this.initPlot(Line);
    }
};
</script>

<style lang="scss" scoped>
.line {
    width: 100%;
    height: 100%;
}
</style>
