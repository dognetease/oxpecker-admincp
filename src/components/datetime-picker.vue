<template>
    <el-date-picker
        :value="dateRange"
        :clearable="false"
        :picker-options="pickerOptions"
        @input="onChange"
        type="daterange"
        range-separator=" - "
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 100%"
    >
    </el-date-picker>
</template>

<script setup>
import dayjs from "dayjs";
const props = defineProps(["dateRange"]);
const emits = defineEmits(["change"]);
import { getTimeRangeOption } from "@/utils/index.js";

const pickerOptions = getTimeRangeOption();

const onChange = dates => {
    const [begin, end] = dates;
    emits("change", [dayjs(begin).startOf("day").toDate(), dayjs(end).endOf("day").toDate()]);
};
</script>

<style lang="scss" scoped></style>
