import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        srcDomin: loginApi.srcDomin +'/newadmin/Uploads/',
        txtArr:[],
        picArr:[],
        nowisTxt:1,
        txtindex:0,
        picindex: 0,
        nowTxt:'',
        nowPic:'201908/5d42b93a363aa.png', 
        apiHaveLoad:0,
    },

    onLoad: function(options) {
        let _this = this;

        this.setData({
            scrollHeight: (app.windowHeight + app.Bheight) * 750 / app.sysWidth - 954,
        });

        this.getPicContent();
        this.getTxt();
    },

    onShow: function() {

    },

    catchtap: function() {},

    // 分享
    onShareAppMessage: function() {
        return util.shareObj
    },

    //输入框失去焦点：
    bindblur:function(e){
        console.log(e);
        let value = e.detail.value;
        console.log(util.check(value));
        this.setData({
            nowTxt: value
        })
        if (!util.check(value)) {
            util.toast("请输入有效内容~", 1200);
            return;
        };
        
    },

    //文字和图片切换
    txtPicSwitch:function(e){
        let index=e.currentTarget.dataset.index;
        if (index == this.data.nowisTxt){return};
        this.setData({
            nowisTxt:index,
        })
    },

    //选文字
    selectTxt:function(e){
        let {index} = e.currentTarget.dataset;
        if (index == this.data.txtindex) { return };
        this.setData({
            txtindex: index,
            nowTxt:this.data.txtArr[index].title,
        })
    },

    //选图片
    selectPic:function(e){
        let { index } = e.currentTarget.dataset;
        if (index == this.data.picindex) { return };
        this.setData({
            picindex: index,
            nowPic: this.data.picArr[index].pic,
            picTypeid: this.data.picArr[index].typeid,
        })
    },

    //发布
    releaseFun:function(){
        if (!util.check(this.data.nowTxt)) {
            util.toast("文字不能为空~", 1200);
            return;
        };
        let _this = this;
        let getTxtUrl = loginApi.domin + '/home/index/newuserrelease';
        loginApi.requestUrl(_this, getTxtUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "title": this.data.nowTxt,
            "imgurl": this.data.nowPic,
            "typeid": this.data.picTypeid,
        }, function (res) {
            if (res.status == 1) {
                _this.goToDetails(res.contentid,res.typeid,res.imgurl)
            }
        })
    },

    // 上传图片
    changePic: function() {
        let _this = this;
        util.upLoadImage("newuploadimg", "image", 1, this, loginApi, function(data) {
            console.log(data);
            _this.setData({
                nowPic: data.imgurl,
                picindex:null,
                picTypeid:7,
            })
        });
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    //获取图片
    getPicContent:function(){
        let _this = this;
        let getPicContentUrl = loginApi.domin + '/home/index/fixedpicture';
        loginApi.requestUrl(_this, getPicContentUrl, "POST", {}, function (res) {
            if (res.status == 1) {
                _this.setData({
                    picArr: res.picture,
                    nowPic:res.picture[0].pic,
                    picTypeid: res.picture[0].typeid,
                    apiHaveLoad:1,
                });
            }
        })
    },

    //获取文字
    getTxt:function(){
        let _this = this;
        let getTxtUrl = loginApi.domin + '/home/index/fixedtext';
        loginApi.requestUrl(_this, getTxtUrl, "POST", {}, function (res) {
            if (res.status == 1) {
                _this.setData({
                    txtArr: res.text,
                    nowTxt: res.text[0].title
                });
            }
        })
    },

    // 跳转详情页
    goToDetails: function (id,typeid,saveUrl) {
        wx.navigateTo({
            url: `/pages/details/details?contentid=${id}&typeid=${typeid}&saveUrl=${saveUrl}`,
        })
    },

    // 点击下载图片授权检测
    uploadImage: function (src) {
        let _this = this;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveImage(src);
                        },
                        // 拒绝授权时
                        fail() {
                            _this.saveImage(src);
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveImage(src);
                }
            },
            fail(res) {
                _this.saveImage(src);
            }
        })

    },

    // 保存图片
    saveImage: function (src) {
        let _this = this;
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
            filePath: src,
            success: function () {
                util.toast('保存成功')
            },
            fail: function (data) {
                
            }
        })
    },

    // 点击下载图片
    drawcanvs: function () {
        util.loding('小句正在制作');
        let _this = this;
        let ctx = wx.createCanvasContext('canvas');
        let canvasImg = this.data.srcDomin+this.data.nowPic;
        let canTxt = this.data.nowTxt;
        ctx.setTextBaseline('top');
        ctx.setTextAlign('left');
        ctx.setFillStyle("#282828");
        wx.getImageInfo({
            src: canvasImg,
            success: function (res) {
                _this.setData({
                    bgimgH: 750,
                    bgimgW: 746,
                });
                ctx.drawImage(res.path, 0, 0, 750, 746);
                ctx.font = 'normal bold 46px sans-serif';
                let txtWidth = ctx.measureText(canTxt).width;
                for(let i=0;i<(txtWidth/630);i++){
                    let start=Math.ceil(canTxt.length / (txtWidth / 630))
                    ctx.fillText(canTxt.slice(start * i, start*(i+1)), 50, 366+i*70);
                }
                ctx.draw();
                setTimeout(function () {
                    _this.showOffRecord()
                }, 1200)
            }
        });
    },

    // 生成临时图片
    showOffRecord: function (index) {
        let _this = this;
        wx.canvasToTempFilePath({
            destWidth: this.data.bgimgW,
            destHeight: this.data.bgimgH,
            canvasId: 'canvas',
            success: function (res) {
                console.log(res.tempFilePath);
                _this.uploadImage(res.tempFilePath);
            }
        })
    },
})