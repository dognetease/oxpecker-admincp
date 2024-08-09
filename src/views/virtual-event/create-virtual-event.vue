<template>
    <div class="create">
        <div class="bar">虚拟事件可以组合多个事件和筛选条件，以方便您灵活的使用各种分析模型</div>
        <div class="content">
            <el-form :model="formData" :rules="formRule" label-position="left" label-width="120px">
                <el-form-item label="虚拟事件显示名" prop="displayName" class="item" required>
                    <el-input
                        v-model="formData.displayName"
                        placeholder="显示名不能为空，不超过100个字符"
                    ></el-input>
                </el-form-item>
                <el-form-item label="虚拟事件名" prop="eventName" class="item" required>
                    <el-input
                        v-model="formData.eventName"
                        placeholder="事件名只能包含大小写字母、数字和_ ，不能以数字开头，不超过 100 个字符"
                    ></el-input>
                </el-form-item>
                <el-form-item label="标签" class="item">
                    <el-input v-model="formData.tags" placeholder="请输入标签，多个标签之间用英文逗号分隔"></el-input>
                </el-form-item>
                <el-form-item label="事件截图" class="item">
                    <div class="pic">
                        <div class="text">支持png、jpg、jpeg、bmp格式的图片，每张图片最大10M</div>
                        <ImgUpload
                            :list="formData.pictureList"
                            @add-pic="addPic"
                            @remove-pic="removePic"
                        ></ImgUpload>
                    </div>
                </el-form-item>
                <el-form-item label="备注" class="item">
                    <el-input
                        type="textarea"
                        :rows="4"
                        placeholder="请输入内容"
                        v-model="formData.remark"
                        maxlength="200"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="虚拟事件的组成" class="item last" required> </el-form-item>
                <div class="filter">
                    <div class="tip">当以下事件中任意一个被触发时，视作该虚拟事件被触发</div>
                    <EventCondition
                        ref="conditionRef"
                        @update="updateEventFilters"
                        :data="formData.eventFilters"
                        filterCondType="AND"
                    ></EventCondition>
                </div>
            </el-form>
        </div>
        <div class="footer">
            <el-button @click="$emit('cancel')">取消</el-button>
            <el-button type="primary" :disabled="disableSubmit" @click="submit" :loading="loading">{{
                submitText
            }}</el-button>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch } from "vue";
import ImgUpload from "@/components/img-upload.vue";
import EventCondition from "./event-condition.vue";
import { every, join, slice, assign } from "lodash";

const props = defineProps({
    type: {
        type: String,
        default: "",
    },
    data: {
        type: Object,
        default: () => ({}),
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const conditionRef = ref(null);
const initList = list => {
    conditionRef.value.initList(list);
};
defineExpose({
    initList,
});

const submitText = computed(() => {
    switch (props.type) {
        case "create":
            return "创建";
        case "copy":
            return "确认复制";
        case "edit":
            return "保存";
        default:
            return "";
    }
});

const emits = defineEmits(["submit", "cancel"]);
const formData = reactive({
    displayName: "",
    eventName: "",
    tags: "",
    pictureList: [],
    remark: "",
    eventFilters: [],
});
const updateEventFilters = filters => {
    formData.eventFilters = filters;
};

const disableSubmit = computed(() => {
    const filters = formData.eventFilters;
    const validFilters =
        filters.length > 0 &&
        every(filters, f => {
            return f.name && Array.isArray(f.filters) && f.filters.every(item => {
                return item.name && (item.value.length > 0 || ["N_MTY", "MTY"].includes(item.cond)); // 有值、没值不显示 value 字段，所以不是必填
            });
        });

    const displayName = formData.displayName;
    const validDisplayName = displayName.length > 0 && displayName.length < 100;

    const eventName = formData.eventName;
    const reg = /^(?!^[0-9])([a-zA-Z0-9_$]{1,100})$/;
    const validEventName = reg.test(eventName);
    return !validDisplayName || !validEventName || !validFilters;
});

const formRule = ref({
    displayName: [
        {
            validator(_, value, callback) {
                if (value.length === 0 || value.length >= 100) {
                    callback(new Error("显示名不能为空，不超过100个字符"));
                } else {
                    callback();
                }
            },
        },
    ],
    eventName: [
        {
            validator(_, value, callback) {
                const reg = /^(?!^[0-9])([a-zA-Z0-9_]{1,100})$/;
                if (!reg.test(value)) {
                    callback(
                        new Error(
                            "事件名只能包含大小写字母、数字和_ ，不能以数字开头，不超过 100 个字符"
                        )
                    );
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
});
const submit = () => {
    const data = assign({}, formData);
    if (props.type === "edit") {
        data.id = props.data.id;
    }
    emits("submit", data);
};

// 照片相关
const addPic = ({ url }) => {
    formData.pictureList.push(url);
};
const removePic = index => {
    formData.pictureList.splice(index, 1);
};

// 初始化对象
const initData = () => {
    const data = props.data;
    formData.displayName = data.displayName;
    formData.eventName = data.name;
    formData.tags = join(data.tagList || []);
    formData.pictureList = slice(data.pictureList);
    formData.remark = data.remark;
};

onMounted(() => {
    switch (props.type) {
        case "create":
            break;
        case "copy":
        case "edit":
            initData();
            break;
        default:
            break;
    }
});
</script>

<style lang="scss" scoped>
.create {
    font-size: 14px;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;

    .bar {
        background: #fff8ea;
        color: #475669;
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
        position: sticky;
        padding: 8px 20px;
        top: 0;
        z-index: 1;
    }

    .content {
        padding-top: 24px;
        padding-bottom: 24px;
        flex: auto;

        // .item {
        //     display: flex;
        //     align-items: center;
        // }

        .item {
            ::v-deep .el-form-item__label {
                color: #1f2d3d;
                font-size: 14px;
                font-weight: 500;
                line-height: 32px;
            }

            padding: 0 20px;
        }

        .last {
            margin-bottom: 10px;
            ::v-deep .el-form-item__label {
                margin-bottom: 0;
            }
        }

        .pic {
            .text {
                margin-bottom: 10px;
            }
        }

        .filter {
            .tip {
                padding-left: 20px;
                font-size: 12px;
                color: #8492a6;
                margin-bottom: 12px;
            }
        }
    }

    .footer {
        position: sticky;
        bottom: 0;
        z-index: 1;
        background-color: #fff;

        padding: 10px 30px;
        display: flex;
        justify-content: flex-end;
        column-gap: 20px;

        box-shadow: 0 -2px 9px rgba(153, 169, 191, 0.17);
    }
}
</style>
