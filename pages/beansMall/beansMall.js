import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        mallArr: [],
    },

    onLoad: function(options) {
        this.page = 1;
        this.rows = 6;
        this.cangetData = true;
        this.getMallGoods();
    },

    onShow: function() {
        this.getuserbeans();
    },

    onHide: function() {

    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    // 滑动到底部
    onReachBottom: function() {
        if (this.cangetData) {
            this.page++;
            this.getMallGoods();
        }
    },

    nowExchange: function(e) {
        let beans = parseInt(e.currentTarget.dataset.beans);
        let id = parseInt(e.currentTarget.dataset.id);
        if (this.data.userBeans < beans) {
            util.toast("句豆不足,快去赚句豆吧!");
            return;
        };
        this.exchangeBeans(id);
    },

    getuserbeans: function() {
        util.loding('Loading');
        let _this = this;
        let getuserbeansUrl = loginApi.domin + '/home/index/query';
        loginApi.requestUrl(_this, getuserbeansUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
        }, function(res) {
            wx.hideLoading();
            if (res.status == 1) {
                _this.setData({
                    userBeans: res.beans,
                })
            }

        })
    },

    getMallGoods: function() {
        let _this = this;
        let releaseFunUrl = loginApi.domin + '/home/index/mall';
        loginApi.requestUrl(_this, releaseFunUrl, "POST", {
            "page": this.page,
            "len": this.rows,
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    mallArr: _this.data.mallArr.concat(res.contents),
                });
            }
        })
    },

    exchangeBeans: function(id) {
        util.loding('Loading');
        let _this = this;
        let getuserbeansUrl = loginApi.domin + '/home/index/pay';
        loginApi.requestUrl(_this, getuserbeansUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
            "id":id,
        }, function(res) {
            wx.hideLoading();
            if (res.status == 1) {
                _this.getuserbeans();
                wx.showModal({
                    title: '提示',
                    content: '兑换成功',
                    showCancel: false,
                    success: function (res) {}
                })  
            }else if(res.status==0){
                _this.getuserbeans();
                wx.showModal({
                    title: '提示',
                    content: res.contents,
                    showCancel: false,
                    success: function (res) {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    }
                })
            }

        })
    },

    maskeclick: function() {
        util.toast("敬请期待！", 1200)
    },

    // 收集formid
    formSubmit: function(e) {
        util.formSubmit(app, e);
    },
})