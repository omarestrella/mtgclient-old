var location = (function () {
    if (window.location.hostname === 'localhost') {
         return 'http://localhost:9000';
    }

    return 'http://gatheringapi.herokuapp.com';
}());

MTG.Ajax = Ember.Object.create({
    get: function (key) {
        if(arguments.length > 1) {
            return this._get.apply(this, arguments);
        }

        return Ember.get(this, key);
    },

    _get: function (path, data) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            Ember.$.get(location + path, data).then(
                function (data) {
                    resolve(data);
                },

                function (data) {
                    reject(data);
                }
            );
        });
    },

    post: function (path, data) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
             Ember.$.post(location + path, data).then(
                function (data) {
                    resolve(data);
                },

                function (data) {
                    reject(data);
                }
            );
        });
    }
});
