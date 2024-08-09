<template>
    <div class="dashboard">
        <div class="side">
            <tree-bookmark
                :folder-list="folderList"
                :select-keys="focusNodeKeys"
                @set-add-icon="setAddIcon"
                @set-input="setInput"
                @show-add-folder-input="showAddFolderInput"
                @delete-folder-or-file="deleteFile"
                @share-folder-or-file="shareFile"
                @set-show-more-icon="setShowMoreIcon"
                @click-file="fileSelectHandler"
                @add-file="addDefaultFile"
            ></tree-bookmark>
        </div>
        <div class="main">
            <dashboard-view
                :folderList="folderList"
                :dashboard-id="dashboardId"
                :dashboard-name="dashboardName"
                :isPrivateDashboard="isPrivateDashboard"
            ></dashboard-view>
        </div>
        <share-dialog
            :foldersRoot="folderList.length === 0 ? [] : [folderList[1]]"
            :visible="shareVisible"
            :type="shareType"
            :id="shareId"
            @close="() => (this.shareVisible = false)"
            @share-file-done="shareDoneCb"
            @share-folder-done="shareDoneCb"
        ></share-dialog>
        <delete-dialog
            :visible="deleteVisible"
            :type="deleteType"
            :id="deleteId"
            @close="() => (this.deleteVisible = false)"
            @delete-folder="deleteFolderCb"
            @delete-dashboard="deleteFileCb"
        ></delete-dialog>
    </div>
</template>

<script>
import TreeBookmark from "./treeBookMark.vue";
import DashboardView from "./dashboard.vue";
import ShareDialog from "./shareDialog.vue";
import DeleteDialog from "./deleteDialog.vue";
import { getFolderOrFiles, createFolder, updateFolderName, createDashboard, updateDashboard } from "@/api/dashboard";
import { mapGetters } from "vuex";

const treeMap = new Map();

const initTreeMap = (list) => {
    treeMap.clear();
    const dfs = (array) => {
        if (array.length === 0) {
            return;
        }
        for (const each of array) {
            dfs(each.children || []);
            treeMap.set(each.id, each);
        }
    };
    dfs(list);
};

// 基于文件夹数组返回tree结构
const formatTree = (list) => {
    const root = [
        {
            name: "私人文件夹",
            type: "top",
            id: 0,
            showAdd: false,
            parentId: null
        },
        {
            name: "共享文件夹",
            type: "top",
            id: 1,
            showAdd: false,
            parentId: null
        }
    ];
    let queue = [...root];
    while (queue.length && list.length) {
        const cur = queue.shift();
        const { id } = cur;
        const children = [];
        const rest = [];
        for (const each of list) {
            if (each.parentId === id) {
                children.push({
                    name: each.name,
                    id: each.id,
                    parentId: each.parentId,
                    type: each.type === "folder" ? "folder" : "file",
                    showInput: false,
                    showMoreIcon: false
                });
            } else {
                rest.push(each);
            }
        }
        if (children.length) {
            cur.children = children;
            queue.push(...children);
        }
        list = rest;
    }
    return root;
};

