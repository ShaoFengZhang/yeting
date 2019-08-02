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
        let _this = this;
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.getMessage();
    },

    onShow: function () {

    },

    onHide: function () {

    },

    onShareAppMessage: function () {
        return util.shareObj
    },

    getMessage:function(){
        let _this = this;
        let getMessageUrl = loginApi.domin + '/home/index/focususer';
        loginApi.requestUrl(_this, getMessageUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function (res) {
            console.log(res);
            if (res.status == 1) {

                _this.setData({
                    messageArr: _this.data.messageArr.concat(res.focususer),
                });
                _this.cangetData = true;
                if (res.focususer.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        showBotTxt: 1,
                    });
                };
            }
        })
    },

    fansFocus: function (e) {
        let index = e.currentTarget.dataset.index;
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/addfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": this.data.messageArr[index].openid,
            "buid": this.data.messageArr[index].uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("关注成功", 1200);
                _this.data.messageArr[index].ifcacelfocus=false;
                _this.setData({
                    messageArr: _this.data.messageArr,
                })
            } else {
                util.toast("关注失败", 1200);
            }
        })
    },

    fansCancelFocus: function (e) {
        let index = e.currentTarget.dataset.index;
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/delfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": this.data.messageArr[index].openid,
            "buid": this.data.messageArr[index].uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("取消关注", 1200)
                _this.data.messageArr[index].ifcacelfocus = true;
                _this.setData({
                    messageArr: _this.data.messageArr,
                })
            } else {
                util.toast("取消失败", 1200);
            }
        })
    },

    gotoUserHome: function (e) {
        let uid = e.currentTarget.dataset.uid;
        let openid = e.currentTarget.dataset.openid;
        let urlsrc = e.currentTarget.dataset.src;
        let name = e.currentTarget.dataset.name;
        let note = e.currentTarget.dataset.note;
        console.log(note);
        wx.navigateTo({
            url: `/pages/userCenter/userCenter?uid=${uid}&openid=${openid}&urlsrc=${urlsrc}&name=${name}&note=${note}`,
        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

})