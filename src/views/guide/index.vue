<template>
  <div  id="allmap" class="app-container">
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

export default {
  name: 'Guide',
  data() {
    return {
      driver: null
    }
  },
  mounted() {
    // this.driver = new Driver()
    this.create()
  },
  methods: {
      create(){
        // 百度地图API功能
        var map = new BMap.Map("allmap");
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
        var bounds = null;
        var linesPoints = null;
        var spoi3 = new BMap.Point(117.216994,39.141368);
        var spoi1 = new BMap.Point(116.380967,39.913285);    // 起点1
        var spoi2 = new BMap.Point(116.380967,39.953285);    // 起点2
        var epoi  = new BMap.Point(116.424374,39.914668);    // 终点
        var myIcon = new BMap.Icon("http://lbsyun.baidu.com/jsdemo/img/car.png", new BMap.Size(52, 30), {imageOffset: new BMap.Size(0, 0)});
        function initLine(){
          bounds = new Array();
          linesPoints = new Array();
          map.clearOverlays();                                                    // 清空覆盖物
          var driving3 = new BMap.DrivingRoute(map,{onSearchComplete:drawLine});  // 驾车实例,并设置回调
          driving3.search(epoi, spoi1);                                       // 搜索一条线路
          var driving4 = new BMap.DrivingRoute(map,{onSearchComplete:drawLine});  // 驾车实例,并设置回调
          driving4.search(epoi, spoi2);
          var driving5 = new BMap.DrivingRoute(map,{onSearchComplete:drawLine});  // 驾车实例,并设置回调
          driving5.search(epoi, spoi3);   // 搜索一条线路
        }
        function run(){
          for(var m = 0;m < linesPoints.length; m++){
            var pts = linesPoints[m];
            var len = pts.length;
            var carMk = new BMap.Marker(pts[0],{icon:myIcon});
            map.addOverlay(carMk);
            resetMkPoint(1,len,pts,carMk)
          }

          function resetMkPoint(i,len,pts,carMk){
            carMk.setPosition(pts[i]);
            if(i < len){
              setTimeout(function(){
                i++;
                resetMkPoint(i,len,pts,carMk);
              },10);
            }
          }

        }
        function drawLine(results){
          var opacity = 0.45;
          var planObj = results.getPlan(0);
          var b = new Array();
          var addMarkerFun = function(point,imgType,index,title){
            var url;
            var width;
            var height
            var myIcon;
            // imgType:1的场合，为起点和终点的图；2的场合为车的图形
            if(imgType == 1){
              url = "http://lbsyun.baidu.com/jsdemo/img/dest_markers.png";
              width = 42;
              height = 34;
              myIcon = new BMap.Icon(url,new BMap.Size(width, height),{offset: new BMap.Size(14, 32),imageOffset: new BMap.Size(0, 0 - index * height)});
            }else{
              url = "http://lbsyun.baidu.com/jsdemo/img/trans_icons.png";
              width = 22;
              height = 25;
              var d = 25;
              var cha = 0;
              var jia = 0
              if(index == 2){
                d = 21;
                cha = 5;
                jia = 1;
              }
              myIcon = new BMap.Icon(url,new BMap.Size(width, d),{offset: new BMap.Size(10, (11 + jia)),imageOffset: new BMap.Size(0, 0 - index * height - cha)});
            }

            var marker = new BMap.Marker(point, {icon: myIcon});
            if(title != null && title != ""){
              marker.setTitle(title);
            }
            // 起点和终点放在最上面
            if(imgType == 1){
              marker.setTop(true);
            }
            map.addOverlay(marker);
          }
          var addPoints = function(points){
            for(var i = 0; i < points.length; i++){
              bounds.push(points[i]);
              b.push(points[i]);
            }
          }
          // 绘制驾车步行线路
          for (var i = 0; i < planObj.getNumRoutes(); i ++){
            var route = planObj.getRoute(i);
            if (route.getDistance(false) <= 0){continue;}
            addPoints(route.getPath());
            // 驾车线路
            if(route.getRouteType() == BMAP_ROUTE_TYPE_DRIVING){
              map.addOverlay(new BMap.Polyline(route.getPath(), {strokeColor: "#0030ff",strokeOpacity:opacity,strokeWeight:6,enableMassClear:true}));
            }else{
              // 步行线路有可能为0
              map.addOverlay(new BMap.Polyline(route.getPath(), {strokeColor: "#30a208",strokeOpacity:0.75,strokeWeight:4,enableMassClear:true}));
            }
          }
          map.setViewport(bounds);
          // 终点
          addMarkerFun(results.getEnd().point,1,1);
          // 开始点
          addMarkerFun(results.getStart().point,1,0);
          linesPoints[linesPoints.length] = b;
        }
        initLine();
        setTimeout(function(){
          run();
        },1500);
        map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
      }

  }
}
</script>
<style>
  body, html,#allmap {width: 100%;height: 1000px;margin:0;font-family:"微软雅黑";}
</style>
