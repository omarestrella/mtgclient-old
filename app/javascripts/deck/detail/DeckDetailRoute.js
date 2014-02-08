MTG.DeckDetailRoute = Ember.Route.extend({
    model: function (params) {
        return this.store.find('deck', params.id);
    }
});
