import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        ifshowrulesView:0,
        userBeans:0,
    },

    onLoad: function(options) {
        
    },

    onShow: function() {
        this.getMyDate();
        this.getuserbeans();
    },

    onHide: function() {

    },

    onTabItemTap: function() {
        try {
            wx.removeStorageSync('classId');
            wx.removeStorageSync('className');
        } catch (e) {

        }
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
       
    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    showbeansMask:function(){
        this.setData({
            ifshowrulesView: !this.data.ifshowrulesView
        });
        // if (!this.data.ifshowrulesView){
        //     wx.showTabBar({
        //         animation: true
        //     });
        // }else{
        //     wx.hideTabBar({
        //         animation:true
        //     });
        // }
    },

    getUserInfo:function(e){
        console.log(e);
        let _this=this;
        if (!e.detail.userInfo){
            util.toast("微信授权没有风险哦亲~",1200)
            return
        }
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
        let iv = e.detail.iv;
        let encryptedData = e.detail.encryptedData;
        let session_key = app.globalData.session_key;
        loginApi.checkUserInfo(app, e.detail, iv, encryptedData, session_key,function(){
            _this.getMyDate();
        });
    },

    getMyDate: function() {
        util.loding('加载中');
        let _this = this;
        let getMyDateUrl = loginApi.domin + '/home/index/getuserinfos';
        loginApi.requestUrl(_this, getMyDateUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function(res) {
            wx.hideLoading();
            if (res.status == 1) {
                // 获赞处理
                if (parseInt(res.userinfo.support)>10000){
                    let num = parseInt(res.userinfo.support);
                    res.userinfo.support = (Math.floor(num / 1000)/10)+'w+'
                };
                // 关注
                if (parseInt(res.userinfo.focu)>10000) {
                    let num = parseInt(res.userinfo.focu);
                    res.userinfo.focu = (Math.floor(num / 1000) / 10) + 'w+'
                };
                // 粉丝
                if (parseInt(res.userinfo.focus) > 10000) {
                    let num = parseInt(res.userinfo.focus);
                    res.userinfo.focus = (Math.floor(num / 1000) / 10) + 'w+'
                };

                _this.setData({
                    userInfos: res.userinfo,
                })
            }
        })
    },

    pageNav: function(e) {
        let navPath = e.currentTarget.dataset.path;
        wx.navigateTo({
            url: `${navPath}`,
        })
    },

    getuserbeans: function () {
        let _this = this;
        let getuserbeansUrl = loginApi.domin + '/home/index/query';
        loginApi.requestUrl(_this, getuserbeansUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    userBeans: res.beans,
                })
            }

        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})