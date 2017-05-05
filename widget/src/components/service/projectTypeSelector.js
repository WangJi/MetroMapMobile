import Project from './../Model/Project';

let service = {
    selector: null,
    _data: null,
    _activeTypeIndex: 0,
    _activeCityIndex: 0,
    _prepareData() {
        let typeList = $api.getStorage('projectTypeList');
        let curTypeCode = $api.getStorage('curProjectType');
        let cityName = $api.getStorage('curCity');
        service._data = typeList.map((type, i) => {
            let cache = $api.getStorage(type.typeCode);
            if (type.typeCode === curTypeCode) {
                service._activeTypeIndex = i;
            }
            return {
                name: type.typeName,
                id: type.typeCode,
                sub: cache.map((city, j) => {
                    if (city.name === cityName) {
                        service._activeCityIndex = j;
                    }
                    return {
                        name: city.name
                    }
                })
            };
        });
        return service._data;
    },
    openSelector() {
        return new Promise(resolve => {
            let UIActionSelector = service.selector = api.require('UIActionSelector');
            let data = service._prepareData();
            UIActionSelector.open({
                datas: data,
                layout: {
                    row: 3,
                    col: 2,
                    height: 40,
                    size: 12,
                    sizeActive: 14,
                    rowSpacing: 3,
                    colSpacing: 10,
                    maskBg: 'rgba(0,0,0,0.3)',
                    bg: '#fff',
                    color: '#888',
                    colorActive: '#3E8AFD',
                    colorSelected: '#3E8AFD'
                },
                animation: true,
                cancel: {
                    text: '取消',
                    size: 12,
                    w: 90,
                    h: 35,
                    bg: '#fff',
                    bgActive: '#ccc',
                    color: '#888',
                    colorActive: '#fff'
                },
                ok: {
                    text: '确定',
                    size: 12,
                    w: 90,
                    h: 35,
                    bg: '#3E8AFD',
                    bgActive: '#3E8AFD',
                    color: '#fff',
                    colorActive: '#fff'
                },
                actives: [service._activeTypeIndex, service._activeCityIndex],
                title: {
                    text: '选择类型与城市',
                    size: 12,
                    h: 44,
                    bg: '#fafafa',
                    color: '#888'
                },
                // fixedOn: api.frameName
            }, function(ret, err) {
                if (ret.eventType === 'ok') {
                    api.sendEvent({
                        name: 'projectTypeAndCityChanged',
                        extra: {
                            typeCode: ret.selectedInfo[0].id,
                            cityName: ret.selectedInfo[1].name
                        }
                    });
                }
            });
            resolve();
        })
    }
};

export default service;