<template>
  <el-form label-width="100px" v-show="isShowAddUpdateSpu" :model="spuInfo">
    <el-form-item label="SPU名称">
      <el-input
        placeholder="SPU名称"
        v-model="spuInfo.spuName"
      ></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <!-- select当中的option的value是什么，要看select后期需要收集什么数据 -->
      <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
        <el-option
          :label="tm.tmName"
          :value="tm.id"
          v-for="tm in trademarkList"
          :key="tm.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        rows="4"
        placeholder="SPU描述"
        v-model="spuInfo.description"
      ></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <!-- 照片墙 -->
      <!-- 这里展示后发现可以展示坑位但是展示不出图片，查询官网得知，需要name和url属性 -->
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :file-list="spuImageList"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleUpSucess"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select
        v-model="saleAttrIdName"
        :placeholder="
          unSelectSaleAttrList.length > 0
            ? `还有${unSelectSaleAttrList.length}未选择`
            : '没有啦啦啦啦'
        "
      >
        <el-option
          :label="unSelectSaleAttr.name"
          :value="`${unSelectSaleAttr.id}:${unSelectSaleAttr.name}`"
          v-for="unSelectSaleAttr in unSelectSaleAttrList"
          :key="unSelectSaleAttr.id"
        ></el-option>
      </el-select>
      <el-button
        type="primary"
        icon="el-icon-plus"
        :disabled="!saleAttrIdName"
        @click="addSaleAttr"
        >添加销售属性</el-button
      >
      <el-table
        border
        style="width: 100%"
        :data="spuInfo.spuSaleAttrList"
      >
        <el-table-column type="index" label="序号" align="center" width="80">
        </el-table-column>
        <el-table-column prop="saleAttrName" label="属性名" width="150">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称列表" width="width">
          <!-- 属性值名称列表 -->
          <template slot-scope="{ row, $index }">
            <el-tag
              v-for="(saleAttrValue, index) in row.spuSaleAttrValueList"
              :key="saleAttrValue.id"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
            >
              {{ saleAttrValue.saleAttrValueName }}
            </el-tag>
            <!-- 每个属性值列表中只有一个input和一个button -->
            <el-input
              v-model="saleAttrValueName"
              v-if="row.isEdit"
              class="input-new-tag"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(row, $index)"
              @blur="handleInputConfirm(row, $index)"
            >
            </el-input>

            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput(row)"
              >+添加</el-button
            >
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="150">
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" style="margin-rigth:20px" @click="save"
        >保存</el-button
      >
      <el-button @click="$emit('toList')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "AddUpdateSpu",
  props: ["isShowAddUpdateSpu"],
  data() {
    return {
      // tag的初始化数据
      dynamicTags: [],

      saleAttrIdName: "",
      saleAttrValueName: "", //销售属性值列表的input框输入的数据
      dialogImageUrl: "",
      dialogVisible: false,
      
      spuInfo: {
        category3Id: 0,
        description: "",
        spuImageList: [
          // {
          //   "id": 0,
          //   "imgName": "string",
          //   "imgUrl": "string",
          //   "spuId": 0
          // }
        ],
        spuName: "",
        spuSaleAttrList: [
          // {
          //   "baseSaleAttrId": 0,
          //   "id": 0,
          //   "saleAttrName": "string",
          //   "spuId": 0,
          //   "spuSaleAttrValueList": [
          //     {
          //       "baseSaleAttrId": 0,
          //       "id": 0,
          //       "isChecked": "string",
          //       "saleAttrName": "string",
          //       "saleAttrValueName": "string",
          //       "spuId": 0
          //     }
          //   ]
          // }
        ],
        tmId: 0
      },
      trademarkList: [], //所有的品牌列表
      baseSaleAttrList: [], //所有的销售属性列表
      spuImageList: [], //spu图片列表
    };
  },
  methods: {
    // 图片上传成功的函数，这里我们需要收集数据,此处我们收集到外边，后续发送请求之前还要先整理一下数据
    handleUpSucess(response, file,fileList){
      // console.log(response, file,fileList);
      this.spuImageList = fileList
    },
    // 删除照片墙图片的函数
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.spuImageList = fileList
    },
    // 照片墙图片预览的函数
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 当点击修改时会调用子组件的方法
    async addUpdateSpu(row,category3Id) {
      // 保存传递过来的category3Id
      this.spuInfo.category3Id = category3Id
      // console.log(111);
      // 根据页面，点击修改的时候这里会发送四个请求，
      // http://localhost:9529/dev-api/admin/product/baseSaleAttrList
      // 获取所有的销售属性列表
      const result1 = await this.$API.spu.getSaleAttrList();
      if (result1.code === 200 || result1.code === 20000) {
        this.baseSaleAttrList = result1.data;
      }
      // http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList
      // 获取所有的品牌列表
      const result2 = await this.$API.trademark.getList();
      if (result2.code === 200 || result2.code === 20000) {
        this.trademarkList = result2.data;
      }
      // http://localhost:9529/dev-api/admin/product/spuImageList/2298
      // 根据ID获取spu图片列表
      const result3 = await this.$API.sku.getSpuImageList(row.id);
      if (result3.code === 200 || result3.code === 20000) {
        // 这里需要先整理下数据
        let spuImageList = result3.data;
        spuImageList.forEach(item => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageList;
      }
      // http://localhost:9529/dev-api/admin/product/getSpuById/2298
      // 根据ID获取spu的详细信息
      const result4 = await this.$API.spu.get(row.id);
      if (result4.code === 200 || result4.data === 20000) {
        this.spuInfo = result4.data;
      }
    },
    // 当点击添加时会调用子组件的方法
    addSpu() {},

    // 以下是tag的方法
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    // 点击添加属性值，按钮变成input
    showInput(row) {
      this.$set(row, "isEdit", true);
      this.$nextTick(() => {
        // 自动获取焦点
        this.$refs.saveTagInput.focus();
      });
    },
    // input框失去焦点，获取点击enter变成按钮
    // 同时需要收集这些数据
    //           "baseSaleAttrId": 0,
    //           "saleAttrValueName": "string",
    //         }
    handleInputConfirm(row, index) {
      row.isEdit = false;
      // let {baseSaleAttrId,saleAttrValueName} = row
      let baseSaleAttrId = row.baseSaleAttrId;
      let saleAttrValueName = this.saleAttrValueName;
      let obj = { baseSaleAttrId, saleAttrValueName };
      // 判断数据的合法性
      if (obj.saleAttrValueName.trim() === "") {
        return;
      }
      let isRepeat = row.spuSaleAttrValueList.forEach(item => {
        return item.saleAttrValueName === this.saleAttrValueName;
      });
      if (isRepeat) {
        this.$message.info("销售属性值有重复哦");
        this.saleAttrValueName = "";
      }
      row.spuSaleAttrValueList.push(obj);
      // 4、把input里面内容清除
      this.saleAttrValueName = "";
      // 5、让input变为button
      row.isEdit = false;
    },
    // 点击添加销售属性
    addSaleAttr() {
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId: this.saleAttrIdName.split(":")[0],
        saleAttrName: this.saleAttrIdName.split(":")[1],
        spuSaleAttrValueList: []
      });
      // 添加完之后清空选择框里面的数据
      this.saleAttrIdName = "";
    },
    // 保存收集的数据发送请求
    // 发送请求前先整理数据，去除没用的属性以及我们添加的属性
    async save() {
      // category3Id需要从父组件中传递传递过来,已经接受并保存
      this.spuInfo.spuImageList = this.spuImageList.map(item => {
        return {
          imgName:item.name,
          imgUrl:item.url||item.response.data
        }
      })
      this.spuInfo.spuSaleAttrList.forEach(item => {
        delete item.isEdit
        delete item.saleAttrValueName
      })
      try {
        const result = await this.$API.spu.addUpdate(this.spuInfo)
        if(result.code === 200 || result.code === 20000){
          this.$message.success('保存成功')
          // 保存成功后返回首页,这里需要注意的是如果是添加则没有ID那么要返回到第一页，修改的话有ID要返回到添加的页面
          // 并且由于这里不是路由组件，父组件原本就存在，无法根据是否渲染而重新请求数据展示页面，所有这里我们传递一个标识回去
          // 这个标识是ID，如果有ID则表示是从修改页面回去的
          this.$emit('saveUpdate',this.spuInfo.id)
          this.$emit('toList')
          // 并且需要清空修改页面的数据，防止下次点进来后还有数据展示在页面，这里我们使用一个方法
          this.reset()
        }
      } catch (error) {
        this.$message.error('请求失败')
      }
    },
    // 重置页面
    reset(){
      Object.assign(this._data,this.$options.data())
    }
  },
  computed: {
    // 商品的销售属性，会从所有的销售属性中选择一部分，从spuInfo中可以获取这个商品的目前的销售属性
    // 然后从baseSaleAttrList中可以获取全部的销售属性,因此选择框里面的需要用到计算属性
    unSelectSaleAttrList() {
      return this.baseSaleAttrList.filter(item => {
        return this.spuInfo.spuSaleAttrList.every(item1 => {
          return item.name !== item1.saleAttrName;
        });
      });
    }
  }
};
</script>

<style lang="less" scoped></style>
<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
