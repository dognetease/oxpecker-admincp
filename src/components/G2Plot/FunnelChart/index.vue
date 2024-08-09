<template>
    <div class="funnel"></div>
</template>

<script>
import chartMixin from "../chartMixin";
import { Column } from "@antv/g2plot";
import { FunnelData } from "../../../utils/funnelUtils";
// const funnelData = new FunnelData();
export default {
    name: "FunnelChart",
    mixins: [chartMixin],
    props: {
        dataList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            funnelData: new FunnelData(),
            option: {
                data: [],
                xField: "label",
                yField: "count",
                maxColumnWidth: 100,
                conversionTag: {},
                autoFit: true,
                xAxis: {
                    label: {
                        formatter: label => {
                            const item = this.funnelData.getItemById(+label);
                            const name = item.name ?? item.eventId;

                            if (name && name.length > 8) {
                                return name.slice(0, 10) + "...";
                            }
                            return name;
                        },
                    },
                },
                tooltip: {
                    customContent: id => {
                        const item = this.funnelData.getItemById(+id);
                        const { eventId, count, name } = item;
                        const label = name ?? eventId;
                        return `<p style="padding: 18px 18px 9px 10px">
                            ${label}:
                            <span style="margin-left: 8px">${count}</span>
                            </p>`;
                    },
                },
            },
        };
    },
    watch: {
        dataList: {
            immediate: true,
            handler(val) {
                if (val.length > 0) {
                    this.funnelData.setData(val);
                    this.option.data = this.funnelData.getChartData();
                }
            },
        },
    },
    mounted() {
        if (!this.plot) {
            this.initPlot(Column);
        }
    },
};
</script>

<style lang="scss" scoped>
.funnel {
    width: 100%;
    height: 100%;
}
</style>
