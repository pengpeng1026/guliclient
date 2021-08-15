<template>
  <div>
    <el-card style="margin-bottom:20px">
      <CategoryList @changCategory="changCategory" :isShowList="isShowList" />
    </el-card>
    <el-card>
      <!-- spu列表展示模板,只有当这两个数据都为真时才显示-->
      <div v-show="!isShowAddSku && !isShowAddUpdateSpu">
        <el-button type="primary" icon="el-icon-plus" @click="showAddUpdate"
          >添加SPU</el-button
        >
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="success"
                size="mini"
                icon="el-icon-plus"
                title="添加sku"
                style="margin-right:10px"
                @click="toSkuForm(row)"
              />
              <HintButton
                type="warning"
                size="mini"
                icon="el-icon-edit"
                title="修改spu"
                style="margin-right:10px"
                @click="toAddUpdate(row)"
              />
              <HintButton
                type="info"
                size="mini"
                icon="el-icon-info"
                title="查看spu的sku列表"
                style="margin-right:10px"
                @click="showSkuList(row)"
              />
              <HintButton
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除SPU"
                style="margin-right:10px"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="text-align:center"
          :current-page="page"
          :page-sizes="[2, 3, 5]"
          :page-size="limit"
          :pager-count="7"
          layout="prev, pager, next, jumper, -> ,sizes,total"
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- 这里避免card里面全是div，我们使用两个组件 -->
      <AddUpdateSpu
        :isShowAddUpdateSpu="isShowAddUpdateSpu"
        @toList="toList"
        @saveUpdate="saveUpdate"
        ref="addUpdateSpu"
      />
      <AddSku
        :isShowAddSku="isShowAddSku"
        :isShowAddSku.sync="isShowAddSku"
        ref="addSku"
      />
    </el-card>
    <el-dialog :title="`${spu.spuName}的sku列表`" :visible.sync="dialogTableVisible" :before-close="skuClose">
      <el-table :data="skuList" v-loading="loading">
        <el-table-column
          property="skuName"
          label="名称"
          width="150"
        ></el-table-column>
        <el-table-column
          property="price"
          label="价格"
          width="200"
        ></el-table-column>
        <el-table-column
          property="weight"
          label="重量"
          width="200"
        ></el-table-column>
        <el-table-column property="" label="默认图片" width="200">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" alt="" style="width:100px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import AddSku from "./AddSku";
import AddUpdateSpu from "./AddUpdateSpu";
export default {
  name: "Spu",
  components: {
    AddSku,
    AddUpdateSpu
  },
  data() {
    return {
      // 获取spu的分页列表数据
      page: 1,
      limit: 2,
      total: 0,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      isShowList: true,
      categoryList1: [],
      categoryList2: [],
      categoryList3: [],
      spuList: [],
      spu:{},

      // 设计两个数据，来决定spuList，AddSku,AddUpdateSpu的显示与隐藏
      isShowAddSku: false,
      isShowAddUpdateSpu: false,

      dialogTableVisible: false,
      skuList: [],
      loading:false
    };
  },
  methods: {
    // 当三级分类有改变的时候会传递ID实现父子通信的自定义事件
    changCategory({ categoryId, level }) {
      // console.log(categoryId,level);
      // 当子组件选中三级分类的时候，会分别传递过来ID，只有选中了第三级的时候才会发送请求平台属性列表数据，
      // 并且当重新选择了1级的时候要清空2级和3级的分类ID，以及清空属性列表
      if (level === 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.spuList = [];
        this.category2Id = categoryId;
      } else {
        // 只有当传递过来了3ID才会发送请求
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    async getSpuList(pager = 1) {
      this.page = pager;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200 || result.code === 20000) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    // 关于分页器
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
    handleCurrentChange(pager) {
      this.getSpuList(pager);
    },
    // 点击添加SPU按钮，显示添加和修改的页面
    showAddUpdate() {
      this.isShowAddUpdateSpu = true;
    },
    // 使用自定义事件，当点击取消的时候改变父组件的isShowAddUpdateSpu的值
    toList() {
      this.isShowAddUpdateSpu = false;
    },
    // 点击修改spu的函数
    toAddUpdate(row) {
      this.isShowAddUpdateSpu = true;
      this.$refs.addUpdateSpu.addUpdateSpu(row, this.category3Id);
    },
    saveUpdate(spuId) {
      if (spuId) {
        // 有ID则证明是修改回来的
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
    },
    // 点击添加sku按钮
    toSkuForm(row) {
      this.isShowAddSku = true;
      this.$refs.addSku.getAddSkuInitData(
        row,
        this.category1Id,
        this.category2Id
      );
    },
    // 点击查看spu对应的所有sku列表
    async showSkuList(row) {
      this.loading = true
      this.spu = row
      this.dialogTableVisible = true;
      try {
        const result = await this.$API.sku.getListBySpuId(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.skuList = result.data;
        }
      } catch (error) {
        this.$message.error("获取sku列表失败");
      }
      this.loading = false
    },
    // 弹框关闭之前的回调
    skuClose(done){
      this.skuList = []
      this.loading = false
      this.dialogTableVisible = false
    }
  }
};
</script>

<style lang="scss" scoped></style>
