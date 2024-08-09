<template>
    <div class="disable-attr">
        <el-dialog
            title="禁用属性"
            :visible="visible"
            :close-on-click-modal="false"
            :show-close="false"
            @close="$emit('reset-status')"
        >
            <el-checkbox :indeterminate="isIndeterminate" :value="isCheckAll" @change="toggleCheckedAll"
                >全选</el-checkbox
            >
            <div style="margin: 15px 0"></div>
            <div class="option">
                <el-checkbox
                    v-for="item in checkedList"
                    :label="item.name"
                    :value="item.checked"
                    @change="checked => changeChecked(item.name, checked)"
                    :key="item.name"
                    >{{ item.name }}</el-checkbox
                >
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="$emit('close-modal')">取消</el-button>
                <el-button type="primary" @click="$emit('update-edit')" :disabled="disableSubmit">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps(["visible", "checkedList"]);
const emits = defineEmits([
    "close-modal",
    "update-edit",
    "change-checked",
    "check-all",
    "clear-checked",
    "reset-status",
]);

const isCheckAll = ref(false);
// const isIndeterminate = ref(false);

watch(
    () => props.checkedList,
    list => {
        if (list.length && list.every(each => each.checked)) {
            isCheckAll.value = true;
        } else {
            isCheckAll.value = false;
        }
    }
);

const isIndeterminate = computed(() => {
    if (isCheckAll.value) {
        return false;
    }
    const checkedSum = props.checkedList.reduce((acc, cur) => {
        return acc + cur.checked ? 1 : 0;
    }, 0);
    return checkedSum > 0 && checkedSum < props.checkedList.length;
});

const disableSubmit = computed(() => {
    return props.checkedList.every(each => !each.checked);
})

const toggleCheckedAll = () => {
    isCheckAll.value = !isCheckAll.value;
    if (isCheckAll.value) {
        emits("check-all");
    } else {
        emits("clear-checked");
    }
};

const changeChecked = (name, checked) => {
    emits("change-checked", name, checked);
};
</script>

<style lang="scss" scoped></style>
