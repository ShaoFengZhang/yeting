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
        currentIndex:0,
        classArr:[],
    },

    onLoad: function(options) {
        let _this = this;

        this.setData({
            scrollHeight: (app.windowHeight + app.Bheight) * 750 / app.sysWidth - 804,
            // scrollHeight: (app.windowHeight) * 750 / app.sysWidth - 804,
            fontid:"moren",
        });
        _this.getFont();
        this.getClass();
    },

    onShow: function() {

    },

    catchtap: function() {},

    // 分享
    onShareAppMessage: function() {
        return util.shareObj
    },

    // 输入框输入时触发
    bindinput:function(e){
        console.log(e);
        let value = e.detail.value;
        console.log(util.check(value));
        this.setData({
            nowTxt: value,
            releaseId: this.data.picTypeid,
            haveEdittxt: 1,
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
        });
        if (index==3){
            return;
        }
        index == 1 ? this.getTxt(this.data.classArr[this.data.currentIndex].id) : this.getPicContent(this.data.classArr[this.data.currentIndex].id)
        
    },

    // 切换字体
    selectFont:function(e){
        let index = e.currentTarget.dataset.index;
        if (index == this.data.fontIndex){return};
        util.loding("切换中")
        let _this = this;
        this.setData({
            loadFont: 0,
            fontIndex:index,
        })
        wx.loadFontFace({
            family: 'mala Bold',
            source: `url("${this.data.fontArr[index].url}")`,
            success: function (res) {
                console.log(99999999999)
                _this.setData({
                    loadFont: 1,
                    fontid: _this.data.fontArr[index].id,
                });
                wx.hideLoading();
            },
            complete:function(res){
                console.log(res);
            },
            fail:function(res){
                console.log(res);
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '字体加载失败',
                    showCancel:false,
                    success(res) {
                       _this.setData({
                           fontid:'moren' 
                       })
                    }
                })
            }
        })
    },

    //得到字体
    getFont:function(){
        let _this = this;
        let getFontUrl = loginApi.domin + '/home/index/getfonts';
        loginApi.requestUrl(_this, getFontUrl, "POST", {
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    fontArr:res.fonts,
                });
            }
        })
    },

    //选文字
    selectTxt:function(e){
        let {index} = e.currentTarget.dataset;
        if (index == this.data.txtindex) { return };
        this.setData({
            txtindex: index,
            nowTxt:this.data.txtArr[index].title,
            txtid: this.data.txtArr[index].typeid,
            releaseId: this.data.txtArr[index].typeid,
            haveEdittxt: 0,
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
            releaseId: this.data.haveEdittxt ? this.data.picArr[index].typeid : this.data.releaseId,
        })
    },

    //选择分类
    switchClass:function(e){
        let index=e.currentTarget.dataset.index;
        if(index==this.data.currentIndex){
            return;
        };
        this.setData({
            currentIndex:index,
            releaseId: index == 1 ? this.data.classArr[index].id : this.data.releaseId,
            picindex: this.data.nowisTxt == 2 ? 0 : this.data.picindex,
            txtindex: this.data.nowisTxt == 1 ? 0 : this.data.txtindex,
        });
        this.data.nowisTxt == 1 ? this.getTxt(this.data.classArr[index].id) : this.getPicContent(this.data.classArr[index].id)
        
    },

    //发布
    releaseFun:function(){
        if (!util.check(this.data.nowTxt)) {
            util.toast("文字不能为空~", 1200);
            return;
        };
        util.loding('全速发布中~');
        let _this = this;
        let getTxtUrl = loginApi.domin + '/home/index/newuserrelease';
        loginApi.requestUrl(_this, getTxtUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "title": this.data.nowTxt,
            "imgurl": this.data.nowPic,
            "typeid": this.data.releaseId,
            "fontid":this.data.fontid,
        }, function (res) {
            if (res.status == 1) {
                _this.fabuzhitu(res.contentid, res.typeid)
                // _this.goToDetails(res.contentid,res.typeid,res.imgurl);
            }
        })
    },

    // 发布制图
    fabuzhitu: function (contentid, typeid) {
        util.loding('全速发布中~');
        let _this = this;
        let fabuzhituUrl = loginApi.domin + '/home/index/fabu';
        loginApi.requestUrl(_this, fabuzhituUrl, "POST", {
            "uid": wx.getStorageSync("u_id"),
            "contentid": contentid,
            "type": 1,
        }, function (res) {
            if (res.status == 1) {
                _this.goToDetails(contentid, typeid, res.path);
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
                releaseId:7,
            })
        });
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    //获取图片
    getPicContent: function (typeid){
        let _this = this;
        let getPicContentUrl = loginApi.domin + '/home/index/fixedpicture';
        loginApi.requestUrl(_this, getPicContentUrl, "POST", {
            typeid: typeid
        }, function (res) {
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
    getTxt: function (typeid){
        let _this = this;
        let getTxtUrl = loginApi.domin + '/home/index/fixedtext';
        loginApi.requestUrl(_this, getTxtUrl, "POST", {
            typeid: typeid
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    txtArr: res.text,
                    nowTxt: _this.data.haveEdittxt ? _this.data.nowTxt:res.text[0].title,
                    txtid: res.text[0].typeid,
                    releaseId: res.text[0].typeid,
                });
            }
        })
    },

    //获取分类
    getClass: function () {
        let _this = this;
        let getClassUrl = loginApi.domin + '/home/index/newtype';
        loginApi.requestUrl(_this, getClassUrl, "POST", {}, function (res) {
            if (res.status == 1) {
                res.type.pop();
                _this.setData({
                    classArr: res.type,
                });
                _this.getPicContent(res.type[0].id);
                _this.getTxt(res.type[0].id);
            }
        })
    },


    // 跳转详情页
    goToDetails: function (id,typeid,saveUrl) {
        wx.navigateTo({
            url: `/pages/details/details?contentid=${id}&typeid=${typeid}&saveUrl=${saveUrl}`,
        });
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