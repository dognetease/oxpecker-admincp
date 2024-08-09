<template>
    <div class="pictures">
        <div
            class="display"
            v-for="(item, idx) in list"
            :key="idx"
            :style="{
                width: width + 'px',
                height: height + 'px',
            }"
        >
            <el-image
                :style="{
                    width: width + 'px',
                    height: height + 'px',
                }"
                :src="item"
                fit="cover"
                :preview-src-list="[item]"
            ></el-image>
            <i
                class="el-icon-close delete"
                :style="{
                    width: iconSize + 'px',
                    height: iconSize + 'px',
                }"
                @click="$emit('remove-pic', idx)"
            ></i>
        </div>
        <div class="upload">
            <el-upload
                multiple
                :limit="10"
                action="#"
                accept=".png,.jpg,.jpeg,.bmp"
                class="img-upload"
                :http-request="uploadFiles"
                :show-file-list="false"
            >
                <div
                    class="box"
                    :style="{
                        width: width + 'px',
                        height: height + 'px',
                    }"
                >
                    <i
                        class="el-icon-plus icon"
                        :style="{
                            width: iconSize + 'px',
                            height: iconSize + 'px',
                        }"
                    ></i>
                    <div class="text">上传图片</div>
                </div>
            </el-upload>
        </div>
    </div>
</template>

<script setup>
import { uploadFile } from "@/api/common.js";
const props = defineProps({
    list: {
        default: () => [],
        type: Array,
    },
    width: {
        default: 80,
        type: Number,
    },
    height: {
        default: 80,
        type: Number,
    },
    iconSize: {
        tye: Number,
        default: 20,
    },
});
const emits = defineEmits(["add-pic", "remove-pic"]);

const uploadFiles = param => {
    const file = param.file;
    uploadFile(file).then(res => {
        if (res && res.length) {
            emits("add-pic", res[0]);
        }
    });
};
</script>

<style lang="scss" scoped>
.pictures {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    .display {
        position: relative;
        border: 1px dashed #d3dce6;
        box-sizing: border-box;
    }

    .delete {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
        border-radius: 50%;
        background-color: #ff5252;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .upload {
        .box {
            box-sizing: border-box;
            border-radius: 4px;
            border: 1px dashed #d3dce6;
            background-color: #f6f8fb;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: space-around;

            .icon {
                font-size: 20px;
                margin-top: 10px;
            }
        }
    }
}
</style>
