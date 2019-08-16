import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        ifshowInput:0,
        inputValue:'来麻辣短句，分享你的诗意',
        focusNum:0,
        focusUserArr:[],
        rewardView:0,
        showBotTxt:0,
        srcDomin: loginApi.srcDomin,
    },

    onLoad: function (options) {
        this.setData({
            qrcodeimg: `${loginApi.domin}/home/index/shares?page=pages/index/index&uid=${wx.getStorageSync('u_id')}`,
            usericon: app.globalData.userInfo.avatarUrl
        });
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.getFansData();
    },

    onShow: function () {

    },

    onHide: function () {

    },

    onShareAppMessage: function () {
        return util.shareObj
    },

    editorTxt:function(){
        this.setData({
            ifshowInput:1,
            inputValue:'',
        });
        this.inputValue=null;
    },

    bindinput:function(e){
        this.inputValue=e.detail.value;
    },

    saveTxt:function(){
        this.setData({
            inputValue: this.inputValue ? this.inputValue:'',
        })
        if (!util.check(this.data.inputValue)) {
            util.toast("输入不能为空哦亲~", 1200);
            this.setData({
                inputValue:'来麻辣短句，分享你的诗意',
            });
        };

        let inputValue=null;
        if (this.data.inputValue==""){
            inputValue ="来麻辣短句，分享你的诗意";
        }else{
            inputValue = this.data.inputValue
        }
        this.setData({
            ifshowInput: 0,
            inputValue: inputValue,
        })
    },

    closeReward:function(){
        this.setData({
            rewardView: !this.data.rewardView, 
        })
    },

    // 滑动到底部
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            this.getFansData();
        }
    },

    getFansData: function () {
        util.loding('Loading');
        let _this = this;
        let getFansDataUrl = loginApi.domin + '/home/index/myfans';
        loginApi.requestUrl(_this, getFansDataUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
            "page": this.page,
            "len": this.rows,
        }, function (res) {
            wx.hideLoading();
            if (res.status == 1) {
                _this.setData({
                    focusUserArr: _this.data.focusUserArr.concat(res.info),
                    focusNum:res.count,
                    showBotTxt: res.count?0:1,
                });
                _this.cangetData = true;
                if (res.info.length < _this.rows) {
                    _this.cangetData = false;
                };
            }

        })
    },


    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

    // 绘制Canvas
    drawcanvs: function () {
        util.loding('海报生成中')
        let _this = this;
        let ctx = wx.createCanvasContext('canvas');
        let canvasImg = 'https://duanju.58100.com/upload/3.png';
        let qrcodeimg = `${this.data.qrcodeimg}`;
        let canTxt = this.data.inputValue;
        ctx.setTextBaseline('top');
        ctx.setTextAlign('center');
        ctx.setFillStyle("#282828")
        ctx.setFontSize(40);

        wx.getImageInfo({
            src: canvasImg,
            success: function (res) {
                _this.setData({
                    bgimgH: res.height,
                    bgimgW: res.width,
                });
                ctx.drawImage(res.path, 0, 0, _this.data.bgimgW, _this.data.bgimgH);
                wx.getImageInfo({
                    src: qrcodeimg,
                    success: function (res1) {
                        ctx.fillText(canTxt, res.width/2, 260);
                        // 绘制圆形二维码
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(336, 130, 90, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(res1.path, 246, 40, 180, 180);
                        ctx.restore();
                        ctx.beginPath();
                        ctx.stroke();
                        wx.getImageInfo({
                            src: app.globalData.userInfo.avatarUrl,
                            success: function (res2) {
                                // 绘制圆形头像
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(336, 130, 38, 0, 2 * Math.PI);
                                ctx.closePath();
                                ctx.clip();
                                ctx.drawImage(res2.path, 298, 92, 76, 76);
                                ctx.restore();
                                ctx.beginPath();
                                ctx.stroke();
                                ctx.draw();
                                setTimeout(function(){
                                    _this.showOffRecord()
                                },1200)
                            }
                        })
                    }
                })
            }
        });
    },

    // 生成临时图片
    showOffRecord: function () {
        let _this = this;
        wx.canvasToTempFilePath({
            destWidth: this.data.bgimgW*2,
            destHeight: this.data.bgimgH*2,
            canvasId: 'canvas',
            success: function (res) {
                console.log(res.tempFilePath)
                _this.saveCanvas(res);
            }
        })
    },

    // 保存图片
    saveCanvas: function (res) {
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
                wx.showModal({
                    title: '海报生成成功',
                    content: `记得分享哦~`,
                    showCancel: false,
                    success: function (data) {
                        wx.previewImage({
                            urls: [res.tempFilePath]
                        })
                    }
                });
            },
            fail: function () {
                wx.previewImage({
                    urls: [res.tempFilePath]
                })
            }
        })
    },

    savePic: function () {
        let _this = this;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.drawcanvs()
                            // _this.showOffRecord() 
                        },
                        // 拒绝授权时
                        fail() {
                            _this.drawcanvs()
                            // _this.showOffRecord() 
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.drawcanvs()
                    // _this.showOffRecord()
                }
            },
            fail(res) {
                _this.drawcanvs()
                // _this.showOffRecord()
            }
        })

    },
})