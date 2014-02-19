MTG.DeckEditRoute = Ember.Route.extend({
    beforeModel: function () {
        var controller = this.controllerFor('deck');
        controller.set('editMode', true);
    },

    model: function (params) {
        return this.store.find('deck', params.id);
    },

    afterModel: function (model) {
        if(!model.get('canEdit')) {
            this.transitionTo('deck.detail', model.get('id'));
        }
    }
});
