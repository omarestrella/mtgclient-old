var location = (function () {
    if(window.location.hostname === 'localhost') {
         return 'http://localhost:9000';
    }

    return 'http://gatheringapi.herokuapp.com';
}());

MTG.Session = Ember.Object.extend({
    user: null,
    token: null,

    init: function () {
        Ember.$.ajaxPrefilter(function(options, originalOptions, xhr) {
            options.xhrFields = {
                withCredentials: true
            };
        });
    },

    tokenCookie: function () {
        return $.cookie('token');
    }.property(),

    isAuthenticated: function () {
        return this.get('token') !== null && this.get('tokenCookie');
    }.property('token'),

    authenticateWithToken: function () {
        var self = this;
        var token = $.cookie('token');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            if(!token) {
                reject();
            }

            var path = '%@/auth/'.fmt(location);
            var data = {
                token: token
            };

            $.post(path, data).then(
                function (data, status, xhr) {
                    self.handleAuthentication(data);

                    resolve(data, xhr);
                },
                function (data, status, xhr) {
                    reject(data, xhr);
                }
            )
        });
    },

    authenticateWithCredentials: function (username, password) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            var path = '%@/auth/'.fmt(location);
            var data = {
                username: username,
                password: password
            };

            $.post(path, data).then(
                function (data, status, xhr) {
                    if(data.token) {
                        self.handleAuthentication(data);

                        resolve(data, xhr);
                    } else {
                        reject(data, xhr);
                    }

                },
                function (data, status, xhr) {
                    reject(data, xhr);
                }
            )
        });
    },

    handleAuthentication: function (data) {
        $.cookie('token', data.token);
        var csrftoken = $.cookie('csrftoken');

        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        Ember.$.ajaxPrefilter(function(options, originalOptions, xhr) {
            options.xhrFields = {
                withCredentials: true
            };

            xhr.setRequestHeader('Authorization', 'Token %@'.fmt(data.token));

            if (!csrfSafeMethod(options.type)) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
        });
    }
});
