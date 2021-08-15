<template>
  <div>
    <!-- el-card会给标签元素加上阴影的效果 -->
    <el-card style="margin-bottom:20px">
      <!-- inline="true"设置行内表单，也就是在一行显示 -->
      <CategoryList @changCategory="changCategory" :isShowList='isShowList'/>
    </el-card>

    <el-card>
      <!-- 展示列表的div -->
      <div v-show="isShowList">
        <!-- 只有当存在三级ID的时候这个按钮才可以操作 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddUpdata"
          >添加属性</el-button
        >
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                size="mini"
                icon="el-icon-edit"
                title="修改"
                @click="showUpdataDiv(row)"
              ></HintButton>
              <el-popconfirm
                :title="`确定删除${row.attrName}吗？`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  title="删除"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加和修改的div -->
      <div v-show="!isShowList">
        <!-- 发送请求前收集所需要的数据 -->
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input
              v-model="attrForm.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <!-- 当点击添加属性值的时候应该加一条数据，让用户有输入框可以输入，这里我们使用占位的思想 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrForm.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
        <el-table
          border
          style="width: 100%;margin:20px 0"
          :data="attrForm.attrValueList"
        >
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
                size="mini"
              ></el-input>
              <span
                style="display:block;width:100%"
                v-else
                @click="toEdit(row, $index)"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <!-- 这里删除属性值得时候是不用发送请求的，当点击保存的时候才需要发送请求 -->
              <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm="attrForm.attrValueList.splice($index, 1)">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 点击保存的时候发送请求，同时需要注意的是，删除空的属性，并且去掉isEdit属性，因为这个发送请求的时候不需要 -->
        <el-button
          type="primary"
          :disabled="attrForm.attrValueList.length === 0"
          @click="addOrupdataAttr"
          >保存</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,
      attrForm: {
        attrName: "",
        attrValueList: [
          // 一开始这里应该是一个空的数组
          // {
          //   attrId: 0,
          //   id: 0,
          //   valueName: ""
          // }
        ],
        categoryId: 0, //这里应该收集的是第三级的ID，但是此时我们无法从data里面获取到，后续再想办法收集
        categoryLevel: 3 //这里固定的是3级level
        // id: 0 //添加的时候是没有ID的
      }
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
        this.attrList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        // 只有当传递过来了3ID才会发送请求
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    // 获取属性列表的函数
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      try {
        const result = await this.$API.attr.attrInfoList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200 || result.code === 20000) {
          this.attrList = result.data;
        }
      } catch (error) {
        this.$message.warning("请求平台属性失败");
      }
    },
    // 添加属性值并收集的函数
    showAddUpdata() {
      this.isShowList = false;
      // 当添加属性值得时候如果点击取消的话应该先清空，所以我们在这里点进来的时候先清空之前的数据
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id, //恰好这里可以获取到第三级列表的ID
        categoryLevel: 3
        // id: 0 //添加的时候是没有ID的
      };
    },
    // 添加属性值的函数
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.category3Id, //属性值得ID，因为添加和修改所对应的同一套操作，如果是添加的话没有ID这里会是undefined
        // id: 0,这里是添加所以不用ID
        valueName: "",
        isEdit: true // 通过push方式添加的属性，是有响应式的
      });
      //
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    // 点击修改的函数
    showUpdataDiv(row) {
      this.isShowList = false;
      // attrForm对象里面包含数组，所以如果是浅拷贝的话不适合，这里我们用lodash里面的深拷贝的函数
      // this.attrForm = {...row}
      this.attrForm = cloneDeep(row);
      /* vue中给对象的初始化数据也就是data中的对象的每个属性都通过数据劫持添加了get和set方法，使其可以实现响应式，数组是通过重写一系列
      方法（七个）来实现响应式，而如果我们data中的对象通过点语法来添加属性的话是无法实现响应式的，这时候需要使用Vue的set方法或者
      VM的$set方法来实现响应式 */
      // 这里我们遍历row.attrValueList给每个对象添加一个isEdit属性，值一开始为false（因为是修改的话一打开是查看模式）
      this.attrForm.attrValueList.forEach(item => {
        this.$set(item, "isEdit", false); //这样就实现了响应式
      });
    },
    // 点击修改的属性值，变成编辑模式
    toEdit(row, index) {
      row.isEdit = true;
      // 只有当编辑模式的时候，才需要自动获取焦点，这里我们使用.focus这个API
      // 并且我们需要得到对应的input输入框，由于这个输入框是通过v-for遍历得到的，因此使用ref的时候必须动态绑定，这时候就用到$index了
      // 这里会报错，原因是当你切换为编辑模式时，页面需要重新渲染一个input标签，而我们的代码是加载很快的，所以这里用nextick()
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 变成查看模式
    toLook(row) {
      // 变成查看模式之前我们先得判断一下，当输入的值为空，我们要return，当输入的值已经存在，我们需要提示，并且return
      if (row.valueName.trim() === "") {
        // 当输入空格或者没有输入我们要清空并且return
        row.valueName = "";
        return;
      }
      let isRepeat = this.attrForm.attrValueList.some(item => {
        if (item !== row) {
          return item.valueName === row.valueName;
        }
      });
      if (isRepeat) {
        // 如果输入的也相同的话我们提示并且return
        this.$message.info("输入的属性值不能相同哦");
        return;
      }
      row.isEdit = false;
    },
    // 点击保存发送请求
    async addOrupdataAttr() {
      // 需要的参数
      // {
      //   "attrName": "string",
      //   "attrValueList": [
      //     {
      //       "attrId": 0,
      //       "id": 0,
      //       "valueName": "string"
      //     }
      //   ],
      //   "categoryId": 0,
      //   "categoryLevel": 0,
      //   "id": 0
      // }
      // 排除attrValueName为空的对象以及将对象的isEdit属性删除掉
      // let attrForm = this.attrForm
      let lastAttrForm = this.attrForm.attrValueList.filter(item => {
        if (item.valueName === "") {
          return false;
        } else {
          delete item.isEdit;
          return true;
        }
      });
      this.attrForm.attrValueList = lastAttrForm;
      // 点击保存发送请求，然后回到第一页，并且重新发送请求获取属性列表
      try {
        const result = await this.$API.attr.addOrupdataAttr(this.attrForm);
        if (result.code === 200 || result.code === 20000) {
          this.isShowList = true;
          this.getAttrList();
        } else {
          this.$message.info("保存失败");
        }
      } catch (error) {
        this.$message.error("请求失败");
      }
    },
    // 点击列表展示页的删除，删除一项属性
    async deleteAttr(row) {
      try {
        const result = await this.$API.attr.deleteAttr(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除成功");
          this.getAttrList();
        } else {
          this.$message.info("删除失败");
        }
      } catch (error) {
        this.$message.error("请求失败");
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
