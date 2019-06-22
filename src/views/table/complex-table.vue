<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.title')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
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
      <el-table-column label="Actions" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate()">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            {{ $t('table.publish') }}
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            {{ $t('table.draft') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <div v-show="ifShowMap" id="allmap">

      </div>
      <el-form v-show="ifShowForm" ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="客户姓名" prop="realname">
          <el-select
            v-model="formData.realName"
            filterable
            remote
            reserve-keyword
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
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?createData():updateData()">
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
  import { createOrder, fetchList, fetchPv, updateArticle } from '@/api/order'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import { CodeToText, regionData } from 'element-china-area-data'
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
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
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
      ifShowMap: '',
      ifShowForm: true,
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
      statusOptions: ['published', 'draft', 'deleted'],
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
    handleChange(value) {
      console.log(value)
    },
    remoteMethod(query) {
      if (query !== '') {
        this.fuzzyNameList.loading = true;
        getFuzzyInfo({realname: query}).then(resp => {
          this.fuzzyNameList.loading = false;
          console.log(resp);
          let data = resp.data;
          console.log(data);
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
    creat() {
      if (this.textMap.update === '地图') {
        this.ifShowMap = true
        this.ifShowForm = false
      }
      // 百度地图API功能
      var map = new BMap.Map('allmap')
      map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)
      var bounds = null
      var linesPoints = null
      var spoi3 = new BMap.Point(117.216994, 39.141368)
      var spoi1 = new BMap.Point(116.380967, 39.913285) // 起点1
      var spoi2 = new BMap.Point(116.380967, 39.953285) // 起点2
      var epoi = new BMap.Point(116.424374, 39.914668) // 终点
      var myIcon = new BMap.Icon('http://lbsyun.baidu.com/jsdemo/img/car.png', new BMap.Size(52, 30), { imageOffset: new BMap.Size(0, 0) })
      function initLine() {
        bounds = new Array()
        linesPoints = new Array()
        map.clearOverlays() // 清空覆盖物
        var driving3 = new BMap.DrivingRoute(map, { onSearchComplete: drawLine }) // 驾车实例,并设置回调
        driving3.search(epoi, spoi1) // 搜索一条线路
        var driving4 = new BMap.DrivingRoute(map, { onSearchComplete: drawLine }) // 驾车实例,并设置回调
        driving4.search(epoi, spoi2)
        var driving5 = new BMap.DrivingRoute(map, { onSearchComplete: drawLine }) // 驾车实例,并设置回调
        driving5.search(epoi, spoi3) // 搜索一条线路
      }
      function run() {
        for (var m = 0; m < linesPoints.length; m++) {
          var pts = linesPoints[m]
          var len = pts.length
          var carMk = new BMap.Marker(pts[0], { icon: myIcon })
          map.addOverlay(carMk)
          resetMkPoint(1, len, pts, carMk)
        }

        function resetMkPoint(i, len, pts, carMk) {
          carMk.setPosition(pts[i])
          if (i < len) {
            setTimeout(function() {
              i++
              resetMkPoint(i, len, pts, carMk)
            }, 10)
          }
        }
      }
      function drawLine(results) {
        var opacity = 0.45
        var planObj = results.getPlan(0)
        var b = new Array()
        var addMarkerFun = function(point, imgType, index, title) {
          var url
          var width
          var height
          var myIcon
          // imgType:1的场合，为起点和终点的图；2的场合为车的图形
          if (imgType == 1) {
            url = 'http://lbsyun.baidu.com/jsdemo/img/dest_markers.png'
            width = 42
            height = 34
            myIcon = new BMap.Icon(url, new BMap.Size(width, height), { offset: new BMap.Size(14, 32), imageOffset: new BMap.Size(0, 0 - index * height) })
          } else {
            url = 'http://lbsyun.baidu.com/jsdemo/img/trans_icons.png'
            width = 22
            height = 25
            var d = 25
            var cha = 0
            var jia = 0
            if (index == 2) {
              d = 21
              cha = 5
              jia = 1
            }
            myIcon = new BMap.Icon(url, new BMap.Size(width, d), { offset: new BMap.Size(10, (11 + jia)), imageOffset: new BMap.Size(0, 0 - index * height - cha) })
          }

          var marker = new BMap.Marker(point, { icon: myIcon })
          if (title != null && title != '') {
            marker.setTitle(title)
          }
          // 起点和终点放在最上面
          if (imgType == 1) {
            marker.setTop(true)
          }
          map.addOverlay(marker)
        }
        var addPoints = function(points) {
          for (var i = 0; i < points.length; i++) {
            bounds.push(points[i])
            b.push(points[i])
          }
        }
        // 绘制驾车步行线路
        for (var i = 0; i < planObj.getNumRoutes(); i++) {
          var route = planObj.getRoute(i)
          if (route.getDistance(false) <= 0) { continue }
          addPoints(route.getPath())
          // 驾车线路
          if (route.getRouteType() == BMAP_ROUTE_TYPE_DRIVING) {
            map.addOverlay(new BMap.Polyline(route.getPath(), { strokeColor: '#0030ff', strokeOpacity: opacity, strokeWeight: 6, enableMassClear: true }))
          } else {
            // 步行线路有可能为0
            map.addOverlay(new BMap.Polyline(route.getPath(), { strokeColor: '#30a208', strokeOpacity: 0.75, strokeWeight: 4, enableMassClear: true }))
          }
        }
        map.setViewport(bounds)
        // 终点
        addMarkerFun(results.getEnd().point, 1, 1)
        // 开始点
        addMarkerFun(results.getStart().point, 1, 0)
        linesPoints[linesPoints.length] = b
      }
      initLine()
      run()
      map.enableScrollWheelZoom(true) // 开启鼠标滚轮缩放
    },

    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
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
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.creat()
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
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
  body, html,#allmap {width: 100%;height: 500px;margin:0;font-family:"微软雅黑";}
</style>
