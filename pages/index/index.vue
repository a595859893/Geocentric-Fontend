<template>
  <view class="content">
    <map
      id="map-body"
      ref="map-body"
      :latitude="loc.latitude"
      :longitude="loc.longitude"
      :markers="markers"
      show-location="true"
      @regionchange="refreshMap"
      @markertap="moveTo"
    />

    <view class="chat-board" v-if="heightMsgId">
      <view class="chat-header">
        <button @tap="moreDetail">查看全部讨论</button>
      </view>
      <view class="chat-dis">
        <view class="chat-discuss" v-for="(item, index) in discuss" :key="index + 'label_0'">
          <view class="word">{{ item.content }}</view>
        </view>
      </view>
    </view>

    <view class="chat-body">
      <input
        class="chat-input"
        type="text"
        placeholder="点击气泡查看，或在此发新评论"
        :disabled="isSending"
        v-model="message"
        @confirm="sendMessage"
      />
      <button class="chat-send" :loading="isSending" @tap="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
import config from "../../config.js";
import { resolve } from "url";

function generateMark(id, latitude, longitude, highLight) {
  return {
    id,
    latitude,
    longitude,
    iconPath: "../../static/talk_bubble6.png", //显示的图标
    rotate: 0, // 旋转度数
    width: highLight ? 100 : 50,
    height: highLight ? 100 : 50
  };
}

export default {
  data() {
    return {
      message: "",
      loc: {
        latitude: 22.93300517699429, //39.909,
        longitude: 113.382958850984 //116.39742,
      },
      zoomLevel: 10,
      markers: [],
      discuss: [],
      isSending: false,
      context: null,
      heightMsgId: null,
      userId: "anonymous"
    };
  },
  activated() {
    this.refreshMap();
  },
  onReady() {
    this.refreshMap();
    let that = this;
    uni.getLocation({
      type: "gcj02",
      success(res) {
        const { latitude, longitude } = res;
        that.loc = { latitude, longitude };
        that.refreshMap();
      },
      fail(err) {
        uni.showToast({
          title: "无法获取当前位置",
          icon: "none"
        });
      }
    });
  },

  methods: {
    async refreshMap() {
      const appMap = uni.createMapContext("map-body", this);
      const that = this;

      try {
        const scale = await new Promise(function(resolve, reject) {
          appMap.getScale({
            success(res) {
              const { scale } = res;
              return res.scale ? resolve(scale) : reject();
            },
            fail: err => reject(err)
          });
        });

        const loc = await new Promise((resolve, reject) =>
          appMap.getCenterLocation({
            success(res) {
              const { latitude, longitude } = res;
              return resolve({ longitude, latitude });
            },
            fail: err => reject(err)
          })
        );
        this.loc = loc;
        this.zoomLevel = scale;
        this.updateMsg();
      } catch (err) {
        uni.showToast({
          title: "出现预料外的错误",
          icon: "none"
        });
      }
    },
    updateMsg() {
      let data = {
        userId: this.userId,
        loc: {
          log: this.loc.longitude,
          lat: this.loc.latitude
        },
        period: {
          start: -1000 * 60 * 60 * 24,
          end: 1000 * 60
        },
        zoomLevel: this.zoomLevel
      };

      const that = this;
      uni.request({
        url: `${config.HOST}/${config.API.MESSAGE}/get`,
        method: "post",
        dataType: "json",
        data: data,
        success(res) {
          if (!res.data.ok) return;

          const { results } = res.data;
          const offset = 25 / Math.pow(2, that.zoomLevel);

          let marks = [];
          let min = offset * offset;
          let heightMsgId = null;
          marks.push({
            id: 0,
            latitude: that.loc.latitude,
            longitude: that.loc.longitude
          });

          for (let i = 0; i < results.length; i++) {
            const msg = results[i];
            const diff = {
              y: msg.loc.y - that.loc.latitude,
              x: msg.loc.x - that.loc.longitude
            };
            const dis = diff.x * diff.x + diff.y * diff.y;
            if (dis < min) {
              min = dis;
              heightMsgId = msg.msgId;
            }
          }
          that.heightMsgId = heightMsgId;
          if (heightMsgId) {
            that.updateDiscuss();
          }
          for (let i = 0; i < results.length; i++) {
            const msg = results[i];
            marks.push(
              generateMark(
                msg.msgId,
                msg.loc.y,
                msg.loc.x,
                heightMsgId == msg.msgId
              )
            );
          }

          that.markers = marks;
        },
        fail: err =>
          uni.showToast({
            title: "消息获取失败",
            icon: "none"
          })
      });
    },
    moveTo(e) {
      const msgId = e.detail.markerId || e.markerId;
      //   console.log(this.markers);
      for (let i = 0; i < this.markers.length; i++) {
        const msg = this.markers[i];

        if (msg.id == msgId) {
          //   console.log(msg);
          this.loc = { latitude: msg.latitude, longitude: msg.longitude };
          this.refreshMap();
        }
      }
    },
    updateDiscuss() {
      let data = {
        msgId: this.heightMsgId,
        userId: this.userId
      };
      const that = this;
      uni.request({
        url: `${config.HOST}/${config.API.DISCUSS}/get`,
        method: "post",
        dataType: "json",
        data: data,
        success(res) {
          if (!res.data.ok) {
            return uni.showToast({
              title: "消息获取失败",
              icon: "none"
            });
          }
          const { results } = res.data;
          that.discuss = results;
        },
        fail: err =>
          uni.showToast({
            title: "未知错误",
            icon: "none"
          })
      });
    },
    moreDetail(e) {
      const msgId = this.heightMsgId;
      if (msgId) {
        uni.navigateTo({
          url: `../add/add?msgId=${msgId}`
        });
      }
    },
    sendMessage() {
      if (this.isSending) {
        return uni.showToast({
          title: "正在发送，请稍后",
          icon: "none"
        });
      }

      if (!this.message) {
        return uni.showToast({
          title: "内容不能为空",
          icon: "none"
        });
      }

      if (this.heightMsgId) {
        return this.sendHightLight();
      }

      const that = this;
      this.isSending = true;
      let data = {
        userId: this.userId,
        loc: {
          log: this.loc.longitude,
          lat: this.loc.latitude
        },
        msg: this.message
      };

      uni.request({
        url: `${config.HOST}/${config.API.MESSAGE}/send`,
        method: "post",
        dataType: "json",
        data,
        success(res) {
          const { data } = res;
          that.isSending = false;
          if (!data.ok) {
            return uni.showToast({
              title: "发送失败，请稍后再试",
              icon: "none"
            });
          }

          that.message = "";
          that.updateMsg();
        },
        fail(err) {
          that.isSending = false;
          uni.showToast({
            title: "发送失败，请稍后再试",
            icon: "none"
          });
        }
      });
    },
    sendHightLight() {
      let data = {
        userId: this.userId,
        msgId: this.heightMsgId,
        content: this.message,
        limit: 20
      };
      let that = this;
      uni.request({
        url: `${config.HOST}/${config.API.DISCUSS}/send`,
        method: "post",
        dataType: "json",
        data: data,
        success(res) {
          const { data } = res;
          that.isSending = false;

          if (!data.ok) {
            return uni.showToast({
              title: "发送失败，请刷新重试",
              icon: "none"
            });
          }

          that.message = "";
          uni.showToast({
            title: "发送完成"
          });
          that.updateDiscuss();
        },
        fail: err =>
          uni.showToast({
            title: "发送失败，请稍后再试",
            icon: "none"
          })
      });
    }
  }
};
</script>

