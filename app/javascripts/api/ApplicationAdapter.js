var location = (function () {
    if(window.location.hostname === 'localhost') {
        return 'http://localhost:9000';
    }

    return 'http://gatheringapi.herokuapp.com';
}());

MTG.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: location,
    serializer: MTG.ApplicationSerializer,

    buildURL: function (type, id) {
        var url = '%@/%@/'.fmt(this.namespace, type);

        if (id) {
            url += '%@/'.fmt(id);
        }

        return url;
    },
});
