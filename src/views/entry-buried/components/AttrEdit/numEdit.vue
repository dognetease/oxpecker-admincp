<script setup>
defineProps(["list", "unitList"]);
const emit = defineEmits(["remove-attribute", "add-attribute"]);

const removeItem = id => {
    emit("remove-attribute", id);
};

const addItem = () => {
    emit("add-attribute");
};
</script>
<template>
    <div class="edit">
        <div class="item" v-for="item in list" :key="item.id">
            <div class="left">
                <div class="top">
                    <div class="name couple">
                        <span class="text"> 属性 </span>
                        <el-input
                            :disabled="item.edit === false"
                            v-model="item.name"
                            class="input"
                            size="small"
                        ></el-input>
                    </div>
                    <div class="name-desc couple">
                        <span class="text"> 属性描述 </span>
                        <el-input v-model="item.nameDesc" class="input" size="small"></el-input>
                    </div>
                </div>
                <div class="bottom">
                    <div class="min couple">
                        <span class="text"> 最小值 </span>
                        <el-input-number
                            :disabled="item.edit === false"
                            v-model="item.min"
                            class="input"
                            size="small"
                            type="number"
                        ></el-input-number>
                    </div>
                    <div class="max couple">
                        <span class="text"> 最大值 </span>
                        <el-input-number
                            :disabled="item.edit === false"
                            v-model="item.max"
                            class="input"
                            size="small"
                            type="number"
                        ></el-input-number>
                    </div>
                    <div class="unit couple">
                        <span class="text"> 单位 </span>
                        <el-select
                            v-model="item.unit"
                            size="small"
                            style="width: 100px"
                            :disabled="item.edit === false"
                        >
                            <el-option
                                v-for="option in unitList"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            ></el-option>
                        </el-select>
                    </div>
                </div>
            </div>
            <div class="right">
                <i class="el-icon-circle-plus-outline add" @click="addItem"></i>
                <i
                    class="el-icon-remove-outline sub"
                    v-if="list.length > 1 && item.edit !== false"
                    @click="removeItem(item.id)"
                ></i>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit {
    .item {
        background-color: #f5f5f5;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 20px;
        padding: 20px;

        &:first-child {
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        &:last-child {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        .text {
            color: #333;
            font-weight: 700;
            font-size: 14px;
        }

        .left {
            .top,
            .bottom {
                display: flex;
                align-items: center;
                column-gap: 20px;

                .couple {
                    display: flex;
                    align-items: center;
                    flex: auto;

                    .text {
                        white-space: nowrap;
                        padding-right: 8px;
                    }
                }
            }

            .top {
                display: flex;
            }

            .bottom {
                margin-top: 10px;
            }
        }

        .right {
            display: flex;
            align-items: center;
            width: 100px;

            .add,
            .sub {
                color: hsl(0, 0%, 74.7%);
                font-size: 26px;

                &:hover {
                    cursor: pointer;
                }
            }

            .add:hover {
                color: #67c23a;
            }

            .sub {
                margin-left: 12px;
            }

            .sub:hover {
                color: #f56c6c;
            }
        }

        // .name,
        // .name-desc,
        // .min,
        // .max,
        // .unit {
        //     display: flex;
        //     align-items: center;
        // }
    }
}
</style>
