<template>
  <view>
    <view class="logo-area">{{ title }}</view>

    <view class="marker_item" v-for="(item, index) in markers" :key="index + 'label_0'">
      <view class="word">{{ item.content }}</view>
    </view>

    <view class="input_style">
      <input class="word2" type="text" placeholder="写点东西吧" @confirm="sure" v-model="text" />

      <button class="button_style" size="mini" @click="sure">done</button>
    </view>
  </view>
</template>

<script>
import config from "../../config.js";
export default {
  data() {
    return {
      markers: [],
      title: "当前消息",
      text: "",
      isSending: false,
      userId: "anonymous",
      msgId: ""
    };
  },
  onLoad(option) {
    const { msgId } = option;
    console.log(msgId);
    this.msgId = msgId;
    this.updateMsg();
  },
  methods: {
    updateMsg() {
      let data = {
        msgId: this.msgId,
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
          console.log(results);
          that.markers = results;
        },
        fail: err =>
          uni.showToast({
            title: "未知错误",
            icon: "none"
          })
      });
    },
    sure() {
      if (!this.text) {
        return uni.showToast({
          title: "内容不能为空",
          icon: "none"
        });
      }

      const that = this;
      let data = {
        userId: this.userId,
        msgId: this.msgId,
        content: this.text
      };

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

          that.text = "";
          uni.showToast({
            title: "发送完成"
          });
          that.updateMsg();
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

.marker_item {
  display: flex;
  justify-content: flex-start;
  margin-top: 50upx;
  margin-left: 90upx;
  font-size: large;
  /*
    cb3a56茜红
    065279蓝
    9b4400棕红
  */
}

.word {
  flex: 1;
  text-align: left;
  border-bottom: 1px solid #6699cc;
  margin-right: 50upx;
  font-weight: 500;
  color: #3c3e49;
}

.input_style {
  display: flex;
  position: fixed;
  bottom: 100upx;
  justify-content: flex-start;
  margin-top: 100upx;
  margin-left: 90upx;
  font-size: large;
}

.word2 {
  flex: 1;
  text-align: left;
  margin-right: 50upx;
  color: #3c3e49;
  border-bottom: 1px solid #cb3a56;
  background-color: white;
}

.button_style {
  margin-right: 20upx;
  color: #5989b9;
}
</style>
