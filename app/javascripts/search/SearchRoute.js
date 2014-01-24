MTG.SearchRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('card');
    }
});
