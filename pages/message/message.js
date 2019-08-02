import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        messageArr: [],
        showBotTxt: 0,
        srcDomin: loginApi.srcDomin,
        classArr: [{
                title: "评论",
                id: 0,
            },
            {
                title: "点赞",
                id: 2,
            },
        ],
        swiperCurrentIndex: 0,
    },

    onLoad: function(options) {
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.setData({
            scrollHeight: (app.windowHeight + app.Bheight) * 750 / app.sysWidth-96,
        });
        this.getMessageComData()
    },

    onShow: function() {

    },

    onHide: function() {

    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    //swiperBindtap
    swiperBindtap: function(e) {
        let classId = e.currentTarget.dataset.id;
        if (this.data.swiperCurrentIndex == classId) {
            return;
        };
        this.setData({
            swiperCurrentIndex: classId,
            messageArr: [],
            praiseId: '',
            showBotTxt: 0,
        });
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.data.swiperCurrentIndex == 0 ? this.getMessageComData() : this.getMessageDianData()
    },

    // 滑动到底部
    bindscrolltolower: function () {
        if (this.cangetData) {
            this.page++;
            this.data.swiperCurrentIndex == 0 ? this.getMessageComData() : this.getMessageDianData()
        }
    },

    // 得到评论内容
    getMessageComData: function() {
        util.loding('Loading');
        let _this = this;
        let getMessageComDataUrl = loginApi.domin + '/home/index/message';
        loginApi.requestUrl(_this, getMessageComDataUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function(res) {
            wx.hideLoading();
            if (res.status == 1) {

                for (let i = 0; i < res.comments.length; i++) {
                    res.comments[i].imgurl = res.comments[i].imgurl.split(',');
                };

                _this.setData({
                    messageArr: _this.data.messageArr.concat(res.comments),
                });
                _this.cangetData = true;
                if (res.comments.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        showBotTxt: 1,
                    });
                };
            }
        })
    },

    // 得到点赞内容
    getMessageDianData: function () {
        util.loding('Loading');
        let _this = this;
        let getMessageDianDataUrl = loginApi.domin + '/home/index/issupport';
        loginApi.requestUrl(_this, getMessageDianDataUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function (res) {
            wx.hideLoading();
            if (res.status == 1) {

                _this.setData({
                    messageArr: _this.data.messageArr.concat(res.supports),
                });
                _this.cangetData = true;
                if (res.supports.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        showBotTxt: 1,
                    });
                };
            }
        })
    },

    // 跳转详情页
    goToDetails: function (e) {
        let id = parseInt(e.currentTarget.dataset.id);
        wx.navigateTo({
            url: `/pages/details/details?conId=${id}`,
        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})