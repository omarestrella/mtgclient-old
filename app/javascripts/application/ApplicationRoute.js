MTG.ApplicationRoute = Ember.Route.extend({
    actions: {
        transition: function () {
            if(!this.session.get('isAuthenticated')) {
                this.transitionTo('login');
            }
        }
    },

    beforeModel: function (transition) {
        var self = this;

        return this.session.authenticateWithToken()
            .catch(function () {
                if(!self.session.get('isAuthenticated')) {
                    self.transitionTo('login');
                }
            });

    }
});
