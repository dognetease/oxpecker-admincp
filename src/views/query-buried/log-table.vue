<template>
    <div class="table">
        <el-table :data="list" border stripe style="width: 100%" @selection-change="handleMultiSelect">
            <el-table-column type="selection" width="39"> </el-table-column>
            <el-table-column prop="appName" label="埋点应用"></el-table-column>
            <el-table-column prop="eventId" label="EventId"></el-table-column>
            <el-table-column prop="eventType" label="事件类型" width="100">
                <template v-slot="scope">
                    <el-tag v-if="scope.row.eventType === 'biz'" type="success">业务埋点</el-tag>
                    <el-tag v-else-if="scope.row.eventType === 'perf'">性能埋点</el-tag>
                    <el-tag v-else type="danger">未知</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="" label="描述">
                <template slot-scope="scope">
                    <el-popover trigger="click" placement="top">
                        <p v-html="scope.row.description"></p>
                        <div slot="reference" class="name-wrapper">
                            <el-image
                                v-if="scope.row.descriptionThumbnailUrl"
                                :src="scope.row.descriptionThumbnailUrl"
                            ></el-image>
                            <p v-if="!scope.row.descriptionThumbnailUrl && scope.row.description">
                                {{ scope.row.description }}
                            </p>
                        </div>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column prop="version" label="版本号" width="80"></el-table-column>
            <el-table-column label="开发者">
                <template v-slot="scope">
                    <div>{{ scope.row.developer?.split("@")[0] }}</div>
                </template>
            </el-table-column>
            <el-table-column label="提交者">
                <template v-slot="scope">
                    <div>{{ scope.row.operator?.split("@")[0] }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="tag" label="标签"></el-table-column>
            <el-table-column label="备注" width="105">
                <template v-slot="scope">
                    <el-button
                        @click="$emit('remark-attr', scope.row)"
                        size="mini"
                        type="success"
                        v-if="scope.row.remark === 1"
                        >查看备注</el-button
                    >
                    <el-button @click="$emit('remark-attr', scope.row)" size="mini" type="primary" v-else
                        >新增备注</el-button
                    >
                </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
                <template v-slot="scope">
                    <el-tag v-if="scope.row.status === 0" type="warning">待发布</el-tag>
                    <el-tag v-else-if="scope.row.status === 1" type="success">已发布</el-tag>
                    <el-tag v-else-if="scope.row.status === 2" type="danger">已禁用</el-tag>
                    <el-tag v-else-if="scope.row.status === 3" type="info">待开发</el-tag>
                    <el-tag v-else-if="scope.row.status === 4" type="success">自动录入中</el-tag>
                    <el-tag v-else type="info">未知</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="240">
                <template v-slot="scope">
                    <el-button-group style="margin-bottom: 10px">
                        <el-button @click="$emit('view-attr', scope.row)" type="success" size="mini"
                            >查看属性</el-button
                        >
                        <el-button :disabled="scope.row.status === 4" @click="$emit('edit-attr', scope.row)" type="primary" size="mini"
                            >编辑</el-button
                        >
                        <el-button :disabled="scope.row.status === 4" @click="$emit('edit-group-attr', scope.row)" type="primary" size="mini"
                            >编辑同组</el-button
                        >
                    </el-button-group>
                    <el-button-group>
                        <el-button
                            v-if="scope.row.status === 3"
                            @click="$emit('dev-complete', scope.row)"
                            type="warning"
                            size="mini"
                            >开发完成</el-button
                        >
                        <el-button
                            v-if="scope.row.status === 0 || scope.row.status === 1"
                            @click="$emit('publish-attr', scope.row)"
                            type="warning"
                            size="mini"
                            >发布</el-button
                        >
                        <el-button
                            v-if="scope.row.status === 1"
                            @click="$emit('disable-attr', scope.row)"
                            type="warning"
                            size="mini"
                            >禁用属性</el-button
                        >
                        <el-popconfirm
                            v-if="scope.row.status === 0 || scope.row.status === 3"
                            @confirm="$emit('delete-attr', scope.row)"
                            title="确定要删除吗?"
                        >
                            <el-button slot="reference" type="danger" size="mini">删除</el-button>
                        </el-popconfirm>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
const props = defineProps({
    list: {
        type: Array,
        default: () => [],
    },
});

const emits = defineEmits([
    "view-attr",
    "view-chart",
    "edit-attr",
    "edit-group-attr",
    "disable-attr",
    "remark-attr",
    "dev-complete",
    "publish-attr",
    "delete-attr",
    "multi-select",
]);

const handleMultiSelect = param => {
    const idList = param.map(item => item.id);
    emits("multi-select", idList);
};
</script>

<style lang="scss" scoped>
.table {
    width: 100%;
}
</style>
