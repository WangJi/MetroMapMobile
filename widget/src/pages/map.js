import projectTypeSelector from './../components/service/projectTypeSelector';
import loadPublicMap from './../components/service/loadPublicMap';
import Project from './../components/Model/Project';



let tempTypeCode = '';
Project.getProjectTypes()
    .then(function() {
        return changeProjectType();
    })
    .then(() => {
        tempTypeCode = $api.getStorage('curProjectType'); //保存一下类型
        return Project.initAllProjectsCache();
    })
    .then(() => {
        $api.setStorage('curProjectType', tempTypeCode); //还原回去
    });

/** 改变了项目的类型之后 */
function changeProjectType(typeCode) {
    return Project.getProjectsByType(typeCode)
        .then(function() {
            return Project.getProjectsInCity($api.getStorage('cityNameList')[0]); //获取第一个城市的线路和项目
        })
        .then(function(city) {
            return loadPublicMap.init(city.name) //初始化地图
                .then(function() {
                    loadPublicMap.loadProjects(city);
                });
        });
}

function changeProjectTypeAndCity(typeCode, cityName) {
    return Project.getProjectsByType(typeCode)
        .then(function() {
            return Project.getProjectsInCity(cityName);
        })
        .then(function(city) {
            return loadPublicMap.init(city.name) //初始化地图
                .then(function() {
                    loadPublicMap.loadProjects(city);
                });
        });
}

api.addEventListener({
    name: 'projectTypeAndCityChanged'
}, function(ret, err) {
    let data = ret.value;
    changeProjectTypeAndCity(data.typeCode, data.cityName);

});

//当用户请求项目类型更改
api.addEventListener({
    name: 'changeProjectType'
}, function(ret, err) {
    setTimeout(function() {
        let typeCode = ret.value;
        changeProjectType(typeCode);
    }, 300);
});


//用户请求城市改变
api.addEventListener({
    name: 'locationToolClicked'
}, function(ret, err) {
    projectTypeSelector.openSelector();
});

//用户请求项目等级改变
api.addEventListener({
    name: 'changeProjectLevel'
}, function(ret, err) {
    Project.getProjectsInCity()
        .then(function(city) {
            loadPublicMap.loadProjects(city);
        });
});


//用户请求显示某条线路的所有项目
api.addEventListener({
    name: 'displayLine'
}, function(ret, err) {
    Project.getLine()
        .then(function(line) {
            loadPublicMap.loadLine(line);
        });
});

api.addEventListener({
    name: 'selectProject'
}, function() {
    let prj = Project.findProjectById();
    loadPublicMap.zoomToProject(prj)
        .then(function() {
            api.openWin({
                name: 'projectMask_win',
                url: 'widget://html/map/projectMask/projectMask_win.html',
                animation: {
                    type: 'none',
                    subType: "from_bottom",
                    duration: 300
                },
                bgColor: 'rgba(0,0,0,0)',
                // delay: 200
            });

            setTimeout(function() {

                loadPublicMap.hide();
            }, 500);
        })
});

api.addEventListener({
    name: 'backToMap'
}, function() {
    loadPublicMap.show();
});