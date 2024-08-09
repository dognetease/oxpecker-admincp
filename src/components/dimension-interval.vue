<template>
    <div class="w-full">
        <el-select :value="value" @change="val => $emit('change', val)">
            <el-option
                v-for="item in option"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
        </el-select>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { getInterval } from "@/conf/common";
const props = defineProps(["value"]);
const emits = defineEmits(["change"]);

const option = ref(getInterval());
</script>

<style lang="scss" scoped></style>
