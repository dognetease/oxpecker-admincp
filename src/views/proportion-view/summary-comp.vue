<template>
    <div>
        <G2Chart v-if="chartType === 'Bar'" name="Column" :option="option"></G2Chart>
        <div v-if="chartType === 'Pie'" class="grid grid-cols-2 gap-5">
            <div v-for="item in option" :key="item.name" class="h-96 box-border">
                <G2Chart name="Pie" :option="item.chartOption"></G2Chart>
            </div>
        </div>
    </div>
</template>

<script setup>
import G2Chart from "@/components/G2Plot/index.vue";
import { computed } from "vue";
import _ from "lodash";
import { toPercent } from "@/utils/index";

const props = defineProps(["chartType", "data"]);

const option = computed(() => {
    if (props.chartType === "Bar") {
        return {
            xField: "group",
            yField: "value",
            seriesField: "name",
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
                        name: datum.name,
                        value,
                    };
                },
            },
        };
    } else if (props.chartType === "Pie") {
        return _.chain(props.data)
            .groupBy("nameLabel")
            .reduce((acc, curValue, curKey) => {
                const item = {
                    name: curKey,
                    chartOption: {
                        data: _.map(curValue, el => {
                            return { type: el.group, value: el.value };
                        }),
                        angleField: "value",
                        radius: 1,
                        innerRadius: 0.6,
                        colorField: "type",
                        padding: "auto",
                        appendPadding: 30,
                        label: {
                            formatter(option) {
                                return toPercent(option.value);
                            },
                        },
                        tooltip: {
                            formatter(datum) {
                                const value = toPercent(datum.value, 2);
                                return {
                                    name: datum.type,
                                    value,
                                };
                            },
                        },
                        statistic: {
                            title: false,
                            content: {
                                style: {
                                    whiteSpace: "pre-wrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "18px",
                                    lineHeight: 1.2,
                                },
                                content: curKey,
                            },
                        },
                    },
                };
                acc.push(item);
                return acc;
            }, [])
            .value();
    }
});
</script>

<style lang="scss" scoped></style>
