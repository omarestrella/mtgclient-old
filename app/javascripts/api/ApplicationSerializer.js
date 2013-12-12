MTG.ApplicationSerializer = DS.RESTSerializer.extend({
    extractSingle: function (store, type, payload, id, requestType) {
        var data = {},
            dataKey = type.typeKey;

        data[dataKey] = payload;

        return this._super(store, type, data, id, requestType);
    },

    extractArray: function (store, type, payload) {
        var data = {},
            dataKey = Ember.String.pluralize(type.typeKey);

        data[dataKey] = payload;

        return this._super(store, type, data);
    }
});
