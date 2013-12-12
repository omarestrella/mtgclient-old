MTG.ApplicationSerializer = DS.RESTSerializer.extend({
    extractSingle: function (store, type, payload, id, requestType) {
        var data = {};
        data[type.typeKey] = payload;
        
        return this._super(store, type, payload, id, requestType);
    },

    extractArray: function (store, type, payload) {
        var data = {},
            dataKey = Ember.String.pluralize(type.typeKey);

        data[dataKey] = payload.results;

        return this._super(store, type, data);
    },

    rootJSON: function (json, type, pluralize) {
        var root = this.rootForType(type);
        
        if (pluralize === 'pluralize') {
            root = this.pluralize(root);
        }
        
        var rootedJSON = {};
        rootedJSON[root] = json;
        
        return rootedJSON;
    },

    normalize: function (type, payload, property) {
        for(var prop in payload) {
            if (payload.hasOwnProperty(prop)) {
                payload[prop.camelize()] = payload[prop];
            }
        }

        return this._super(type, payload, property);
    },

    extractMeta: function(store, type, payload) {
        if (payload && payload.next) {
            var nextUrl = payload.next;
            store.metaForType(type, { next: payload.next.split('=')[1] });
            delete payload.next;
        }

        if (payload && payload.prev) {
            var prevUrl = payload.prev;
            store.metaForType(type, { next: payload.prev.split('=')[1] });
            delete payload.prev;
        }
    }
});