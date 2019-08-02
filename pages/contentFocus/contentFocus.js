import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        contentArr: [],
        apiHaveLoad: 0,
        ifloadtxt: 0,
    },

    onLoad: function (options) {
        
    },

    onTabItemTap:function(){
        let _this = this;
        this.page = 1;
        this.rows = 20;
        this.cangetData = true;
        this.setData({
            contentArr: [],
            apiHaveLoad: 0,
            ifloadtxt: 0,
        })
        this.getContent();
    },

    onShow: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } 
    },

    // 分享
    onShareAppMessage: function (e) {
        if (e.from == "menu") {
            return util.shareObj
        } else {
            let index = e.target.dataset.index;
            this.shareNum(this.data.contentArr[index].id, index)
            return {
                title: this.data.contentArr[index].title,
                path: `/pages/index/index?uid=${wx.getStorageSync("u_id")}&type=2`,
                imageUrl: this.data.contentArr[index].imgurl
            }
        }
    },


    // 获取授权信息
    getUserInfo: function (e) {
        console.log(e);
        if (!e.detail.userInfo) {
            util.toast("我们需要您的授权哦亲~", 1200)
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
        loginApi.checkUserInfo(app, e.detail, iv, encryptedData, session_key)
    },

    // 加载上一页
    onPullDownRefresh: function () {
        console.log("onPullDownRefresh")
        let _this = this;
        this.page == 1;
        this.setData({
            contentArr: [],
        })
        this.getContent(this.data.classType);
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.bottomTime = setTimeout(() => {
                this.getContent(this.data.classType);
            }, 1000)

        }
    },

    // 获取首页数据
    getContent: function (type) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/myfocus';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            uid: wx.getStorageSync('u_id'),
        }, function (res) {
            if (res.status == 1) {
                if (res.contents.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        ifloadtxt: 0,
                        apiHaveLoad: 1,
                    });
                } else {
                    _this.setData({
                        ifloadtxt: 1,
                        apiHaveLoad: 1,
                    });
                }

                if (res.contents.length == 0) {
                    _this.cangetData = false;
                    _this.page == 1 ? null : _this.page--;
                    util.toast("暂无更多更新");
                    return;
                };
                for (let i = 0; i < res.contents.length; i++) {
                    if (i < res.collection.length) {
                        if (res.collection[i].contentid == res.contents[i].id) {
                            res.contents[i].havcollection = true;
                        }
                    }

                }
                _this.setData({
                    contentArr: _this.data.contentArr.concat(res.contents),
                    apiHaveLoad: 1,
                });
            }
        })
    },

    // 收藏
    collectionFun: function (e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: id
        }, function (res) {
            if (res.status == 1) {
                console.log(res);
                _this.data.contentArr[index].collection++;
                _this.data.contentArr[index].havcollection = true;
                _this.setData({
                    contentArr: _this.data.contentArr
                })
            }
        })
    },

    // 取消收藏
    delcollectionFun: function (e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newdelcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: id
        }, function (res) {
            if (res.status == 1) {
                console.log(res);
                _this.data.contentArr[index].collection--;
                _this.data.contentArr[index].havcollection = false;
                _this.setData({
                    contentArr: _this.data.contentArr
                })
            }
        })
    },


    catchtap: function () { },

    // 分享次数
    shareNum: function (contentid, index) {
        let _this = this;
        let shareNumUrl = loginApi.domin + '/home/index/share';
        loginApi.requestUrl(_this, shareNumUrl, "POST", {
            contentid: contentid,
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr[index].share++
                _this.setData({
                    contentArr: _this.data.contentArr,
                });
            }
        })
    },

    // 下载次数
    downloadNum: function (contentid, index) {
        let _this = this;
        let downloadNumUrl = loginApi.domin + '/home/index/download';
        loginApi.requestUrl(_this, downloadNumUrl, "POST", {
            contentid: contentid,
        }, function (res) {
            if (res.status == 1) {
                _this.data.contentArr[index].download++
                _this.setData({
                    contentArr: _this.data.contentArr,
                });
            }
        })
    },

    // 跳转详情页
    goToDetails: function (e) {
        let {
            id,
            typeid
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/details/details?contentid=${id}&typeid=${typeid}`,
        })
    },

    // 跳转个人主页
    goToUserHome: function (e) {
        let uid = e.currentTarget.dataset.uid
        wx.navigateTo({
            url: `/pages/userCenter/userCenter?uid=${uid}`,
        })
    },


    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

    // 点击下载图片
    uploadImage: function (src, index) {
        let _this = this;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveImage(src, index);
                        },
                        // 拒绝授权时
                        fail() {
                            _this.saveImage(src, index);
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveImage(src, index);
                }
            },
            fail(res) {
                _this.saveImage(src, index);
            }
        })

    },

    // 保存图片
    saveImage: function (src, index) {
        let _this = this;
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
            filePath: src,
            success: function () {
                _this.downloadNum(_this.data.contentArr[index].id, index)
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
                _this.downloadNum(_this.data.contentArr[index].id, index)
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
})