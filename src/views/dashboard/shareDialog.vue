<template>
    <el-dialog :visible="visible" @close="$emit('close')" :title="text">
        <div class="body">
            <span class="text"> {{ text }}： </span>
            <el-cascader v-model="value" :options="folders"></el-cascader>
        </div>
        <span slot="footer" class="footer">
            <el-button @click="$emit('close')">取 消</el-button>
            <el-button type="primary" @click="doAction">确 定</el-button></span
        >
    </el-dialog>
</template>

<script>
const createCascadarData = (rootList) => {
    return rootList.map((r) => {
        let ret = {
            label: r.name,
            value: r.id
        };
        if (r.children && r.children.length) {
            ret.children = r.children.map((folder) => {
                let f = {
                    label: folder.name,
                    value: folder.id
                };
                if (folder.children && folder.children.length) {
                    f.children = folder.children.map((dashboard) => {
                        return {
                            label: dashboard.name,
                            value: dashboard.id
                        };
                    });
                } else {
                    f.disabled = true;
                }
                return f;
            });
        }
        return ret;
    });
};

import { shareFolder, shareDashboard, sharePanel, updatePanel } from "@/api/dashboard";
export default {
    name: "ShareModal",
    props: {
        foldersRoot: {
            type: Array,
            default: () => []
        },
        id: {
            type: Number
        },
        type: {
            type: String,
            default: ""
        },
        visible: {
            type: Boolean,
            require: true
        }
    },
    computed: {
        text() {
            if (this.type === "move-panel") {
                return "移动到";
            }
            return "分享到";
        },
        folders() {
            if (!this.foldersRoot.length) {
                return [];
            }

            const tree = createCascadarData(this.foldersRoot);

            if (this.type === "panel" || this.type === "move-panel") {
                return tree;
            } else if (this.type === "file") {
                return tree.map((el) => {
                    const { children } = el;
                    const newChildren = children.map((folder) => {
                        return {
                            label: folder.label,
                            value: folder.value
                        };
                    });
                    el.children = newChildren;
                    return el;
                });
            } else if (this.type === "folder") {
                return tree.map((r) => {
                    return {
                        label: r.label,
                        value: r.value
                    };
                });
            }

            return [];
        }
    },
    data() {
        return {
            value: []
        };
    },
    methods: {
        doAction() {
            if (this.value.length === 0) {
                this.$message({
                    type: "warning",
                    message: "请选择分享目标"
                });
                return;
            }
            const [_, folderId, dashboardId] = this.value;
            if (this.type === "panel") {
                sharePanel(this.id, dashboardId).then(() => {
                    this.$emit("share-panel-done");
                });
            } else if (this.type === "move-panel") {
                updatePanel({
                    id: this.id,
                    dashboardId
                }).then(() => {
                    this.$emit("move-panel-done");
                });
            } else if (this.type === "file") {
                shareDashboard(folderId, this.id).then(() => {
                    this.$emit("share-file-done");
                });
            } else if (this.type === "folder") {
                shareFolder(this.id).then(() => {
                    this.$emit("share-folder-done");
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 10px;
}
</style>
