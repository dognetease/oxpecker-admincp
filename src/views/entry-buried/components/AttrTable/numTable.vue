<script setup>
defineProps(["tableData"]);
</script>

<template>
    <div class="wrapper">
        <el-table :data="tableData" border size="small">
            <el-table-column prop="name" label="属性名"></el-table-column>
            <el-table-column prop="nameDesc" label="属性名描述"></el-table-column>
            <el-table-column prop="min" label="属性值"></el-table-column>
            <el-table-column prop="max" label="属性值描述"></el-table-column>
            <el-table-column prop="unit" label="单位"></el-table-column>
        </el-table>
    </div>
</template>
