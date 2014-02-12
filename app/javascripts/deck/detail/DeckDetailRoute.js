MTG.DeckDetailRoute = Ember.Route.extend({
    beforeModel: function () {
        var controller = this.controllerFor('deck');
        controller.set('editMode', false);
    },

    model: function (params) {
        return this.store.find('deck', params.id);
    }
});
