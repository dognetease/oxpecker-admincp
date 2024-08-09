<template>
    <div class="header" :class="{ 'shrink-header': !isSpread }">
        <div class="comp">
            <el-select
                :size="size"
                clearable
                placeholder="请选择查询"
                :value="search"
                @change="val => $emit('search-change', val)"
            >
                <el-option v-for="item in searchOption" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
            </el-select>
            <el-button :size="size" type="primary" class="update" @click="$emit('btn-click')">{{
                search === "" ? "新建" : "更新"
            }}</el-button>
        </div>
        <div class="spread">
            <i
                @click="toggleSpread"
                class="icon el-icon-arrow-up"
                :class="{
                    rotate: !isSpread,
                }"
            ></i>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
    search: {
        type: String | Number,
        default: "",
    },
    searchOption: {
        type: Array,
        default: () => [],
    },
    spread: {
        type: Boolean,
        default: true,
    },
    size: {
        type: String,
        default: "default",
    },
});
defineEmits(["search-change", "btn-click"]);

const toggleSpread = () => {
    isSpread.value = !isSpread.value;
};

const isSpread = ref(props.spread);
</script>

<style lang="scss" scoped>
.header {
    width: 100%;
    height: 61px;
    transition: height 0.3s ease-in-out;

    display: flow-root;
    position: relative;
    .update {
        margin-left: 20px;
    }

    .comp {
        position: absolute;
        // z-index: -1;
        top: 0;
        transition: top 0.3s ease-in-out;
    }

    .spread {
        bottom: 0;
        left: 50%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
            font-size: 20px;
            transition: transform 0.3s ease-in-out;
            transform: rotate(0);
        }
        .rotate {
            transform: rotate(180deg);
        }
    }
}

.shrink-header {
    height: 20px;
    .comp {
        top: -68px;
    }
}
</style>
