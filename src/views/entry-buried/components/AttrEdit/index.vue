<script setup>
defineProps(["list"]);
defineEmits(["remove-attribute", "add-attribute"]);
</script>

<template>
    <div class="edit">
        <div class="item" v-for="(item, idx) in list" :key="'' + idx + item.id">
            <div class="couple" v-for="each in item.list" :key="each.label">
                <span class="label">{{ each.label }}</span>
                <el-input
                    :disabled="item.edit === false && (each.label === '属性值' || each.label === '属性名')"
                    class="value"
                    v-model="each.value"
                    size="small"
                ></el-input>
            </div>
            <div class="icons">
                <i class="el-icon-circle-plus-outline add" @click="$emit('add-attribute')"></i>
                <i
                    class="el-icon-remove-outline sub"
                    v-if="list.length > 1 && item.edit !== false"
                    @click="$emit('remove-attribute', item.id)"
                ></i>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit {
    .item {
        background-color: #f5f5f5;
        padding: 20px;

        &:first-child {
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        &:last-child {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        display: flex;
        align-items: center;
        column-gap: 20px;

        .couple {
            display: flex;
            align-items: center;

            .label {
                font-size: 14px;
                color: #333;
                white-space: nowrap;
                font-weight: 700;
                margin-right: 7px;
            }
        }

        .icons {
            display: flex;
            align-items: center;
            width: 100px;
            margin-left: 20px;

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
    }
}
</style>
