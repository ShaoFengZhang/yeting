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
        apiHaveLoad:0,
    },

    onLoad: function(options) {

        this.page = 1;
        this.rows = 20;
        this.cangetData = true;

        if (options && options.contentid){
            this.typeid = options.contentid;
            this.getContent(options.contentid);
            this.getClassDes(options.contentid);
        }
    },

    onShow: function() {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        };
    },

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
        this.getContent(this.typeid);
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.getContent(this.typeid);
        }
    },

    // 得到类介绍数据
    getClassDes: function (typeid){
        let _this = this;
        let getClassDesUrl = loginApi.domin + '/home/index/heji';
        loginApi.requestUrl(_this, getClassDesUrl, "POST", {
            typeid: typeid
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    picCountNum: res.count,
                    picDownloadNum: res.download,
                    classDes:res.type
                });
            }
        })
    },

    //得到同类数据
    getContent: function (typeid){
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/album';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            typeid: typeid,
        }, function (res) {
            if (res.status == 1) {
                if (res.content.length < _this.rows) {
                    _this.cangetData = false;
                }

                if (res.content.length == 0) {
                    _this.cangetData = false;
                    _this.page==1?null:_this.page--;
                };
                _this.setData({
                    contentArr: _this.data.contentArr.concat(res.content),
                    apiHaveLoad: 1,
                });
            }
        })
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    // 返回首页
    goToHome: function() {
        wx.switchTab({
            url: '/pages/index/index'
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
})