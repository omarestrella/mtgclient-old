MTG.LoginController = Ember.Controller.extend({
    username: null,
    password: null,

    actions: {
        login: function () {
            var self = this;
            var username = this.get('username');
            var password = this.get('password');

            this.session.authenticateWithCredentials(username, password)
                .then(function () {
                    self.transitionToRoute('index');
                })
                .catch(function () {
                    alert('Error');
                });
        }
    }
});
