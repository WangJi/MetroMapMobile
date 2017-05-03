import predefinedCityList from './predefinedCityList';
import Project from './../Model/Project';
var service = {
    map: null,
    _annotations: [], //地图marker的缓存,
    get _maxMarkerCount() {
        return $api.getStorage('maxMarkerCount') || 20;
    },
    get isInitialized() {
        return this.map !== null;
    },
    _findCenter: function(cityName) { //城市的中心,如果有项目的话,取项目的平均值,否则用的是预定义的城市的中心
        var city = predefinedCityList.find(s => {
            return s.name === cityName;
        });
        if (city) {
            return {
                lon: city.center[1],
                lat: city.center[0]
            }
        } else {
            return {
                lon: 121.4737701,
                lat: 31.1881336
            };
        }
    },
    init: function(cityName) { //初始化地图到某个城市
        let _this = this;
        return new Promise(function(resolve) {
            if (!_this.isInitialized) {
                var aMap = _this.map = api.require('aMap');
                aMap.showUserLocation({
                    isShow: false
                });
                aMap.open({
                    rect: {
                        x: 0,
                        y: $api.paddingTop(),
                        w: api.winWidth,
                        h: api.winHeight
                    },
                    zoomLevel: 15,
                    center: _this._findCenter(cityName),
                    fixed: true
                }, function() {
                    aMap.setLogo({
                        position: 'right'
                    });
                    resolve();
                });
            } else {
                resolve();
            }
        })
    },
    clearAnnotations: function() { //清除地图上所有的marker
        let _this = this;
        if (_this._annotations.length) {
            _this.isInitialized && _this.map.removeAnnotations({
                ids: _this._annotations.map(function(an) {
                    return an.id
                })
            });
            _this._annotations.length = 0; //清空之前的标注
        }
    },
    _averageCenter: function() { //取makerList的中心
        let sumLon = 0;
        let sumLat = 0;
        for (let ano of this._annotations) {
            sumLon += ano.lon;
            sumLat += ano.lat;
        }
        return {
            lon: sumLon / this._annotations.length,
            lat: sumLat / this._annotations.length
        };
    },
    loadLine: function(line) {
        let _this = this;
        let annotations = [];
        _this.clearAnnotations();
        line.projects.forEach(function(prj) {
            annotations.push({
                id: prj.prjId,
                lon: prj.center.lng,
                lat: prj.center.lat,
            });
        });
        _this._annotations = annotations;
        _this.map.setCenter({
            coords: _this._averageCenter(),
            animation: false
        });
        _this.map.setZoomLevel({
            level: 12,
            animation: false
        });
        _this.map.addAnnotations({
            annotations: annotations,
            draggable: false,
            icons: ['widget://image/marker.png']
        }, function(ret) {
            if (ret.eventType == 'click') {
                //发生点击事件 ret.id 项目的prjid
                let prj = Project.findProjectById(ret.id);
                $api.setStorage('curProject', prj);
                api.sendEvent({
                    name: 'selectProject',
                    extra: prj.prjId
                });
            }
        });
        service._toast(`已加载所有${line.name}项目`);
    },
    loadProjects: function(city) { //按城市加载项目
        let _this = this;
        let annotations = [];
        _this.clearAnnotations();
        city.lines.forEach(function(line) {
            line.projects.forEach(function(prj) {
                annotations.push({
                    id: prj.prjId,
                    lon: prj.center.lng,
                    lat: prj.center.lat,
                });
            });
        });
        if (!annotations.length) {
            _this.map.setCenter({
                coords: _this._findCenter(city.name),
                animation: false
            });
            _this._toast(`没有找到等级为${$api.getStorage('curProjectLevel')}的项目`);
            _this._loadWidgets();
            return;
        }
        if (annotations.length > _this._maxMarkerCount) {
            annotations = annotations.slice(0, _this._maxMarkerCount); //项目太多,地图上显示有性能问题,取前MaxCount个
        }
        _this._annotations = annotations;
        _this.map.setCenter({
            coords: _this._averageCenter(),
            animation: false
        });
        _this.map.setZoomLevel({
            level: 12,
            animation: false
        });
        _this.map.addAnnotations({
            annotations: annotations,
            draggable: false,
            icons: ['widget://image/marker.png']
        }, function(ret) {
            if (ret.eventType == 'click') {
                //发生点击事件 ret.id 项目的prjid
                let prj = Project.findProjectById(ret.id);
                $api.setStorage('curProject', prj);
                api.sendEvent({
                    name: 'selectProject',
                    extra: prj.prjId
                });
            }
        });
        _this._loadWidgets();

    },
    zoomToProject: function(prj) { //加载单个项目

        let center = {
            id: prj.prjId,
            lon: prj.center.lng,
            lat: prj.center.lat,
        };
        service.map.setCenter({
            coords: center,
            animation: true
        });
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, 500);
        })
    },
    _toast: function(msg) { //太多的marker,只显示20个
        api.openFrame({
            name: 'mapToast_frm',
            url: 'widget://html/map/mapToast_frm.html',
            bounces: false,
            pageParam: {
                msg
            },
            reload: true,
            rect: {
                x: 0,
                y: $api.paddingTop(),
                w: 'auto',
                h: 'atuo'
            }
        });
    },
    _halfScreen: function() { //半屏幕
        service.map.setRect({
            rect: {
                x: 0,
                y: $api.paddingTop(),
                w: api.winWidth,
                h: api.winHeight / 2
            },
        });
        api.closeFrame({
            name: 'mapToolbar_frm'
        });
        api.closeFrame({
            name: 'mapSearchBar_frm'
        });
    },
    hide: function() {
        // api.closeFrame({
        //     name: 'mapToolbar_frm'
        // });
        // api.closeFrame({
        //     name: 'mapSearchBar_frm'
        // });
        service.map.hide();
    },
    show: function() {
        service.map.show();
        service.map.setRect({
            rect: {
                x: 0,
                y: $api.paddingTop(),
                w: api.winWidth,
                h: api.winHeight
            },
        });
        service._loadWidgets();
    },
    _loadWidgets: function() { //地图的附加层,地图是内置的,只能添加frame附加层到其上面,当做是地图的控件,依靠事件来相互通信,
        api.openFrame({
            name: 'mapSearchBar_frm',
            url: 'widget://html/map/mapSearchBar_frm.html',
            bounces: false,
            rect: {
                x: 0,
                y: $api.paddingTop() + 10,
                w: 'auto',
                h: 55
            }
        });

        api.openFrame({
            name: 'mapToolbar_frm',
            url: 'widget://html/map/mapToolbar_frm.html',
            bounces: false,
            rect: {
                x: 0,
                y: api.winHeight - 220,
                w: 60,
                h: 240
            }
        });
    }
};
export default service;