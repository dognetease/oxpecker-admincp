<template>
    <div class="book-mark">
        <el-tree
            :expand-on-click-node="false"
            default-expand-all
            :data="folderList"
            node-key="id"
            :default-expanded-keys="selectKeys"
            @node-click="nodeClick"
        >
            <span slot-scope="{ data }" class="tree-container">
                <span
                    v-if="data.type === 'top'"
                    class="top"
                    @mouseenter="showAdd(data.id)"
                    @mouseleave="hiddenAdd(data.id)"
                >
                    <i class="el-icon-folder"></i>
                    <span class="item">{{ data.name }}</span>
                    <i class="el-icon-plus tag" v-show="data.showAdd" @click="showAddFolder($event, data.id)"></i>
                </span>
                <span
                    v-else-if="data.type === 'folder'"
                    class="folder"
                    @mouseenter="showMoreIcon(data.id)"
                    @mouseleave="hiddenMoreIcon(data.id)"
                >
                    <i class="el-icon-folder"></i>
                    <el-input
                        v-model="data.name"
                        ref="folderInput"
                        v-if="data.showInput"
                        @keyup.enter.native="$event.target.blur()"
                        @blur="hiddenInput(data.id)"
                        class="item"
                        size="mini"
                    ></el-input>
                    <span v-else class="item">{{ data.name }}</span>
                    <el-dropdown v-show="!data.showInput && data.showMoreIcon">
                        <i class="el-icon-more tag" @click="(e) => e.stopImmediatePropagation()"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="addFile(data.id)">新建看板</el-dropdown-item>
                            <el-dropdown-item @click.native="showInput(data.id)">重命名</el-dropdown-item>
                            <el-dropdown-item v-if="data.parentId === 0" @click.native="shareFolderOrFile(data.id)"
                                >分享到</el-dropdown-item
                            >
                            <el-dropdown-item @click.native="deleteFolderOrFile(data.id)">删除</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </span>
                <span
                    v-else-if="data.type === 'file'"
                    class="file"
                    :class="{
                        'active-node': data.id === currentNodeId
                    }"
                    @mouseenter="showMoreIcon(data.id)"
                    @mouseleave="hiddenMoreIcon(data.id)"
                >
                    <!-- <i class="el-icon-document"></i> -->
                    <img src="@/icons/png/panel-logo.png" />
                    <el-input
                        v-model="data.name"
                        ref="folderInput"
                        v-if="data.showInput"
                        @keyup.enter.native="$event.target.blur()"
                        @blur="hiddenInput(data.id)"
                        class="item"
                        size="mini"
                    ></el-input>
                    <span v-else class="item">{{ data.name }}</span>
                    <el-dropdown v-show="!data.showInput && data.showMoreIcon">
                        <i class="el-icon-more tag"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="showInput(data.id)">重命名</el-dropdown-item>
                            <el-dropdown-item @click.native="shareFolderOrFile(data.id)">分享到</el-dropdown-item>
                            <el-dropdown-item @click.native="deleteFolderOrFile(data.id)">删除</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </span>
            </span>
        </el-tree>
    </div>
</template>

<script>
export default {
    name: "TreeBookmark",
    props: {
        addFolder: {
            default: true,
            type: Boolean
        },
        editFile: {
            type: Boolean,
            default: true
        },
        folderList: {
            type: Array,
            require: true
        },
        selectKeys: {
            type: Array,
            require: true
        }
    },
    data() {
        return {
            currentNodeId: -1
        };
    },
    watch: {
        folderList: {
            handler() {
                const elInput = this.$refs["folderInput"];
                if (elInput) {
                    elInput.focus();
                }
            }
        },
        selectKeys(val) {
            if (Array.isArray(val) && val.length > 0) {
                this.currentNodeId = val[0];
            }
        }
    },
    methods: {
        showAdd(id) {
            this.$emit("set-add-icon", id, true);
        },
        hiddenAdd(id) {
            this.$emit("set-add-icon", id, false);
        },
        showAddFolder(e, id) {
            e.stopPropagation();
            this.$emit("show-add-folder-input", id);
        },
        showInput(id) {
            this.$emit("set-input", id, true);
        },
        hiddenInput(id) {
            this.$emit("set-input", id, false);
        },
        deleteFolderOrFile(id) {
            this.$emit("delete-folder-or-file", id);
        },
        shareFolderOrFile(id) {
            this.$emit("share-folder-or-file", id);
        },
        showMoreIcon(id) {
            this.$emit("set-show-more-icon", id, true);
        },
        hiddenMoreIcon(id) {
            this.$emit("set-show-more-icon", id, false);
        },
        nodeClick(data) {
            const { id, type } = data;
            if (type === "file") {
                this.currentNodeId = id;
                this.$emit("click-file", id);
            }
        },
        addFile(id) {
            this.$emit("add-file", id);
        }
    }
};
</script>

<style scoped lang="scss">
.book-mark {
    ::v-deep .el-tree-node__content {
        height: 34px;
        line-height: 34px;
    }

    ::v-deep .el-tree-node__content:has(.active-node) {
        background-color: #f5f5f5;
    }
}

.tree-container {
    width: 100%;
}

.top,
.folder,
.file {
    display: flex;
    align-items: center;
    height: 34px;
    line-height: 34px;
    width: 100%;
    img {
        height: 17px;
    }
    .item {
        margin-left: 8px;
        margin-right: 8px;
        flex: 1 1 100px;
        width: 90px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .tag {
        margin-right: 20px;
        margin-left: auto;
    }
}
</style>
