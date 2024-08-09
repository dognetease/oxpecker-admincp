<template>
    <div class="folder">
        <el-tree
            :expand-on-click-node="false"
            :data="folderList"
            :default-expanded-keys="focusNodeList"
            node-key="id"
            @node-click="nodeClick"
        >
            <div slot-scope="{ data }" class="folder-box">
                <span v-if="data.type === 'top' || data.type === 'folder'" class="folder-box-item">
                    <i class="el-icon-folder"></i>
                    <span class="text">{{ data.name }}</span>
                </span>
                <span
                    v-else-if="data.type === 'file'"
                    class="folder-box-item file"
                    :class="{
                        'active-node': data.id === currentNodeId
                    }"
                >
                    <!-- <i class="el-icon-document"></i> -->
                    <img src="@/icons/png/panel-logo.png" />

                    <el-input
                        @keyup.enter.native="$event.target.blur"
                        @blur="confirmDashboardName(data)"
                        v-if="data.showInput"
                        size="mini"
                        v-model="data.name"
                        class="input"
                        ref="tree-input"
                        v-focus
                    ></el-input>
                    <span class="text" v-else>{{ data.name }}</span>
                </span>
            </div>
        </el-tree>
    </div>
</template>

<script>
export default {
    name: "Folder",
    props: {
        folderList: {
            type: Array,
            require: true
        },
        focusNodeList: {
            type: Array,
            default: () => []
        }
    },
    directives: {
        focus: {
            inserted: function (el) {
                const inputDOM = el.children[0];
                inputDOM.focus();
            }
        }
    },
    watch: {
        focusNodeList(val) {
            if (Array.isArray(val) && val.length > 0) {
                this.currentNodeId = val[0];
            }
        }
    },
    data() {
        return {
            currentNodeId: -1
        };
    },
    methods: {
        nodeClick(data) {
            this.currentNodeId = data.id;
            this.$emit("tree-node-click", data);
        },
        confirmDashboardName(data) {
            const { name } = data;
            if (name.length === 0) {
                this.$emit("delete-temp-dashboard", data);
                return;
            }
            this.$emit("create-dashboard", data);
        }
    }
};
</script>

<style lang="scss" scoped>
.folder {
    ::v-deep .el-tree-node__content {
        height: 34px;
        line-height: 34px;
    }
    ::v-deep .el-tree-node__content:has(.active-node) {
        background-color: #f5f5f5;
    }
    &-box {
        &-item {
            display: flex;
            align-items: center;
            column-gap: 10px;
        }

        .file {
            .input {
                width: 150px;
            }

            img {
                height: 17px;
            }
        }
    }
}
</style>
