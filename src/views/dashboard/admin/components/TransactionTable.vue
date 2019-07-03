<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="客户昵称" min-width="200">
      <template slot-scope="scope">
        {{ scope.row.realname| orderNoFilter }}
      </template>
    </el-table-column>
    <el-table-column label="时间" width="195" align="center">
      <template slot-scope="scope">
        {{ scope.row.add_time | toThousandFilter }}
      </template>
    </el-table-column>
    <el-table-column label="地点" width="100" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.status | statusFilter">
          {{ row.cityName }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { transactionList } from '@/api/remote-search'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str
    }
  },
  data() {
    return {
      list: null,
      page:{
        startPage:1,
        pageSize:10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      console.log(this.page)
      transactionList(this.page).then(response => {
        this.list = response.data.slice(0,8)
      })
    }
  }
}
</script>
