import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        contentArr: [],
        userinfo: {},
    },

    onLoad: function (options) {
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

        this.getUserContent(wx.getStorageSync('u_id'));
        this.getContentArr(wx.getStorageSync('u_id'));
       
    },

    onShow: function () {

    },

    onHide: function () {

    },

    // 分享
    onShareAppMessage: function () {
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
    getUserContent: function (uid) {
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/personal';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "buid": uid,
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                _this.setData({
                    userinfo: res.userinfo,
                })
            }
        })
    },

    // 获取数据
    getContentArr: function (uid) {
        let _this = this;
        let getContentArrUrl = loginApi.domin + '/home/index/usercontentlist';
        loginApi.requestUrl(_this, getContentArrUrl, "POST", {
            uid: uid,
            page: this.page,
            len: this.rows,
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

    catchtap: function () { },

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