var location = (function () {
    if(window.location.hostname === 'localhost') {
         return 'http://localhost:9000';
    }

    return 'http://gatheringapi.herokuapp.com';
}());

MTG.Ajax = Ember.Object.create({
    post: function (path, data) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var postData = {
                data: JSON.stringify(data)
            };

            Ember.$.post(location + path, postData).then(
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
