var route_loader = {};
var config = require('../config');
route_loader.init = function(app){
    console.log('router_route.init called');
    return initRoutes(app);
};
function initRoutes(app){
    var infoLen = config.route_info.length;
    console.log('routing module : ' + infoLen);
    for (var i = 0; i < infoLen; i++) {
        var curItem = config.route_info[i];
        var curModule = require(curItem.file);
        if(curItem.type === 'get'){
            console.log('=======get=======');
            app.get(curItem.path, curModule[curItem.method]);
        }else if(curItem.type === 'post'){
            console.log('========post=======');
            app.post(curItem.path, curModule[curItem.method]);
        }
        console.log('Routing module [%s] is Defined', curItem.method);
    }
}
module.exports = route_loader;