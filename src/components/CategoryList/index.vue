<template>
  <!-- 后面还有别的地方同样用到这个三级联动表单，所以注册一个公共样式 -->
  <!-- 三级联动的可操作性，当切换到添加和修改页面的时候这里不能选择，而父组件的isShowList正好和这里是相反的
  让父组件传递给子组件，然后这里使用disabled -->
  <el-form :inline="true" class="demo-form-inline" :model="cForm" :disabled='!isShowList'>
    <el-form-item label="一级分类">
      <!--  -->
      <el-select placeholder="请选择" v-model="cForm.category1Id" @change="handleCategory1">
        <el-option :label="c1.name" :value="c1.id" v-for="c1 in categoryList1" :key="c1.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select placeholder="请选择" v-model="cForm.category2Id" @change="handleCategory2">
        <el-option :label="c2.name" :value="c2.id" v-for="c2 in categoryList2" :key="c2.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select placeholder="请选择" v-model="cForm.category3Id" @change="handleCategory3">
        <el-option :label="c3.name" :value="c3.id" v-for="c3 in categoryList3" :key="c3.id"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "CategoryList",
  props:['isShowList'],
  data() {
    return {
      categoryList1: [],
      categoryList2: [],
      categoryList3:[],
      cForm:{
        category1Id:'',
        category2Id:'',
        category3Id:''
      }
    };
  },
  mounted() {
    this.getCategoryList1();
  },
  methods: {
    async getCategoryList1() {
      const result = await this.$API.categorylist.getCategory1();
      if (result.code === 200 || result.code === 20000) {
        this.categoryList1 = result.data;
      }
    },
    // 当一级分类列表的表单项又改变时触发change事件，该事件默认的一个回调参数时收集到的数据，这里收集到的是ID
    async handleCategory1(category1Id){
      // 当重新选择分类的时候，需要清除原先存在的二级和三级中的数据
      this.categoryList2 = []
      this.categoryList3 = []
      this.cForm.category2Id = ''
      this.cForm.category3Id = ''
      const result = await this.$API.categorylist.getCategory2(category1Id)
      if(result.code === 200 || result.code === 20000){
        this.categoryList2 = result.data
      }
      // 选中三级分类列表的时候并且把ID传递给父组件,这里使用一个对象并且带一个level是为了让父组件收到的时候可以区分是谁传递来的
      this.$emit('changCategory',{categoryId:category1Id,level:1})
    },
    // 当二级分类列表的表单项又改变时触发change事件，该事件默认的一个回调参数是收集到的数据，这里收集到的是ID
    async handleCategory2(category2Id){
      this.categoryList3 = []
      this.cForm.category3Id = ''
      const result = await this.$API.categorylist.getCategory3(category2Id)
      if(result.code === 200 || result.code === 20000){
        this.categoryList3 = result.data
      }
      this.$emit('changCategory',{categoryId:category2Id,level:2})
    },
    handleCategory3(category3Id){
      this.$emit('changCategory',{categoryId:category3Id,level:3})
    }
  }
};
</script>

<style lang="less" scoped></style>
