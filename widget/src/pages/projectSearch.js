import predefinedLineColor from './../components/service/predefinedLineColor';

let curCity = (function() {
    let typeCode = $api.getStorage('curProjectType');
    let cachedCityList = $api.getStorage(typeCode);
    let cityName = $api.getStorage('curCity')
    let targetCity = cachedCityList.find(function(item) {
        return item.name === cityName;
    });
    targetCity.lines.forEach(function(line) {
        if (predefinedLineColor[cityName]) {
            line.color = predefinedLineColor[cityName][line.name];
        } else {
            line.color = "#333";
        }
    });
    return targetCity;
})();
const itemCount = 6;
let step = 0;
let linesGroup = [];
while (step * itemCount < curCity.lines.length) {
    linesGroup.push(curCity.lines.slice(step * itemCount, (step + 1) * itemCount));
    step++;
}
new Vue({
    el: '#app',
    data: {
        searchTxt: '',
        curCity: curCity,
        linesGroup: linesGroup
    },
    methods: {
        search(event) {
            event.target.blur();
        },
        selectLine(line) {
            api.openWin({
                name: 'line_win',
                url: 'widget://html/line/line_win.html',
                bounces: false,
                animation: {
                    type: 'movein',
                    subType: "from_right", //动画子类型（详见动画子类型常量）
                    duration: 300
                },
                pageParam: {
                    lineName: line.name
                }

            });
            $api.setStorage('curLine', line);
            api.sendEvent({
                name: 'changeLine',
                extra: line
            });
        }
    },
    mounted: function() {
        new auiSlide({
            container: document.getElementById("aui-slide"),
            "speed": 200,
            "pageShow": true,
            "height": 220, //高度
            "pageStyle": 'dot',
            "loop": false,
            'dotPosition': 'center'
        });
        api.parseTapmode();
    }
});