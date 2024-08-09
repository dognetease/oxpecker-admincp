<template>
    <el-dialog :title="title" :visible="visible" @close="$emit('close')">
        <div class="body">
            <span class="explain"> 新建查询需要保存在看板下 </span>
            <el-form
                :model="queryObject"
                size="small"
                label-width="80px"
                label-position="left"
                :rules="rules"
                ref="dashboardForm"
                class="form"
            >
                <el-form-item label="名称" prop="name">
                    <el-input v-model="queryObject.name"></el-input>
                </el-form-item>
                <tree-folder
                    :folderList="folderList"
                    :focusNodeList="focusedNodeList"
                    @tree-node-click="focusNode"
                    @create-dashboard="confirmCreate"
                    @delete-temp-dashboard="deleteTempDashboard"
                ></tree-folder>
            </el-form>
        </div>
        <div class="footer">
            <el-button
                :disabled="!focusedNode || focusedNode.type === 'top'"
                type="primary"
                @click="createDashBoard"
                key="createDashboardButton"
            >
                新建看板</el-button
            >
            <el-button @click="$emit('close')">取消</el-button>
            <el-button type="primary" :disabled="disableCreate" @click="saveQueryPanel">完成</el-button>
        </div>
    </el-dialog>
</template>

<script>
import TreeFolder from "../Folder/index.vue";
import { getFolderOrFiles, createDashboard, createPanels } from "@/api/dashboard";
import { mapGetters } from "vuex";
import { showMessage } from "@/utils/index";

export default {
    name: "CreateDashboardModal",
    components: {
        TreeFolder,
    },
    props: {
        visible: {
            type: Boolean,
            require: true,
        },
        title: {
            type: String,
            default: "新建查询",
        },
        name: {
            type: String,
            default: "",
        },
        origin: {
            type: Object,
        },
        computed: {
            type: Object,
        },
        type: {
            type: String,
            require: true,
        },
    },
    computed: {
        ...mapGetters(["globalState"]),
        productId() {
            return this.globalState.productId;
        },
        disableCreate() {
            if (!this.focusedNode) {
                return true;
            }
            if (this.focusedNode.type === "folder" || this.focusedNode.type === "top") {
                return true;
            }
            return false;
        },
    },
    data() {
        return {
            folderList: [],
            queryObject: {
                name: this.name,
            },
            rules: {
                name: [
                    {
                        required: true,
                        trigger: "blur",
                        message: "请输入查询名称",
                    },
                ],
            },
            focusedNodeList: [],
            focusedNode: null,
            inputNode: null,
        };
    },
    async mounted() {
        await this.getAllBoard();
        this.focusFirstFile();
    },
    methods: {
        async getAllBoard() {
            const privateFolders = await getFolderOrFiles(this.productId, "private");
            this.createFolderList(privateFolders);
        },
        createFolderList(folders) {
            const root = { name: "私人文件夹", parentId: null, id: 0, children: [], type: "top" };
            const queue = [root];
            let list = folders.map(el => ({
                ...el,
                type: el.type === "folder" ? "folder" : "file",
            }));

            while (queue.length) {
                const p = queue.shift();
                const children = list.filter(el => el.parentId === p.id);
                p.children = p.children || [];
                p.children.push(...children);
                queue.push(...children);
                list = list.filter(el => el.parentId !== p.id);
            }
            this.folderList = [root];
        },
        focusFirstFile() {
            const folders = this.folderList[0].children;
            for (const folder of folders) {
                if (folder.children && folder.children.length) {
                    this.focusedNodeList = [folder.children[0].id];
                    this.focusedNode = folder.children[0];
                    return;
                }
            }
        },
        focusNode(data) {
            this.focusedNode = data;
        },
        getFolderFromTree(id) {
            const folders = this.folderList[0].children;
            for (const folder of folders) {
                if (folder.id === id) {
                    return folder;
                }
            }
            return null;
        },
        createDashBoard() {
            if (this.inputNode && this.inputNode.showInput) {
                return;
            }
            const { type, parentId, id } = this.focusedNode;
            const opId = type === "file" ? parentId : id;
            const folder = this.getFolderFromTree(opId);

            if (folder) {
                folder.children = folder.children || [];
                const child = {
                    id: "tmp",
                    type: "file",
                    showInput: true,
                    children: [],
                    name: "",
                    parentId: opId,
                };
                folder.children.push(child);
                this.inputNode = child;
                this.focusedNodeList = ["tmp"];
            }
        },
        confirmCreate(data) {
            const { name, parentId } = data;
            createDashboard(parentId, this.productId, name).then(resp => {
                const { id } = resp;
                this.getAllBoard();
                this.inputNode = null;
                this.focusedNodeList = [id];
            });
        },
        deleteTempDashboard(data) {
            const { id, parentId } = data;
            const folder = this.getFolderFromTree(parentId);
            folder.children = folder.children.filter(el => el.id !== id);
            this.inputNode = null;
        },
        saveQueryPanel() {
            this.$refs["dashboardForm"].validate(valid => {
                if (valid) {
                    const param = {
                        name: this.queryObject.name,
                        productCode: this.productId,
                        dashboardId: this.focusedNode.id,
                        content: "",
                        type: this.type,
                    };
                    param.content = JSON.stringify({
                        origin: this.origin,
                        computed: this.computed,
                    });
                    createPanels(param).then(resp => {
                        showMessage('创建看板成功', 'success')
                        this.$emit("close");

                        const { id } = resp;
                        this.$emit("create-panel-done", id);
                    });
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.body {
    margin-bottom: 30px;
    ::v-deep .el-form-item {
        margin-bottom: 22px;
    }
    .explain {
        font-size: 12px;
    }
    .form {
        margin-top: 20px;
    }
}
.footer {
    display: flex;
    align-items: center;
    button:first-child {
        margin-left: 0;
        margin-right: auto;
    }
}
</style>