<style>
.content {
  height: calc(100vh - 44px);
}

#map-body {
  height: calc(95vh - 44px - 30rpx);
  width: 100vw;
}

.chat-body {
  height: calc(5vh + 30rpx);
  width: 100vw;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: #66ccff;
}

.chat-input {
  flex-grow: 5;
  margin: 5rpx 10rpx;
  height: calc(100% - 10rpx);
  background: #88ddff;
  color: #ffffff;
  border-radius: 25rpx;
}

.chat-send {
  flex-grow: 1;
  background: #aaddff;
  height: calc(100% - 10rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15rpx;
}

.logo-area {
  display: flex;
  justify-content: center;
  font-size: x-large;
  margin-top: 50upx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30upx;
  color: #9b4400;
}

.chat-board {
  position: absolute;
  top: calc(75vh - 44px - 30rpx);
  flex-direction: column;
  left: 0px;
  width: 80vw;
  height: 20vh;
  background-color: rgba(100, 150, 250, 0.3);
  z-index: 100;
  display: flex;
}
.chat-header {
  flex-grow: 1;
  color: #aaddff;
}
.chat-header button {
  background-color: rgba(200, 255, 250, 0.5);
  color: #44aaee;
}
.chat-dis {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.chat-discuss {
  width: 100%;
  height: 50rpx;
  margin: 2px;
  font-size: large;
  background-color: rgba(200, 255, 250, 0.5);
}

.word {
  text-align: left;
  border-bottom: 1px solid #6699cc;
  height: 80rpx;
  padding: 0px 25rpx;
  color: #3c3e49;
}

#debug {
  position: absolute;
  top: 0vh;
  left: 0vw;
  width: 25vh;
  height: 8vw;
  background: #c0c0c0;
  z-index: 10;
}
</style>
