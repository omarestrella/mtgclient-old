MTG.LogoutRoute = Ember.Route.extend({
    activate: function () {
        this.send('logout');
    }
});
