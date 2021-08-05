<template>
  <div>
    <el-button type="primary" icon="el-icon-plus">添加</el-button>
    <!-- 表格项注意事项：
    element-ui表格项每一列是一项，一个表格是由一个el-table和多个el-table-column组成，
    label表示没一列的表头的文字，如果是排序的表头可以写type=index会自动排好序 -->

    <!-- 表格中的数据是依赖data中的数据，而这个数据必须是一个数组，然后给没一列都分一份，交给每一列来展示对应的数据，说白了是v-for遍历数据
    每一列需要展示的数据由prop属性来确定，每一列只负责展示，如果展示的数据需要特定的结构的话，需要用到作用域插槽 -->
    <el-table :data="trademarkList" border style="width: 100%;margin:20px 0">
      <el-table-column align="center" label="序号" type="index" width="80">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width:80px;height:60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="">
        <template slot-scope="{ row, $index }">
          <el-button type="warning" size="mini" icon="el-icon-edit"
            >修改</el-button
          >
          <el-button type="danger" size="mini" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器
    
      @size-change="handleSizeChange"
       -->
    <el-pagination style="text-align:center"
      :current-page=page
      :page-sizes="[3, 5, 10]"
      :page-size="3"
      :pager-count="7"
      layout="prev,pager,next, jumper,  ->, sizes,total"
      :total=total
      @current-change="getTrademarkList"
      @size-change="handleSizeChange">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  // 初始化动态数据，如果没有数据需要我们准备数据
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: []
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page
      const result = await this.$API.trademark.getTrademarkList(
        this.page,
        this.limit
      );
      if (result.code === 20000 || result.code === 200) {
        // console.log(result);
        this.total = result.data.total;
        this.trademarkList = result.data.records;
      }
    },
    handleSizeChange(size){
      this.limit = size
      this.getTrademarkList()
    }
  }
};
</script>

<style lang="scss" scoped></style>
