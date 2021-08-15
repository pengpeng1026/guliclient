<template>
  <el-form v-show="isShowAddSku" label-width="100px" :model="skuInfo">
    <el-form-item label="SPU名称">
      {{ spu.spuName }}
    </el-form-item>
    <el-form-item label="SKU名称">
      <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
    </el-form-item>
    <el-form-item label="价格(元)">
      <el-input
        placeholder="价格(元)"
        type="number"
        v-model="skuInfo.price"
      ></el-input>
    </el-form-item>
    <el-form-item label="重量(千克)">
      <el-input
        placeholder="重量(千克)"
        type="number"
        v-model="skuInfo.weight"
      ></el-input>
    </el-form-item>
    <el-form-item label="规格描述">
      <el-input
        placeholder="规格描述"
        type="textarea"
        rows="4"
        v-model="skuInfo.skuDesc"
      ></el-input>
    </el-form-item>
    <el-form-item label="平台属性">
      <!-- 将属性ID和选中的属性值ID暂时挂到属性这一栏上面 -->
      <el-form :inline="true" label-width="80px">
        <el-form-item
          :label="attr.attrName"
          :value="attr.id"
          v-for="attr in attrList"
          :key="attr.id"
        >
          <el-select v-model="attr.attrIdValueId" placeholder="请选择">
            <el-option
              :label="attrValue.valueName"
              :value="`${attr.id}:${attrValue.id}`"
              v-for="attrValue in attr.attrValueList"
              :key="attrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form :inline="true" label-width="80px">
        <el-form-item
          :label="saleAttr.saleAttrName"
          :value="saleAttr.id"
          v-for="saleAttr in saleAttrValueList"
          :key="saleAttr.id"
        >
          <el-select v-model="saleAttr.attrIdSaleValueId" placeholder="请选择">
            <el-option
              :label="saleAttrValue.saleAttrValueName"
              :value="`${saleAttr.id}:${saleAttrValue.id}`"
              v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
              :key="saleAttrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table
        style="width: 100%"
        border
        :data="spuImageList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center">
        </el-table-column>

        <el-table-column prop="" label="图片" width="width">
          <template slot-scope="{ row, $index }">
            <img :src="row.imgUrl" alt="" style="width:100px" />
          </template>
        </el-table-column>
        <el-table-column prop="imgName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="width">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.isDefault === '0'"
              type="primary"
              size="mini"
              @click="changeDefault(row)"
              >设为默认</el-button
            >
            <el-tag v-else type="success">默认</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="$emit('update:isShowAddSku', false)">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "AddSku",
  props: ["isShowAddSku"],
  // 添加sku时，需要收集的数据要看发送请求时需要用到的数据，因此这里的el-form收集的数据可以通过接口文档中获取
  data() {
    return {
      spu: {},
      attrList: [],
      saleAttrValueList: [],
      spuImageList: [],
      // attrIdValueId:'', //收集平台属性的数据，这里需要的是两个ID，我们先拼接
      skuInfo: {
        category3Id: 0,
        spuId: 0,
        // createTime: "2021-08-11T10:11:38.625Z",时间不要，这个是后台会生成的
        // id: 0,ID添加的时候不需要
        // isSale: 0,
        price: "",
        weight: "",
        skuName: "",
        skuDesc: "",
        // 平台属性值列表
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   valueId: 0,
          // }
        ],
        skuDefaultImg: "",
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0
          // }
        ],
        // 销售属性值列表
        skuSaleAttrValueList: [
          // {
          //   saleAttrId: 0,
          //   saleAttrValueId: 0,
          // }
        ],
        tmId: 0
      }
    };
  },
  methods: {
    // 获取初始化数据
    async getAddSkuInitData(spu, category1Id, category2Id) {
      this.spu = spu;
      // console.log(spu);
      // console.log(111);

      // 这里我们使用promsie.all
      // sku添加页面加载的时候需要发送三条请求
      // http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      // 获取平台属性列表
      let promise1 = this.$API.attr.attrInfoList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      // http://localhost:9529/dev-api/admin/product/spuSaleAttrList/3
      // 获取spu的销售属性列表
      let promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      // http://localhost:9529/dev-api/admin/product/spuImageList/3
      // 获取spu的图片列表
      let promise3 = this.$API.sku.getSpuImageList(spu.id);
      try {
        const result = await Promise.all([promise1, promise2, promise3]);
        this.attrList = result[0].data;
        this.saleAttrValueList = result[1].data;
        // 收集所有的图片之前先给每个图片添加一个isDefault属性
        result[2].data.forEach(item => (item.isDefault = "0"));
        this.spuImageList = result[2].data;
      } catch (error) {
        this.$message.error("请求初始化数据失败" + error.message);
      }
    },
    // 选中图片对应的函数
    handleSelectionChange(flieList) {
      // 点击选中的图片后赶紧收集
      this.skuInfo.skuImageList = flieList;
    },
    // 点击切换默认值
    changeDefault(row) {
      this.spuImageList.forEach(item => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl
    },
    // 保存
    async save() {
      // 整理数据
      this.skuInfo.category3Id = this.spu.category3Id;
      this.skuInfo.spuId = this.spu.id;
      this.skuInfo.tmId = this.spu.tmId
      this.skuInfo.skuImageList = this.skuInfo.skuImageList.map(item => {
        return {
          imgName:item.imgName,
          imgUrl:item.imgUrl,
          isDefault:item.isDefault,
          spuImgId:item.id
        }
      })
      // 整理平台属性列表数据
      let arr = []
      this.attrList.forEach(item => {
        // 如果有这个属性代表我们收集了
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = { attrId, valueId };
          arr.push(obj);
        }

      });
      this.skuInfo.skuAttrValueList = arr
      // 整理销售属性列表数据
      let arr1 = []
      this.saleAttrValueList.forEach(item => {
        if(item.attrIdSaleValueId){
          let [saleAttrId,saleAttrValueId] = item.attrIdSaleValueId.split(':')
          let obj = {saleAttrId,saleAttrValueId}
          arr1.push(obj)
        }
      })
      this.skuInfo.skuSaleAttrValueList = arr1
      // 发送请求
      try {
        const result = await this.$API.sku.addUpdate(this.skuInfo)
        // 成功做什么 返回到spu页面，并且清空sku的数据
        this.$message.success('保存成功')
        this.$emit('update:isShowAddSku',false)
        Object.assign(this._data,this.$options.data())
      } catch (error) {
        // 失败做什么
        this.$message.error('请求保存sku失败' + error.message)
      }
    }
  }
};
</script>

<style lang="less" scoped></style>
