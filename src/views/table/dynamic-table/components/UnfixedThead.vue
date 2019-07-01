<template>
<div class="form">
  <div>
    <el-input v-model="goodsList.title" placeholder="请输入内容" style="width: 200px;"></el-input>
    <template>
        <el-select v-model="goodsList.type" placeholder="请选择">
          <el-option label="商品ID" value="商品ID"></el-option>
          <el-option label="商品名" value="商品名"></el-option>
          <el-option label="分类" value="分类"></el-option>
        </el-select>
    </template>
    <el-button icon="el-icon-search" circle @click="selectGoods()"></el-button>
    <el-button id="addGoods"  type="primary" icon="el-icon-edit" circle @click="dialogFormVisible = true" ></el-button>
    <el-button  type="danger" icon="el-icon-delete" circle @click="dialogFormDelete = true"></el-button>
  </div>


  <el-table
    :data="tableData"
    style="width: 100%"
  >
    <el-table-column type="expand">
      <template slot-scope="props">
        <el-form label-position="left" inline class="demo-table-expand">
          <el-form-item label="商品名称">
            <span>{{ props.row.goods_name}}</span>
          </el-form-item>
<!--          <el-form-item label="所属店铺">-->
<!--            <span>{{ props.row.shop }}</span>-->
<!--          </el-form-item>-->
          <el-form-item label="商品 ID">
            <span>{{ props.row.goods_id }}</span>
          </el-form-item>
          <el-form-item label="创建时间">
            <span>{{ props.row.add_time }}</span>
          </el-form-item>
          <el-form-item label="商品分类">
            <span>{{ props.row.type }}</span>
          </el-form-item>
          <el-form-item label="商品价格">
            <span>{{ props.row.goods_price}}</span>
          </el-form-item>
          <el-form-item label="商品描述">
            <img :src="'http://localhost:8080'+props.row.goods_img">
          </el-form-item>
        </el-form>
      </template>



    </el-table-column>

    <el-table-column
      label="商品 ID"
      prop="goods_id">
    </el-table-column>
    <el-table-column
      label="商品名称"
      prop="goods_name">
    </el-table-column>
    <el-table-column
      label="分类"
      prop="type">
    </el-table-column>



    <el-dialog title="商品添加" :visible.sync="dialogFormVisible" :append-to-body="true">
      <el-form :model="form">
        <el-form-item label="商品名称" :label-width="formLabelWidth">
          <el-input v-model="form.goods_name" autocomplete="off" placeholder="商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" :label-width="formLabelWidth">
        <el-input v-model="form.goods_price" autocomplete="off" style="width: 200px" placeholder="商品价格"></el-input>
      </el-form-item>
        <el-form-item label="商品类型" :label-width="formLabelWidth">
          <el-select v-model="form.type" placeholder="请选择">
            <el-option label="食品" value="食品"></el-option>
            <el-option label="物品" value="物品"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="form.add_time"
              type="datetime"
              placeholder="选择日期时间"
            value-format="yyyy-M-dd-HH-mm-ss">
            </el-date-picker>
          </div>
        </el-form-item>

        <el-form-item label="商品描述" :label-width="formLabelWidth">
<!--          <el-upload-->
<!--            class="avatar-uploader"-->
<!--            action="http://localhost:8080/api/goods/insertGoods"-->
<!--            :auto-upload="false"-->
<!--            :on-change="change"-->
<!--            ref="upload"-->

<!--            :before-upload="beforeAvatarUpload">-->
<!--            <img v-if="imageUrl" :src="imageUrl" class="avatar">-->
<!--            <i v-else class="el-icon-plus avatar-uploader-icon"></i>-->
<!--          </el-upload>-->
          <el-upload
            action="http://localhost:8080/api/goods/insertGoods"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :auto-upload="false"

            name="goods_img"
            :on-change="change"
            :limit="1"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoods()">确 定</el-button>
      </div>
    </el-dialog>



    <el-dialog title="删除" :visible.sync="dialogFormDelete" :append-to-body="true">
      <el-form :model="deleteGoods">
        <el-form-item label="商品ID" :label-width="formLabelWidth">
          <el-input v-model="deleteGoods.goods_id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="商品名称" :label-width="formLabelWidth">
          <el-input v-model="deleteGoods.goods_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormDelete = false">取 消</el-button>
        <el-button type="primary" @click="deleteGoods_name()">确 定</el-button>
      </div>
    </el-dialog>



  </el-table>
  <div class="block">
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-size="10"
        layout="total, prev, pager, next"
        :total='total'
        :page.sync="goodsList.startPage">
      </el-pagination>
    </div>
  </div>


</div>

</template>

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

  .form{
    padding-top: 5px;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
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

<script>
  import {getGoods,addGoods,GoodslList,deleteGoods} from '@/api/goods'

  export default {
    component:{
      getGoods,
      addGoods,
      GoodslList,
      deleteGoods
    },
    data() {
      return {
        currentPage1:'',
        total:0,
        tableData: [],

        dialogFormVisible: false,
        dialogFormDelete:false,
        form: {
          goods_name: '',
          goods_price: '',
          add_time: '',
          type: [],
          goods_img: '',
        },
        formLabelWidth: '120px',

        goodsList:{
          type: [],
          title:'',
          startPage:1,
        },
        imageUrl: {},
        time: '',
        deleteGoods:{
          goods_id:'',
          goods_name:''
        },
        value:'',
        dialogImageUrl: '',
        dialogVisible: false

    }
    },
    created(){
      this.selectGoods()
    },
    methods:{
      // showGoods(){
      //   getGoods().then( result =>{
      //     this.tableData = result.data
      //     console.log(result.data)
      //     console.log("1111")
      //   })
      // }
      change(file){
        console.log(file)
      },
      search(){

      },
      change(file){
        console.log("file",file.url)
        this.imageUrl = file.raw
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      addGoods(){
        let params = new FormData();
        var goods_name = this.form.goods_name;
        var goods_price = this.form.goods_price;
        var add_time = this.form.add_time;
        var type = this.form.type;
        var goods_img = this.imageUrl;
        console.log("img",this.imageUrl)
        params.append("goods_name",goods_name);
        params.append("goods_price",goods_price);
        params.append("add_time",add_time);
        params.append("type",type);
        params.append("goods_img",goods_img);
        console.log(params.get("goods_img"))
        addGoods(params).then( request =>{
          console.log(request)
          if(request.state ===1){
            this.$notify({
              title: '成功',
              message: '添加商品成功',
              type: 'success',
              duration: 2000
            })
            this.selectGoods()
          }
        })

        this.dialogFormVisible = false
      },
      deleteGoods_name(){
        this.dialogFormDelete = false
        deleteGoods(this.deleteGoods).then( result =>{
          if(result.state === 1){
            this.selectGoods()
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          }
        })
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        this.goodsList.startPage = val;
        this.selectGoods();
      },
      selectGoods(){
        GoodslList(this.goodsList).then( result =>{
          this.total = result.data.total
            this.tableData = result.data.items
        })
      }


    }

  }
</script>
