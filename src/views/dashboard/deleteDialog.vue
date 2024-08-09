<template>
    <el-dialog :visible="visible" @close="$emit('close')" title="删除">
        <div class="body">
            {{ text }}
        </div>
        <span slot="footer" class="footer">
            <el-button @click="$emit('close')">取 消</el-button>
            <el-button type="primary" @click="doAction">确 定</el-button></span
        >
    </el-dialog>
</template>

<script>
import { deleteDashboard, deleteFolder, deletePanel } from "@/api/dashboard";
export default {
    name: "DeleteDialog",
    props: {
        id: {
            type: Number
        },
        visible: {
            type: Boolean,
            require: true
        },
        type: {
            type: String,
            require: true
        }
    },
    computed: {
        text() {
            switch (this.type) {
                case "panel":
                    return "删除查询，共享文件夹中被引用的查询也将同步删除，是否确认删除？";
                case "file":
                    return "删除看板，会同步删除看板下的所有查询，同时，共享文件夹中被引用的查询也将同步删除，是否确认删除？";

                case "folder":
                    return "删除文件夹，会同步删除文件下的所有看板及看板下的所有查询，同时，共享文件夹中被引用的查询也将同步删除，是否确认删除?";
                default:
                    return "";
            }
        }
    },
    methods: {
        doAction() {
            if (this.type === "panel") {
                deletePanel(this.id).then(() => {
                    this.$emit("delete-panel");
                });
            } else if (this.type === "file") {
                deleteDashboard(this.id).then(() => {
                    this.$emit("delete-dashboard");
                });
            } else if (this.type === "folder") {
                deleteFolder(this.id).then(() => {
                    this.$emit("delete-folder");
                });
            }
        }
    }
};
</script>

<style></style>
