import Vue from 'vue'
import App from './App'
// import VueAMap from 'vue-amap';
// import {
// 	lazyAMapApiLoaderInstance
// } from 'vue-amap';


// Vue.use(VueAMap);
Vue.config.productionTip = false

// VueAMap.initAMapApiLoader({
// 	key: '7d0ae7939300e7bef13d20b194cfcac7',
// 	plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType',
// 		'AMap.PolyEditor', 'AMap.CircleEditor'
// 	],
// 	v: '1.4.4'
// });
// lazyAMapApiLoaderInstance.load().then(() => {
// 	new AMap.Map('map', {
// 		center: new AMap.LngLat(121.59996, 31.197646)
// 	});
// });
App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
