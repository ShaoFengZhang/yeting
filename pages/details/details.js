import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        contentArr:[],
        hotArr:[],
        apiHaveLoad:0,
    },

    onLoad: function(options) {
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;

        if (options && options.contentid){
            this.typeid = options.typeid;
            this.contentid = options.contentid;
            this.getContent(options.contentid);
            this.getHotArr(options.typeid);
        };

        if (options && options.saveUrl){
            this.checkPicLimits(options.saveUrl);
        }
        
    },

    onShow: function() {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        };
    },

    onShareAppMessage: function(e) {
        if (e.from == "menu") {
            return util.shareObj
        } else {
            this.shareNum(this.data.contentArr.id)
            return {
                title: this.data.contentArr.title,
                path: `/pages/index/index?uid=${wx.getStorageSync("u_id")}&type=2`,
                imageUrl: this.data.contentArr.imgurl
            }
        }
    },

    // 加载上一页
    onPullDownRefresh: function () {
        console.log("onPullDownRefresh")
        let _this = this;
        this.page = 1;
        this.setData({
            hotArr: [], 
        })
        this.getHotArr(this.typeid);
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.getHotArr(this.typeid);
        }
    },

    // 获取内容
    getContent:function(contentid){
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/newcontentone';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            id: contentid,
            uid: wx.getStorageSync('u_id'),
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    contentArr: res.models,
                    collection: res.collection,
                    apiHaveLoad:1,
                    focus:res.focus,
                    ifvideo: res.models.type==2?true:false,
                })
            }
        })
    },

    // 获取推荐
    getHotArr:function(typeid){
        let _this = this;
        let getHotArrUrl = loginApi.domin + '/home/index/album';
        loginApi.requestUrl(_this, getHotArrUrl, "POST", {
            typeid: typeid,
            page: this.page,
            len: this.rows,
        }, function (res) {
            if (res.status == 1) {
                if (res.content.length < _this.rows) {
                    _this.cangetData = false;
                }
                if (res.content.length == 0) {
                    _this.cangetData = false;
                    _this.page == 1 ? null : _this.page--;
                    util.toast("暂无更多更新");
                    return;
                };
                _this.setData({
                    hotArr: _this.data.hotArr.concat(res.content)
                })
            }
        })
    },

    // 收藏
    collectionFun: function () {
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: this.data.contentArr.id
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr.collection++;
                _this.setData({
                    contentArr: _this.data.contentArr,
                    collection:1,
                })
            }
        })
    },

    // 取消收藏
    delcollectionFun: function () {
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newdelcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: this.data.contentArr.id
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr.collection--;
                _this.setData({
                    contentArr: _this.data.contentArr,
                    collection: 0,
                })
            }
        })
    },

    // 关注
    fansFocus: function () {
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/addfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": _this.data.contentArr.openid,
            "buid": _this.data.contentArr.uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("关注成功", 1200);
                _this.setData({
                    focus: 1,
                })
            } else {
                util.toast("关注失败", 1200);
            }
        })
    },

    // 取消关注
    fansCancelFocus: function () {
        let _this = this;
        let fansFocusUrl = loginApi.domin + '/home/index/delfocus';
        loginApi.requestUrl(_this, fansFocusUrl, "POST", {
            "bopenid": _this.data.contentArr.openid,
            "buid": _this.data.contentArr.uid,
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
        }, function (res) {
            console.log(res);
            if (res.status == 1) {
                util.toast("取消关注", 1200)
                _this.setData({
                    focus: 0,
                })
            } else {
                util.toast("取消失败", 1200);
            }
        })
    },

    //刷新
    refresh:function(e){
        let { typeid, id } = e.currentTarget.dataset;
        if (id == this.contentid){
            return;
        }
        this.setData({
            apiHaveLoad:0,
            hotArr: [],
            contentArr: [], 
        });
        this.typeid =typeid;
        this.contentid = id;
        this.getContent(id);
        this.getHotArr(typeid);
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
        })
    },

    // 分享次数
    shareNum: function (contentid) {
        let _this = this;
        let shareNumUrl = loginApi.domin + '/home/index/share';
        loginApi.requestUrl(_this, shareNumUrl, "POST", {
            contentid: contentid,
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr.share++
                _this.setData({
                    contentArr: _this.data.contentArr,
                });
            }
        })
    },

    // 下载次数
    downloadNum: function (contentid) {
        let _this = this;
        let downloadNumUrl = loginApi.domin + '/home/index/download';
        loginApi.requestUrl(_this, downloadNumUrl, "POST", {
            contentid: contentid,
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr.download++
                _this.setData({
                    contentArr: _this.data.contentArr,
                });
            }
        })
    },


    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    //点击下载图片
    downloadPicture: function (e) {
        util.loding("全速下载中~")
        let _this = this;
        let contentid = this.data.contentArr.id;
        let uid = wx.getStorageSync("u_id");

        let downloadPictureUrl = loginApi.domin + '/home/index/downloads';
        loginApi.requestUrl(_this, downloadPictureUrl, "POST", {
            contentid: contentid,
            uid: uid,
            type: 1,
        }, function (res) {
            if (res.status == 1) {
                wx.getImageInfo({
                    src: _this.data.srcDomin + res.path,
                    success(res) {
                        _this.uploadImage(res.path)
                    }
                });
            }
        })

    },


    // 点击下载图片
    uploadImage: function (src) {
        let _this = this;
        wx.hideLoading();
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
                _this.downloadNum(_this.data.contentArr.id)
                wx.showModal({
                    title: '保存成功',
                    content: `记得分享哦~`,
                    showCancel: false,
                    success: function (data) {
                        wx.previewImage({
                            urls: [src]
                        })
                    }
                });
            },
            fail: function (data) {
                _this.downloadNum(_this.data.contentArr.id)
                wx.previewImage({
                    urls: [src]
                })
            }
        })
    },

    // 点击下载图片
    drawcanvs: function (e) {
        let {
            src,
            index
        } = e.currentTarget.dataset;
        util.loding('正在下载');
        let _this = this;
        let ctx = wx.createCanvasContext('canvas');
        let canvasImg = 'https://duanju.58100.com/upload/new/3.png';
        let qrcodeimg = `https://duanju.58100.com/upload/img/mala.jpg`;
        let canTxt = '扫码生成专属图片';
        ctx.setTextBaseline('top');
        ctx.setTextAlign('left');
        ctx.setFillStyle("#999999")
        ctx.setFontSize(40);

        wx.getImageInfo({
            src: canvasImg,
            success: function (res) {
                _this.setData({
                    bgimgH: res.height,
                    bgimgW: res.width,
                });
                ctx.drawImage(res.path, 0, 0, res.width, res.height);
                wx.getImageInfo({
                    src: qrcodeimg,
                    success: function (res1) {
                        ctx.fillText(canTxt, 192, 848);
                        ctx.setFillStyle("#282828");
                        ctx.fillText(app.globalData.userInfo.nickName, 192, 792);
                        ctx.drawImage(res1.path, 582, 786, 128, 128);
                        wx.getImageInfo({
                            src: app.globalData.userInfo.avatarUrl,
                            success: function (res2) {
                                // 绘制圆形头像
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(104, 850, 64, 0, 2 * Math.PI);
                                ctx.closePath();
                                ctx.clip();
                                ctx.drawImage(res2.path, 40, 786, 128, 128);
                                ctx.restore();
                                ctx.beginPath();
                                ctx.stroke();
                                wx.getImageInfo({
                                    src: src,
                                    success(res3) {
                                        ctx.drawImage('../../assets/new/mask.png', 30, 776, 150, 150);
                                        ctx.drawImage(res3.path, 0, 0, 750, 750);
                                        ctx.draw();
                                        setTimeout(function () {
                                            _this.showOffRecord(index)
                                        }, 1200)
                                    }
                                })

                            }
                        })
                    }
                })
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
                _this.uploadImage(res.tempFilePath, index);
            }
        })
    },

    // 发布完成检测授权
    checkPicLimits:function(src){
        let _this=this;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveReleasePic(src);
                        },
                        // 拒绝授权时
                        fail() {
                            console.log('未授权')
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveReleasePic(src);
                }
            },
            fail(res) {
                console.log('未授权')
            }
        })
    },

    // 保存发布的图片
    saveReleasePic:function(src){
        wx.getImageInfo({
            src: loginApi.srcDomin + '/newadmin/Uploads/'+src,
            success(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success: function () {
                        util.toast('发布成功，图片已保存')
                    },
                    fail:function(){
                        util.toast('发布成功！')
                    }
                })
            }
        })
    },

})