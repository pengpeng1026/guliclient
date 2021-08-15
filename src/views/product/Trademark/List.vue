<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form style="width:80%" :model="tmForm" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 用户头像上传的组件 -->
          <!-- 这里action的路径需要指向 dev-api/admin/product/fileUpload，这样我们的代理则会自动帮我们转发请求-->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg文件，且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdataTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
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
          <!-- 这里的row是拿到的每一个对象 -->
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-edit"
            @click="showUpdataDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器
    
      @size-change="handleSizeChange"
       -->
    <el-pagination
      style="text-align:center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="3"
      :pager-count="7"
      layout="prev,pager,next, jumper,  ->, sizes,total"
      :total="total"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  // 初始化动态数据，如果没有数据需要我们准备数据
  data() {
    var tmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 15) {
        callback(new Error("长度在 2 到 12 个字符"));
      } else {
        // 如果验证通过，直接来一个空的回调代表验证没问题
        callback();
      }
    };
    return {
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],
      dialogFormVisible: false,
      imageUrl: "",
      tmForm: {
        tmName: "",
        logoUrl: ""
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
          // 也可以自定义校验规则
          { validator: tmName, trigger: "blur" }
        ],
        // 注意这里的验证规则，必须得跟你在表单里面收集的的变量名保持一致
        logoUrl: [{ required: true, message: "请上传品牌图片" }]
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    // 请求品牌列表的函数
    async getTrademarkList(page = 1) {
      this.page = page;
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
    // 每页展示的数量的改变的函数
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    // 展示dialog的函数
    showAddDialog() {
      this.dialogFormVisible = true;
      this.tmForm = {
        // 这里是为了处理当天机品牌中间点击了取消，然后又点击添加后之前的信息任然存在的bug
        tmName: "",
        logoUrl: ""
      };
    },
    // 头像上传成功的回调函数
    handleAvatarSuccess(res, file) {
      // this.imgUrl = URL.createObjectURL(file.raw);
      // 打印出blob:http://localhost:9528/4c435b14-c282-439f-b53a-32e0b986e49d
      // console.log(this.imgUrl);
      // 上面的方式拿到的是本地的图片路径，我们不需要本地的，而是上传成功后服务器返回给我们的真实的路径
      // console.log(res,file);
      this.tmForm.logoUrl = res.data || file.response.data;
      console.log(res);
    },
    // 头像上传之前的回调函数
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 修改品牌的函数
    showUpdataDialog(row) {
      this.dialogFormVisible = true;
      // 如果直接将row赋值给tmform,那么在收集表单数据过程中，当你修改数据但是没有提交，也会对页面进行更改
      // 我们希望的是只有在点击确认之后才会提交修改，因此这里要用到浅拷贝
      // this.tmForm = row
      this.tmForm = { ...row };
      // 注意只有当点击dialog的确定按钮才会发送请求，
      // this.$API.trademark.updataTrademark(this.tmForm)
    },
    // 点击确定按钮才会发送请求添加或者删除
    addOrUpdataTrademark() {
      console.log(this.$refs.tmForm);
      this.$refs.tmForm.validate(async valid => {
        // console.log(valid, "id", this.tmForm);
        if (valid) {
          // 如果整体验证成功才会做后面的操作
          let trademark = this.tmForm;
          try {
            const result = await this.$API.trademark.addOrUpdata(trademark);
            if (result.code === 200 || result.code === 20000) {
              this.$message.success(trademark.id ? "修改成功" : "添加成功");
              // 关闭dialog并回到首页
              this.dialogFormVisible = false;
              this.getTrademarkList(trademark.id ? this.page : 1);
            } else {
              this.$message.info(
                trademark.id ? "修改出问题了" : "添加出问题了"
              );
            }
          } catch (error) {
            this.$message.error(trademark.id ? "修改失败" : "添加失败");
          }
        } else {
          // 如果验证失败
          this.$message.error("请按照提示输入哦");
          return false;
        }
      });
    },
    // 删除品牌
    deleteTrademark(row) {
      this.$confirm(`确定要删除${this.tmForm.tmName}吗`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
      // 点击确定时就会进入.then的回调
        .then(async () => {
          const result = await this.$API.trademark.delete(row.id)
          if(result.code === 200 || result.code === 20000){
            this.$message.success('删除成功');
            this.getTrademarkList(this.trademarkList.length > 1 ? this.page : this.page - 1)
          }
        })
        // 点击取消时就会进入.catch的回调
        .catch(() => {
          this.$message.info('取消删除');
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
// 注意头像这里的style标签不能加scope
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
