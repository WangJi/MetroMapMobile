import loadPublicMap from './../components/service/loadPublicMap';
import Project from './../components/Model/Project';

Project.getProjectTypes()
    .then(function() {
        return changeProjectType();
    });

/** 改变了项目的类型之后 */
function changeProjectType(typeCode) {
    Project.getProjectsByType(typeCode)
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
    name: 'changeCity'
}, function(ret, err) {
    let city = ret.value;
    Project.getProjectsInCity(city)
        .then(function(city) {
            loadPublicMap.loadProjects(city);
        });
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


    setTimeout(function() { loadPublicMap.hide(); }, 500);

});

api.addEventListener({
    name: 'backToMap'
}, function() {
    loadPublicMap.show();
});