<template>
  <div  id="allmap" class="app-container" v-title data-title = "天津顺水物流管理-物流" >
<!--    <aside>-->
<!--      {{ $t('guide.description') }}-->
<!--      <a href="https://github.com/kamranahmedse/driver.js" target="_blank">driver.js.</a>-->
<!--    </aside>-->
<!--    <el-button icon="el-icon-question" type="primary" @click.prevent.stop="guide">-->
<!--      {{ $t('guide.button') }}-->
<!--    </el-button>-->
  </div>
</template>

<script>
// import Driver from 'driver.js' // import driver.js
// import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'
import {searchcCoordinate} from '@/api/map'
import {getAddr_name} from '@/api/order'
import qs from 'qs'
export default {
  name: 'Guide',
  component:{
    searchcCoordinate,
    getAddr_name
  },
  data() {
    return {
      driver: null,
      lng:[],
      lat:[]
    }
  },
  mounted() {
    // this.driver = new Driver()
    this.create()
  },
  methods: {
      create(){
        var x1 = [];
        var x2 = [];
        var map = new BMap.Map("allmap");    // 创建Map实例
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 6);  // 初始化地图,设置中心点坐标和地图级别
        map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
        map.enableScrollWheelZoom(true);      //开启鼠标滚轮缩放
        getAddr_name().then( result => {
            for (let i in result.data){
              searchcCoordinate(result.data[i].addr_name).then( result => {
                this.lng = result.data.lng
                this.lat = result.data.lat
                var myP1 = new BMap.Point(124.352351,40.001766);
                var myP2 = new BMap.Point(this.lng,this.lat)
                var driving2 = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true,}});    //驾车实例
                driving2.search(myP1, myP2);
                driving2.setPolylinesSetCallback(function (routes) {
                  for (var route in routes) {
                    routes[route].getPolyline().setStrokeColor("red");
                    routes[route].getPolyline().setStrokeWeight(15);
                  }});
              })
            }
        });
    },
  }
}
</script>
<style>
  body, html,#allmap {width: 100%;height: 1000px;margin:0;font-family:"微软雅黑";}
</style>
