MTG.RegisterController = Ember.Controller.extend({
    username: null,
    email: null,
    password: null,
    passwordRepeat: null,

    registrationError: false,

    usernameFree: false,

    actions: {
        register: function () {
            var username = this.get('username'),
                email = this.get('email'),
                password = this.get('password'),
                passwordRepeat = this.get('passwordRepeat');

            if (username && email && password && password === passwordRepeat) {
                var self = this;
                var data = {
                    username: username,
                    password: password,
                    email: email
                };

                MTG.Ajax.post('/auth/register/', data)
                    .then(function () {
                        self.set('registrationError', false);

                        self.session.authenticateWithCredentials(username, password)
                            .then(function () {
                                self.transitionTo('index');
                            });
                    })
                    .catch(function () {
                        self.set('registrationError', true);
                    });
            }
        }
    },

    formNotComplete: function () {
        var username = this.get('username'),
            email = this.get('email'),
            password = this.get('password'),
            passwordRepeat = this.get('passwordRepeat');

        return !(username && email && password && password === passwordRepeat);
    }.property('username', 'email', 'password', 'passwordRepeat'),

    passwordsNoMatch: function () {
        return this.get('password') !== this.get('passwordRepeat');
    }.property('password', 'passwordRepeat'),

    usernameCheckPassed: function () {
        var username = this.get('username'),
            free = this.get('usernameFree');

        return username && free;
    }.property('username', 'usernameFree'),

    checkUsername: function () {
        var self = this;
        var data = {
            username: this.get('username')
        };

        MTG.Ajax.get('/auth/register/', data)
            .then(function (res) {
                self.set('usernameFree', false);
            })
            .catch(function (res) {
                self.set('usernameFree', true);
            });
    }.observes('username')
});
