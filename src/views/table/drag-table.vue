<template>
  <div class="app-container">
    <!-- Note that row-key is necessary to get a correct row order. -->
    <el-table ref="dragTable"  :data="list" row-key="id" border fit highlight-current-row style="width: 1320px">
      <el-table-column align="center" label="ID" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.user_id}}</span>
        </template>
      </el-table-column>

      <el-table-column width="250px" align="center" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.realname}}</span>
        </template>
      </el-table-column>

      <el-table-column width="300px" align="center" label="用户头像">
        <template slot-scope="scope">
          <img :src="scope.row.head_img">
        </template>
      </el-table-column>

      <el-table-column width="200px" align="center" label="用户积分">
        <template slot-scope="scope">
          <span>{{ scope.row.integral }}</span>
        </template>
      </el-table-column>

      <el-table-column width="200px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.add_time }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态" width="95">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="国籍" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status">
            {{ row.country }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="城市" width="100px">
        <template slot-scope="scope">
         <span>{{scope.row.cityName}}</span>
        </template>
      </el-table-column>
    </el-table>
<!--     $t is vue-i18n global function to translate lang (lang in @/lang)  -->
<!--    <div class="show-d">-->
<!--      <el-tag style="margin-right:12px;">{{ $t('table.dragTips1') }} :</el-tag> {{ oldList }}-->
<!--    </div>-->
<!--    <div class="show-d">-->
<!--      <el-tag>{{ $t('table.dragTips2') }} :</el-tag> {{ newList }}-->
<!--    </div>-->
    <div class="block">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { fetchList } from '@/api/order'
import {ClientUserSupervise} from '@/api/user'
import Sortable from 'sortablejs'

export default {
  name: 'DragTable',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: null,

      listQuery: {
        startPage: 1,
        pageSize: 10
      },
      sortable: null,
      oldList: [],
      newList: [],
      currentPage:0,
      total:0,
      pageSize:0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const { data } = await ClientUserSupervise(this.listQuery)
      this.list = data.items;
      this.total = data.total;
      this.oldList = this.list.map(v => v.id);
      this.newList = this.oldList.slice();
      // this.$nextTick(() => {
      //   this.setSort()
      // })
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0]
          this.list.splice(evt.newIndex, 0, targetRow)

          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
    handleCurrentChange(val) {
      this.listQuery.startPage = val;
      ClientUserSupervise(this.listQuery).then( result =>{
        this.list = result.data.items
        this.total = result.data.total;
        this.pageSize = result.data.pageSize;
      })
    }
  }
}
</script>

<style>
.sortable-ghost{
  opacity: .8;
  color: #fff!important;
  background: #42b983!important;
}
</style>

<style scoped>
.icon-star{
  margin-right:2px;
}
.drag-handler{
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d{
  margin-top: 15px;
}
</style>
