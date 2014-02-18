MTG.ApplicationRoute = Ember.Route.extend({
    actions: {
        transition: function () {
            if(!this.session.get('isAuthenticated')) {
                this.transitionTo('login');
            }
        },

        logout: function () {
            var route = this;
            var session = MTG.get('session');
            session.logout().then(function () {
                route.transitionTo('login');
            });
        }
    },

    beforeModel: function (transition) {
        var self = this;

        return this.session.authenticateWithToken()
            .catch(function () {
                if(!self.session.get('isAuthenticated') && transition.targetName !== 'register') {
                    self.transitionTo('login');
                }
            });

    }
});
