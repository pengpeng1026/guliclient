<template>
  <div>
    <el-card>
      <el-table :data="skuList" style="width: 100%;margin:10px auto auto 10px" border>
        <el-table-column type="index" align="center" label="序号" width="80">
        </el-table-column>
        <el-table-column prop="skuName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="skuDesc" label="描述" width="width">
        </el-table-column>
        <el-table-column prop="" label="默认图片" width="150">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" alt="" style="width:100px">
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)" width="width">
        </el-table-column>
        <el-table-column prop="price" label="价格(元)" width="80">
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="">
          <template>
            <HintButton
              title="上架"
              size="mini"
              type="info"
              icon="el-icon-top"
            />
            <HintButton
              title="下架"
              size="mini"
              type="success"
              icon="el-icon-bottom"
            />
            <HintButton
              title="修改"
              size="mini"
              type="warning"
              icon="el-icon-edit"
            />
            <HintButton
              title="详细信息"
              size="mini"
              type="info"
              icon="el-icon-info"
            />
            <HintButton
              title="删除"
              size="mini"
              type="danger"
              icon="el-icon-delete"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 15]"
        :pager-count="7"
        :page-size="limit"
        layout="prev, pager, next, jumpe, -> ,sizes,total"
        :total="total">
      </el-pagination> -->
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data(){
    return{
      page:1,
      limit:5,
      total:0,
      skuList:[]
    }
  },
  mounted(){
    this.getList()
    // this.$API.sku.getList (page, limit)
  },
  methods:{
    async getList(){
      try {
        const result = await this.$API.sku.getList(this.page, this.limit)
        if(result.code === 200 || result.code === 20000){
          this.total = result.data.total
          this.skuList = result.data.records
        }
      } catch (error) {
        this.$message.error('请求获取sku列表失败')
      }
    },
    // 关于分页器
    handleSizeChange(){
      console.log(11);
    },
    handleCurrentChange(){
      console.log(11);
    }
  }
};
</script>

<style lang="scss" scoped></style>
