<template>
    <div class="event">
        <el-input type="textarea" class="textarea" rows="3" :value="value" @input="changeDesc"> </el-input>
        <div
            class="picture"
            v-for="(picUrl, idx) in eventPicUrl"
            :key="picUrl"
            @mouseenter="() => (hoverIndex = idx)"
            @mouseleave="() => (hoverIndex = -1)"
        >
            <img :src="picUrl" />
            <i class="el-icon-close delete" v-if="hoverIndex === idx" @click="$emit('remove-url', idx)"></i>
        </div>
        <el-upload
            action="#"
            :show-file-list="false"
            :multiple="false"
            :limit="10"
            accept="image/jpeg,image/png,image/jpg"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="fileChange"
        >
            <div class="inner">
                <i class="el-icon-plus icon"></i>
            </div>
        </el-upload>
    </div>
</template>

<script setup>
import request from "@/utils/request";
import { ref } from "vue";
import Vue from "vue";
const props = defineProps({
    value: {
        type: String,
        default: ""
    },
    eventPicUrl: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(["input", "add-url", "remove-url"]);

let fileList = ref([]);
const fileChange = (file, list) => {
    fileList.value = list;
    const formData = new FormData();
    for (let i = 0; i < list.length; i++) {
        const f = list[i];
        formData.append("files", f.raw, f.name);
    }
    request({
        url: "/api/pub/upload/get_download_url",
        method: "POST",
        data: formData
    }).then((response) => {
        if (response.status === 200 && response.data && response.data.code === 0) {
            const list = response.data.data;
            if (list.length) {
                const first = list[0];
                const url = first.url;
                emit("add-url", url);
                fileList.value = [];
            } else {
                console.error("上传失败，请检查接口！");
            }
        } else {
            Vue.prototype.$message({
                message: "上传失败，请重试！",
                type: "error"
            });
        }
    });
};

const hoverIndex = ref(-1);

const changeDesc = (value) => emit("input", value);
</script>
<style lang="scss" scoped>
.event {
    .icon {
        font-size: 40px;
        color: rgb(220, 223, 230);

        &:hover {
            color: rgb(154, 156, 161);
        }
    }

    .picture {
        width: 75px;
        aspect-ratio: 1;
        position: relative;
        margin-right: 20px;

        img {
            width: 100%;
            height: 100%;
        }

        .delete {
            position: absolute;
            cursor: pointer;
            top: 0;
            right: 0;
            transform: translate(50%, -50%);
            font-size: 20px;
            color: #fff;
            background: red;
            border-radius: 50%;
        }
    }

    display: flex;
    flex-wrap: wrap;
    row-gap: 20px;

    .textarea {
        width: 400px;
        margin-right: 40px;
    }

    .inner {
        aspect-ratio: 1;
        width: 75px;
        box-sizing: border-box;
        border: 1px dashed rgb(220, 223, 230);
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
