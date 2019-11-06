<template>
	<view class="content">
		<view id="map" />
		<view class="chat-body">
			<input class="chat-input" type="text" />
			<button class="chat-send">发送</button>
		</view>
	</view>
</template>

<script>
	import {
		lazyAMapApiLoaderInstance
	} from 'vue-amap';
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			lazyAMapApiLoaderInstance.load().then(() => {
				this.map = new AMap.Map('map', {
					center: new AMap.LngLat(121.59996, 31.197646)
				});
			});
		},
		methods: {

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
	
	.chat-send{
		background: #AADDFF;
	}

	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	#map {
		height: 85vh;
		width: 100vw;
		display: flex;
	}
</style>
