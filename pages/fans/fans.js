import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        messageArr: [],
        showBotTxt:0,
        srcDomin: loginApi.srcDomin,
    },

    onLoad: function (options) {
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.getFansData();
    },

    onShow: function () {

    },

    onHide: function () {

    },

    onShareAppMessage: function () {
        return util.shareObj
    },

    getFansData:function(){
        util.loding('Loading');
        let _this = this;
        let releaseFunUrl = loginApi.domin + '/home/index/fans';
        loginApi.requestUrl(_this, releaseFunUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function (res) {
            wx.hideLoading();
            if (res.status == 1) {
                _this.setData({
                    messageArr: _this.data.messageArr.concat(res.fans),
                });
                _this.cangetData = true;
                if (res.fans.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        showBotTxt: 1,
                    });
                };
            }
            
        })
    },

    // 滑动到底部
    bindscrolltolower: function () {
        if (this.cangetData) {
            this.page++;
            this.getFansData();
        }
    },

    gotoUserHome: function (e) {
        let uid = e.currentTarget.dataset.uid;
        let openid = e.currentTarget.dataset.openid;
        let urlsrc = e.currentTarget.dataset.src;
        let name = e.currentTarget.dataset.name;
        let note = e.currentTarget.dataset.note;
        wx.navigateTo({
            url: `/pages/userCenter/userCenter?uid=${uid}&openid=${openid}&urlsrc=${urlsrc}&name=${name}&note=${note}`,
        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})