MTG.CardDetailRoute = Ember.Route.extend({
    model: function (params) {
        return this.store.find('card', params.id);
    }
});
