import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        contentArr:[],
        userinfo:{},
    },

    onLoad: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
        let _this = this;
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        console.log(options);

        if (options && options.uid) {
            this.openid = options.openid;
            this.uid = options.uid;
            this.getUserContent(options.uid);
            this.getContentArr(options.uid)
        }
    },

    onShow: function() {

    },

    onHide: function() {

    },

    // 分享
    onShareAppMessage: function() {
        return util.shareObj
    },

    // 加载上一页
    onPullDownRefresh: function () {
        console.log("onPullDownRefresh")
        let _this = this;
        this.page == 1;
        this.setData({
            contentArr: [],
        })
        this.getContentArr(this.typeid);
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            this.getContentArr(this.typeid);
        }
    },

    //获取个人数据
    getUserContent:function(uid){
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/personal';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "buid": uid,
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                _this.setData({
                    focus: res.focus,
                    userinfo: res.userinfo,
                })
            }
        })
    },

    // 获取发布数据
    getContentArr:function(uid){
        let _this = this;
        let getContentArrUrl = loginApi.domin + '/home/index/usercontentlist';
        loginApi.requestUrl(_this, getContentArrUrl, "POST", {
            uid: uid,
            page:this.page,
            len:this.rows,
        }, function (res) {
            if (res.status == 1) {
                if (res.content.length < _this.rows) {
                    _this.cangetData = false;
                }

                if (res.content.length == 0) {
                    _this.cangetData = false;
                    _this.page == 1 ? null : _this.page--;
                };
                _this.setData({
                    contentArr: _this.data.contentArr.concat(res.content),
                });
            }
        })
    },

    catchtap: function() {},

    // 关注
    fansFocus: function () {
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/addfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": _this.data.userinfo.openid,
            "buid": _this.data.userinfo.uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("关注成功", 1200);
                _this.setData({
                    focus: 1,
                })
            } else {
                util.toast("关注失败", 1200);
            }
        })
    },

    // 取消关注
    fansCancelFocus: function () {
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/delfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": _this.data.userinfo.openid,
            "buid": _this.data.userinfo.uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("取消关注", 1200)
                _this.setData({
                    focus: 0,
                })
            } else {
                util.toast("取消失败", 1200);
            }
        })
    },

    // 跳转详情页
    goToDetails: function (e) {
        let {
            id,
            typeid
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/details/details?contentid=${id}&typeid=${typeid}`,
        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})