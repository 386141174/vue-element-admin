 <template>
  <div class="app-container" v-title data-title = "订单管理">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.title')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加订单
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出到Excel
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="订单编号" prop="order_id" sortable="custom" align="center" width="330px">
        <template slot-scope="scope">
          <span>{{ scope.row.order.order_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.order.goods_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户昵称" width="250px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user.realname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发货点" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目的地" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.order.addr_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.order.add_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            地图
          </el-button>
          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            发货
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog customClass="customWidth" :title="dialogStatus" :visible.sync="dialogFormVisible" >

      <div id="showMap" v-show="ifShowMap">
        <baidu-map class="map" :center="center" :zoom="11" :scroll-wheel-zoom = "true" :mapStyle="mapStyle" ak="8GsDLEMNbGDcaODiONYWuNVBTNseEYIy">
          <bm-polyline :path="path" :strokeColor="strokeColor" @lineupdate="updatePolylinePath" :strokeWeight="strokeWeight"> </bm-polyline>
            <bm-driving :start="startCenter" :end="endCenter" @searchcomplete="handleSearchComplete" :panel="false" :autoViewport="true" ></bm-driving>
            <bml-lushu
            :path="path"
            :icon="icon"
            :play="play"
            :speed="40000"
            :rotation="true">
          </bml-lushu>
        </baidu-map>
      </div>

      <el-form v-show="ifShowForm" ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="客户姓名" prop="realname">
          <el-select
            v-model="formData.realName"
            filterable
            remote
            clearable
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="fuzzyNameList.loading">
            <el-option
              v-for="item in fuzzyNameList.options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="formData.goodsName" />
        </el-form-item>
        <el-form-item label="目的地" prop="addr_name">
          <el-cascader
            v-model="selectedOptions"
            size="large"
            :options="options"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item label="送货时间" prop="ffuck">
          <el-date-picker
            v-model="formData.deliverTime"
            type="datetime"
            placeholder="选择日期时间"
            default-time="12:00:00">
          </el-date-picker>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddOrder()">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?createData():updateData()" v-show="showButton">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>



  </div>
</template>

<script>
  import { createOrder, fetchList, fetchPv, updateOrder } from '@/api/order'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import { CodeToText, regionData } from 'element-china-area-data'
  import { BaiduMap, BmDriving, BmlLushu, BmPolyline } from 'vue-baidu-map'
  import { mapCoordinate } from '@/api/map'
  import custom_map_config from '../../styles/json/custom_map_config'
  import { getFuzzyInfo } from '@/api/user'

  const calendarTypeOptions = [
  { key: 'order_id', display_name: '订单编号' },
  { key: 'goods_name', display_name: '商品名称' },
  { key: 'realname', display_name: '客户昵称' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {

  name: 'ComplexTable',
  components: {
    Pagination ,
    BaiduMap,
    BmDriving,
    BmlLushu,
    BmPolyline,
    custom_map_config
  },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      showButton:'true',
      mapStyle:{
        styleJson:[custom_map_config]
      },
      strokeWeight:10,
      strokeColor:'red',
      map:'map',
      center:{
        lng: 116.404, lat: 39.915
      },
      endCenter:{
        lng:null,
        lat:null
      },
      startCenter:{
        lng:null,
        lat:null
      },
      lat:'',
      play: true,
      path: [],
      icon: {
        url: 'http://api.map.baidu.com/library/LuShu/1.2/examples/car.png',
        size: {width: 52, height: 26},
        opts: {anchor: {width: 27, height:13}}
      },
      ifShowMap:false,
      ifShowForm:true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      calendarTypeOptions,
      sortOptions: [{ label: '按照时间升序', key: '+id' }, { label: '按照时间降序', key: '-id' }],
      statusOptions: ['运输中', '完成','未付款'],
      showReviewer: false,
      options: regionData,
      formData: {
        goodsName: '',
        realName: '',
        deliverTime: '',
      },
      selectedOptions: [],
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '地图',
        create: '添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      fuzzyNameList: {
        options: [],
        value: [],
        list: [],
        loading: false,
        states: [],
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.fuzzyNameList.list = this.fuzzyNameList.states.map(item => {
      return { value: item, label: item };
    });
  },

  methods: {
    updatePolylinePath (e) {
      this.polylinePath = e.target.getPath()
    },
    handleSearchComplete (res) {
      this.path = res.getPlan(0).getRoute(0).getPath()

    },
    handleChange(value) {
      // console.log(value)
    },
    cancelAddOrder() {
      this.dialogFormVisible = false;
      this.emptyObj(this.formData);
      this.fuzzyNameList.options = [];
      this.selectedOptions = [];
    },
    remoteMethod(query) {
      if (query != '') {
        this.fuzzyNameList.loading = true;
        getFuzzyInfo({realname: query}).then(resp => {
          this.fuzzyNameList.loading = false;
          let data = resp.data;
          data.forEach((item,index) => {
            this.fuzzyNameList.options[index] = {
              value: data[index].realname,
              label: data[index].realname,
            };
          })
        })
      } else {
        this.fuzzyNameList.options = [];
      }
    },

    showMap() {
      if (this.textMap.update === '地图') {
        this.ifShowForm = false;
      }
    },

    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then( response => {
        console.log(response.data)
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      if (status === '完成') {

      }
      console.log(row);
      let orderId = row.order.order_id;
      updateOrder({orderId: orderId}).then(response => {
        if (response.state === 1) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          switch (status) {
            case '未付款':

          }
        }
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleCreate() {
      this.ifShowMap = false
      this.showButton = true
      this.dialogStatus = '添加'
      this.dialogFormVisible = true
      if (this.textMap.create === '添加') {
        this.ifShowMap = false
        this.ifShowForm = true
      }
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // var fucker = TextToCode[this.selectedOptions];
          let fuckCities = ['北京市','天津市','重庆市','上海市'];
          let selectedOption = this.selectedOptions[0];
          for (let i in fuckCities) {
            if (selectedOption === fuckCities[i]) {
              selectedOption = this.selectedOptions[1];
            }
          }

          let fullCityName = CodeToText[selectedOption]
          this.formData.cityName = fullCityName.substring(0,fullCityName.length - 1);
          createOrder(this.formData).then(() => {
            this.list.unshift(this.formData)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '订单创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList();
            this.emptyObj(this.formData);
            this.emptyObj(this.fuzzyNameList);
            this.emptyObj(this.selectedOptions);
          })
        }
      })
    },
    emptyObj(obj) {
      for (let p in obj) {
        obj[p] = '';
      }
    },
    handleUpdate(row) {
      this.ifShowMap = true
      this.showButton = false
      mapCoordinate(row.user.cityName).then(result =>{
        this.startCenter.lng = result.data.lng;
        this.startCenter.lat = result.data.lat;
      });
      mapCoordinate(row.order.addr_name).then(result =>{
        this.endCenter.lng = result.data.lng;
        this.endCenter.lat = result.data.lat;
      });

      this.dialogStatus = '地图'
      this.dialogFormVisible = true
      this.ifShowMap = true;
        this.showMap(row)
    },
    updateData() {
      this.dialogFormVisible = false
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     const tempData = Object.assign({}, this.temp)
      //     tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      //     updateArticle(tempData).then(() => {
      //       for (const v of this.list) {
      //         if (v.id === this.temp.id) {
      //           const index = this.list.indexOf(v)
      //           this.list.splice(index, 1, this.temp)
      //           break
      //         }
      //       }
      //       this.dialogFormVisible = false
      //       this.$notify({
      //         title: '成功',
      //         message: '更新成功',
      //         type: 'success',
      //         duration: 2000
      //       })
      //     })
      //   }
      // })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['order_id', 'goods_name', 'realname', 'cityName', 'addr_name','add_time'];
        const filterVal = ['order_id', 'goods_name', 'realname', 'cityName', 'addr_name','add_time'];
        const fuckerArr = [];
        this.list.forEach((item,index) => {
          let obj = {};
          obj.order_id = item.order.order_id;
          obj.goods_name = item.order.goods_name;
          obj.realname = item.user.realname;
          obj.cityName = item.user.cityName;
          obj.addr_name = item.order.addr_name;
          obj.add_time = item.order.add_time;
          fuckerArr[index] = obj;
        })
        const data = this.formatJson(filterVal,fuckerArr);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
    })
  },
  formatJson(filterVal, jsonData) {
    return jsonData.map(v => filterVal.map(j => {
      if (j === 'timestamp') {
        return parseTime(v[j])
      } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style>
  .map {
    width: 100%;
    height: 600px;
  }
  .customWidth{
    width:80%;
  }
</style>
