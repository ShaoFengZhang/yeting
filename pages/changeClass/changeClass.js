import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        classArr: []
    },

    onLoad: function(options) {
        this.getClass();
       
    },

    onShow: function() {

    },

    onHide: function() {

    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    // 
    closeClassView: function(e) {
        let id = e.currentTarget.dataset.id;
        wx.setStorageSync("classType", id)
        wx.navigateBack({
            delta: 1
        })
    },

    //获取分类
    getClass: function() {
        util.loding('加载中');
        let _this = this;
        let getClassUrl = loginApi.domin + '/home/index/newtype';
        loginApi.requestUrl(_this, getClassUrl, "POST", {}, function(res) {
            wx.hideLoading();
            if (res.status == 1) {
                _this.setData({
                    classArr: res.type.slice(4)
                });
            }
        })
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },
})