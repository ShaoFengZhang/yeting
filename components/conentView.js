import loginApi from '../utils/login.js'
import util from '../utils/util.js'
const app = getApp();
Component({

    properties: {

        contentArr: {
            type: Array,
            value: {}
        },
        srcDomin: {
            type: String,
            value: '',
        },
        showBotTxt: {
            type: Boolean,
            value: 0,
        },

        hasUserInfo: {
            type: Boolean,
            value: false,
        },

        userInfo: {
            type: Object,
            value: {},
        },
    },

    data: {
        showBotTxt: 0,
        praiseId: "",
        pointAni: null,
        praiseEvent: 'praiseEvent',
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    },

    methods: {
        catchtap: function() {},

        goToQrCode:function(e){
            console.log(e)
            let id = e.currentTarget.dataset.id;
            let picUrl= e.currentTarget.dataset.icon;
            let txt= e.currentTarget.dataset.txt;
            wx.navigateTo({
                url: `/pages/poster2/poster2?contentID=${id}&picUrl=${picUrl}&txt=${escape(txt)}`,
            })
        },

        showTables: function(e) {
            let id = parseInt(e.currentTarget.dataset.id);
            console.log(id);
            // wx.navigateTo({
            //     url: `/pages/details/details?conId=${this.data.contentArr[index].id}`,
            // })
        },

        // 跳转详情页
        goToDetails: function(e) {
            let index = parseInt(e.currentTarget.dataset.index);
            wx.navigateTo({
                url: `/pages/details/details?conId=${this.data.contentArr[index].id}&index=${index+1}`,
            })
        },

        gotoUserHome: function(e) {
            let uid = e.currentTarget.dataset.uid;
            let openid = e.currentTarget.dataset.openid;
            let urlsrc = e.currentTarget.dataset.src;
            let name = e.currentTarget.dataset.name;
            let note = e.currentTarget.dataset.note;
            wx.navigateTo({
                url: `/pages/userCenter/userCenter?uid=${uid}&openid=${openid}&urlsrc=${urlsrc}&name=${name}&note=${note}`,
            })
        },

        // 动画
        crearteAnimation: function() {

            if (!this.canAni) {
                let _this = this;
                this.setData({
                    // praiseId: '',
                    pointAni: null,
                    praiseEvent: 'catchtap',
                })
                let pointAni = wx.createAnimation({
                    duration: 500,
                    timingFunction: "linear",
                });
                pointAni.scale(1.5, 1.5).step({
                    duration: 250,
                });
                pointAni.scale(1, 1).step({
                    duration: 250,
                });
                this.setData({
                    pointAni: pointAni.export(),
                });
                setTimeout(() => {
                    this.setData({
                        praiseEvent: 'praiseEvent',
                        praiseId: '',
                        pointAni: null,
                    })
                }, 600)
            }
        },

        praiseEvent: function(e) {
            this.setData({
                praiseId: '',
                pointAni: null,
                praiseEvent: 'catchtap',
            });
            let id = e.currentTarget.dataset.id;
            let index = e.currentTarget.dataset.index;
            if (this.data.contentArr[index].dianji) {
                this.setData({
                    praiseId: id,
                });
                this.crearteAnimation();
                return;
            }
            this.addpriseNum(id, index);
        },

        // 点赞请求
        addpriseNum: function(cid, index) {
            let _this = this;
            let addpriseNumUrl = loginApi.domin + '/home/index/support';
            loginApi.requestUrl(_this, addpriseNumUrl, "POST", {
                "id": cid,
                "openid": wx.getStorageSync("user_openID"),
                "uid": wx.getStorageSync("u_id"),
                "bopenid": this.data.contentArr[index].openid,
                "buid": this.data.contentArr[index].uid,
            }, function(res) {
                console.log(res);
                if (res.status == 1) {
                    let arr = _this.data.contentArr;
                    // console.log(arr[index])
                    arr[index].support = parseInt(arr[index].ySupport) + 1;
                    let num = parseInt(arr[index].support);
                    arr[index].ySupport = parseInt(arr[index].support);
                    arr[index].support>10000?arr[index].support = (Math.floor(num / 1000) / 10) + 'w+':""
                    arr[index].dianji = 1;
                    // console.log(arr[index]);
                    _this.setData({
                        contentArr: arr,
                        praiseId: cid,
                        pointAni: null,
                    });
                    res.new?"": _this.triggerEvent('showbeansMask')
                    _this.crearteAnimation();
                }
            })
        },

        // 获取用户信息
        getUserInfo: function(e) {
            this.triggerEvent('myevent', e.detail);
        },

        // 收集formid
        formSubmit: function(e) {
            util.formSubmit(app, e);
        }
    },
})