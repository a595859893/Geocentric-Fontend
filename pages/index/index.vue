<template>
	<view class="content">
		<!-- https://uniapp.dcloud.io/component/map -->
		<view id="debug">{{debugMsg}}</view>
		<map id="map-body" ref="map-body" :latitude="latitude" :longitude="longitude" :markers="covers" show-location="true"
		 @tap="clickMap" />
		<view class="chat-body">
			<input class="chat-input" type="text" />
			<button class="chat-send">发送</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				latitude: 39.909,
				longitude: 116.39742,
				covers: [{
					latitude: 39.909,
					longitude: 116.39742,
					iconPath: '../../../static/logo.png'
				}, {
					latitude: 39.90,
					longitude: 116.39,
					iconPath: '../../../static/logo.png'
				}],
				debugMsg: "随便塞点信息在这里"
			}
		},
		onReady() {
			let that = this;
			// https://uniapp.dcloud.io/api/location/map?id=createmapcontext
			// 据说可以获得当前位置
			// 但是我调用了没反应
			// 你们可以看看是有什么条件还是什么情况
			uni.getLocation({
				type: 'gcj02', //返回可以用于uni.openLocation的经纬度
				success: function(res) {
					that.latitude = res.latitude;
					that.longitude = res.longitude;
				}
			});
		},
		onLoad() {

		},
		methods: {
			clickMap(e) {
				console.log(e);
				this.getCenter();
			},
			getCenter() {
				// https://uniapp.dcloud.io/api/location/map?id=createmapcontext
				let appMap = uni.createMapContext("map-body", this);
				let that = this;
				// 没找到鼠标点击位置的经纬度怎么获取
				// 但是可以获取地图中心的经纬度
				appMap.getCenterLocation({
					success(res) {
						that.debugMsg = res.latitude + "," + res.longitude;
					}
				})
			},
		}
	}
</script>

<style>
	.chat-body {
		width: 100vw;
		height: calc(15vh - 44px);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		background: #66ccff;
	}

	.chat-body * {
		flex-grow: 1;
	}

	.chat-input {
		padding: 0rpx 30rpx;
		height: calc(5vh + 11px);
		background: #88DDFF;
		color: #FFFFFF;
		border-radius: 25rpx;
	}

	.chat-send {
		background: #AADDFF;
	}

	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	#map-body {
		height: 85vh;
		width: 100vw;
		display: flex;
	}

	#debug {
		position: absolute;
		top: 0vh;
		left: 0vw;
		width: 30vh;
		height: 10vw;
		background: #FFFFFF;
		z-index: 10;
	}
</style>
