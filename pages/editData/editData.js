import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userName: '',
        signature: '',
    },

    onLoad: function(options) {
        this.getMyDate();
    },

    onShow: function() {

    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    deleNickName:function(){
        this.setData({
            userName:'',
        })
    },

    // 更换头像
    changeUserIcon: function() {
        let _this = this;
        util.upLoadImage("uploadphoto", "photo", 1, this, loginApi, function(data) {
            _this.setData({
                avatarUrl: loginApi.domin + data.imgurl
            })
        });
    },

    // 昵称输入框输入时触发
    topbindinput: function(e) {
        let userName = e.detail.value;
        this.userName = e.detail.value;
        this.setData({
            userName: userName,
        });
    },

    // 签名输入时触发
    botbindinput: function(e) {
        let signature = e.detail.value;
        this.signature = e.detail.value;
        this.setData({
            signature: signature,
        })

    },

    // 保存用户资料
    saveUserInfo: function() {
        let _this = this;
        if (util.check(_this.userName)) {
            _this.saveFun()
        }else{
            util.toast('请输入正确的昵称', 1200);
            return;
        }
    },

    saveFun: function() {
        util.loding('保存中~');
        let _this = this;
        let saveUserInfoUrl = loginApi.domin + '/home/index/editor';
        loginApi.requestUrl(_this, saveUserInfoUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "nickName": this.userName,
            "photo": this.data.avatarUrl,
            "note": this.signature ? this.signature : '',
        }, function(res) {
            wx.hideLoading();
            console.log(res)
            if (res.status == 1) {
                util.toast('保存成功~', 1200);
            }
        })
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
                _this.setData({
                    userName: res.userinfo.name ? res.userinfo.name : app.globalData.userInfo.nickName,
                    avatarUrl: res.userinfo.photo ? res.userinfo.photo : app.globalData.userInfo.avatarUrl,
                    signature: res.userinfo.note,
                });
                _this.userName = _this.data.userName;
                _this.signature = _this.data.signature;
            }
        })
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

})