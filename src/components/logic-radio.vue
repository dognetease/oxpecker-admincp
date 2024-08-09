<template>
    <div class="relative flex flex-col items-center justify-center pt-1 pb-1">
        <div
            class="text"
            :class="{
                active: value === item.value,
            }"
            v-for="item in option"
            :key="item.value"
            @click="() => $emit('change', item.value)"
        >
            {{ item.label }}
        </div>
        <div class="absolute h-ful left-1/2 -translate-x-1/2 top-0 bottom-0 vertical-line"></div>
    </div>
</template>

<script setup>
const props = defineProps({
    value: {
        type: String,
        required: true,
    },
    option: {
        type: Array,
        default: () => [
            {
                label: "且",
                value: "AND",
            },
            {
                label: "或",
                value: "OR",
            },
        ],
    },
});
const emits = defineEmits(["change"]);
</script>

<style lang="scss" scoped>
.text {
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8492a6;
    font-size: 12px;
    border-radius: 2px;
    background-color: #e9f0f7;
    &:hover {
        cursor: pointer;
    }
    position: relative;
    z-index: 1;
}
.text.active {
    background-color: #04cb94;
    color: #fff;
}
.vertical-line {
    width: 2px;
    background-color: #e9f0f7;
}
</style>