export default {
    name: "dashboard",
    components: {
        TreeBookmark,
        DashboardView,
        ShareDialog,
        DeleteDialog
    },
    data() {
        return {
            dashboardId: -1,
            dashboardName: "",

            folderList: [],
            focusNodeKeys: [],

            deleteVisible: false,
            deleteId: -1,
            deleteType: "",

            shareVisible: false,
            shareId: -1,
            shareType: ""
        };
    },
    computed: {
        ...mapGetters(["globalState"]),
        productId() {
            return this.globalState.productId;
        },
        isPrivateDashboard() {
            if (this.dashboardId === -1) {
                // 这里无所谓，-1代表无dashboard
                return true;
            }
            const folderId = treeMap.get(this.dashboardId).parentId;
            const rootId = treeMap.get(folderId).parentId;
            return rootId === 0;
        }
    },
    watch: {
        productId: {
            immediate: true,
            handler(newVal) {
                if (newVal && newVal.length) {
                    this.initPage();
                }
            }
        }
    },
    methods: {
        initPage() {
            this.getAllBoards();
            this.dashboardId = -1;
            this.dashboardName = "";
            this.focusNodeKeys = [];
        },
        focusFirstChild() {
            let queue = [this.folderList[0]];
            while (queue.length) {
                const p = queue.shift();
                if (p.type === "file") {
                    this.focusNodeKeys = [p.id];
                    this.dashboardId = p.id;
                    this.dashboardName = p.name;
                    return;
                }
                if (p.children && p.children.length) {
                    queue.push(...p.children);
                }
            }
        },
        getAllBoards() {
            return getFolderOrFiles(this.productId).then((resp) => {
                this.folderList = formatTree(resp);
                initTreeMap(this.folderList);
                if (this.focusNodeKeys.length === 0) {
                    this.focusFirstChild();
                }
            });
        },
        setAddIcon(id, flag) {
            const item = treeMap.get(id);
            item.showAdd = flag;
        },
        showAddFolderInput(id) {
            const item = treeMap.get(id);
            this.focusNodeKeys = [item.id];
            item.children = item.children || [];
            const newItem = {
                label: "",
                id: "tmp",
                parentId: item.id,
                type: "folder",
                showInput: true,
                showMoreIcon: false,
                children: []
            };
            item.children.push(newItem);
            treeMap.set(newItem.id, newItem);
            this.folderList = [...this.folderList];
        },
        setInput(id, flag) {
            const item = treeMap.get(id);
            // 展示输入框
            if (flag) {
                item.showInput = true;
            } else {
                // 新建文件夹
                if (item.id === "tmp") {
                    // 有文字的时候更新
                    if (item.name && item.name.length) {
                        createFolder(item.parentId, item.name, this.productId).then(this.afterUpdateFolder);
                    } else {
                        const parentItem = treeMap.get(item.parentId);
                        parentItem.children = parentItem.children.filter((el) => {
                            return el.id !== item.id;
                        });
                    }
                } else {
                    const { type } = item;
                    if (type === "folder") {
                        updateFolderName(item.id, item.name).then(this.afterUpdateFolder);
                    } else {
                        updateDashboard({
                            id: item.id,
                            folderId: item.parentId,
                            name: item.name
                        }).then(this.afterUpdateFolder);
                    }
                }
            }
        },
        afterUpdateFolder() {
            this.getAllBoards();
            this.deleteId = -1;
            this.deleteVisible = false;
            if (this.focusNodeKeys.includes(this.deleteId)) {
                this.focusNodeKeys = [];
            }
        },
        deleteFile(id) {
            this.deleteId = id;
            this.deleteVisible = true;
            const item = treeMap.get(id);
            const { type } = item;
            this.deleteType = type;
        },
        shareFile(id) {
            this.shareId = id;
            this.shareVisible = true;
            const item = treeMap.get(id);
            this.shareType = item.type;
        },
        setShowMoreIcon(id, flag) {
            const item = treeMap.get(id);
            item.showMoreIcon = flag;
        },
        fileSelectHandler(id) {
            const item = treeMap.get(id);
            this.dashboardId = id;
            this.dashboardName = item.name;

            const parent = treeMap.get(item.parentId);
            const grandParent = treeMap.get(parent.parentId);
            this.$track("dashboard", {
                folder_type: grandParent.id === 0 ? "private" : "public",
                folder_name: item.name
            });
        },
        shareDoneCb() {
            this.shareVisible = false;
            this.getAllBoards();
        },
        deleteFolderCb() {
            this.deleteVisible = false;
            this.focusFolder(this.deleteId);
            this.getAllBoards();
        },
        focusFolder(folderId) {
            const rootParent = treeMap.get(treeMap.get(folderId).parentId);
            const folders = rootParent.children;
            for (const folder of folders) {
                if (folder.children && folder.children.length && folder.id !== folderId) {
                    const firstDashboard = folder.children[0];
                    this.focusNodeKeys = [firstDashboard.id];
                    this.dashboardId = firstDashboard.id;
                    this.dashboardName = firstDashboard.name;
                    break;
                }
            }
        },

        deleteFileCb() {
            this.deleteVisible = false;
            const folder = treeMap.get(treeMap.get(this.deleteId).parentId);
            if (folder.children && folder.children.length) {
                let isFocusChild = false;
                for (const dashboard of folder.children) {
                    if (dashboard.id !== this.deleteId) {
                        this.focusNodeKeys = [dashboard.id];
                        this.dashboardId = dashboard.id;
                        this.dashboardName = dashboard.name;
                        isFocusChild = true;
                        break;
                    }
                }
                if (!isFocusChild) {
                    this.focusFolder(folder.id);
                }
            } else {
                this.focusFolder(folder.id);
            }
            this.getAllBoards();
        },

        addDefaultFile(id) {
            createDashboard(id, this.productId, "未命名看板").then((resp) => {
                const { id, name } = resp;
                this.getAllBoards().then(() => {
                    this.focusNodeKeys = [id];
                    this.dashboardId = id;
                    this.dashboardName = name;
                });
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.dashboard {
    padding: 20px 10px 0 10px;
    width: 100%;
    display: flex;
    position: relative;
    height: 100%;
    .side {
        position: sticky;
        top: 0;
        width: 220px;
        flex: 0 0 auto;
    }
    .main {
        padding-left: 20px;
        flex: 0 0 calc(100% - 220px);
        box-sizing: border-box;
        height: 100%;
    }
}
</style>
