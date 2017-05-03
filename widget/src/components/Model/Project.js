//主题色 #3E8AFD

//事件对象有:
//changeLine:选择了线路  line:object<Line>
//changeProjectLevel:改变了当前要显示的项目等级 projectLevel:string
//changeCity:改变了当前城市  cityName:string
//changeProjectType:改变了当前的项目类型  typeCode:string
//displayLine 
//selectProject prjId:int

//缓存对象有:
//projectTypeList----Array<{typeName,typeCode}>:所有的权限下的typeList
//curProjectType----{typeName,typeCode}:当前的项目类型
//curCity--- <string>当前的城市名字,没有的话取当前的城市的第一个
//cityNameList:当前类型下的城市名称
//{typeCode}:对应这个typeCode的所有城市List
//curProjectLevel:当前的项目等级,图标太多,分成按等级渲染,默认为特级
//maxMarkerCount:地图上最多显示的点
//curLine:用户选择的当前的线路
//curProject:当前的项目


class Project {

    /** 当前缓存的城市 */
    static get cacheCity() {
        let cityName = $api.getStorage('curCity') || $api.getStorage('cityNameList')[0];
        let typeCode = $api.getStorage('curProjectType');
        let cachedCityList = $api.getStorage(typeCode);
        let targetCity = cachedCityList.find(function(item) {
            return item.name === cityName;
        });
        return targetCity;
    }

    /** 从缓存中拉取城市项目,并且按照项目等级筛选 */
    static getProjectsInCity(cityName) {
        cityName = cityName || $api.getStorage('curCity') || $api.getStorage('cityNameList')[0];
        $api.setStorage('curCity', cityName);
        let curProjectLevel = $api.getStorage('curProjectLevel') || '特级';

        $api.setStorage('curProjectLevel', curProjectLevel);
        return new Promise(function(resolve) {
            let targetCity = Project.cacheCity;
            targetCity.lines.forEach(function(line) {
                line.projects = line.projects.filter(function(project) {
                    return project.prjLevel === curProjectLevel;
                });
            });
            resolve(targetCity);
        });
    }

    /** 获取项目 */
    static getProjectsByType(typeCode) {
        typeCode = typeCode || $api.getStorage('curProjectType') || $api.getStorage('projectTypeList')[0].typeCode;
        $api.setStorage('curProjectType', typeCode);

        return new Promise(function(resolve) {
            let cachedCityList = $api.getStorage(typeCode);
            // let cachedCityList = Project.cache[typeCode];
            if (!cachedCityList) { //不在缓存中
                let url = `https://yuntu.ce-safe.com/api/projects?type=${typeCode}`;
                $api.get(url, function(cityList) {
                    let cityNameList = cityList.map(function(item) {
                        return item.name
                    });
                    $api.setStorage('cityNameList', cityNameList); //储存当前的城市列表
                    $api.setStorage(typeCode, cityList);
                    // Project.cache[typeCode] = cityList;
                    Project.curCityList = cityList;
                    resolve(cityList);
                });
            } else {
                let cityNameList = cachedCityList.map(function(item) {
                    return item.name
                });
                $api.setStorage('cityNameList', cityNameList); //储存当前的城市列表
                resolve(cachedCityList);
            }

        });
    }

    /** 获取项目的类型 */
    static getProjectTypes() {
        let url = `https://yuntu.ce-safe.com/metro/project/authorizedProjectTypes`;
        return new Promise(function(resolve) {
            $api.get(url, function(typeList) {
                $api.setStorage('projectTypeList', typeList);
                resolve(typeList);
            });
        });
    }

    /** 当前线路 */
    static getCurLine() {
        return $api.getStorage('curLine');
    }

    /** 查找线路 */
    static getLine(lineName) {
        return new Promise(function(resolve) {
            if (!lineName) {
                resolve(Project.getCurLine());
            } else {
                Project.getProjectsInCity()
                    .then(function(targetCity) {
                        let targetLine = targetCity.lines.find(function(line) {
                            return line.name === lineName;
                        });
                        resolve(targetLine);
                    })
            }
        })
    }

    /** 根据项目的id寻找项目 */
    static findProjectById(prjId) {
        if (!prjId) return $api.getStorage('curProject'); //如果不提供prjId就找当前的project
        let targetCity = Project.cacheCity;
        let temp = null;
        targetCity.lines.some(line => {
            return line.projects.some(prj => {
                if (prj.prjId === prjId) {
                    temp = prj;
                    return true;
                }
                return false;
            });
        });
        return temp;
    }
}

export default Project;