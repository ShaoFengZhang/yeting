import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        beansArr: [],
        showBotTxt: 0,
    },

    onLoad: function(options) {
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.getBeansSource();
    },

    onShareAppMessage: function() {
        return util.shareObj
    },

    onReachBottom: function() {
        if (this.cangetData){
            this.page++;
            this.getBeansSource();
        }
    },

    getBeansSource: function() {
        let _this = this;
        let getBeansSourceUrl = loginApi.domin + '/home/index/source';
        loginApi.requestUrl(_this, getBeansSourceUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    beansArr: _this.data.beansArr.concat(res.contents),
                });
                _this.cangetData = true;
                if (res.contents.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        showBotTxt: 1,
                    });
                };
            }

        })
    }
})