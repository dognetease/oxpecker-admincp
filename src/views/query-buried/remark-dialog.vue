<template>
    <div class="remark">
        <el-dialog
            title="备注"
            width="680px"
            @close="cleanState"
            :visible="visible"
            :close-on-click-modal="false"
            :show-close="false"
        >
            <p v-if="data.length === 0">这个事件没有备注，点击备注新增备注</p>
            <el-collapse v-for="item in data" :key="item.id" accordion>
                <el-collapse-item>
                    <template slot="title">
                        <div>{{ item.operator }} 添加了备注 - {{ item.createTime }}</div>
                    </template>
                    <p v-html="item.remark"></p>
                </el-collapse-item>
            </el-collapse>
            <div class="add-remark" v-if="status === 'view'">
                <el-button @click="() => (status = 'edit')">备注</el-button>
            </div>
            <div class="save-remark" v-else-if="status === 'edit'">
                <EventDesc
                    v-if="status === 'edit'"
                    :value="text"
                    :eventPicUrl="imgs"
                    @input="changeText"
                    @add-url="addPic"
                    @remove-url="removePic"
                ></EventDesc>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeModal">取消</el-button>
                <el-button type="primary" @click="submit" :disabled="disableSubmit">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script setup>
import EventDesc from "@/components/eventDesc/index.vue";
import { ref, computed } from "vue";
defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    visible: {
        type: Boolean,
        default: false,
    },
});

const disableSubmit = computed(() => {
    return text.value === "" && imgs.value.length === 0;
});

const emits = defineEmits(["close-modal", "submit-edit"]);
const closeModal = () => {
    emits("close-modal");
};

const status = ref("view");
const text = ref("");
const imgs = ref([]);

const changeText = val => {
    text.value = val;
};

const addPic = url => {
    imgs.value.push(url);
};
const removePic = index => {
    imgs.value.splice(index, 1);
};

const submit = () => {
    emits("submit-edit", {
        text: text.value,
        imgs: imgs.value,
    });
};

const cleanState = () => {
    status.value = "view";
    text.value = "";
    imgs.value = [];
};
</script>

<style lang="scss" scoped>
.remark {
    .add-remark,
    .save-remark {
        margin-top: 10px;
    }
}
</style>
