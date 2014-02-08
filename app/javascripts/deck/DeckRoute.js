MTG.DeckRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('deck');
    }
});
