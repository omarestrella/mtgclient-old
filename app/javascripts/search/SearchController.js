MTG.SearchController = Ember.Controller.extend({
    card: null,

    actions: {
        selectCard: function (card) {
            var self = this;

            card.reload()
                .then(function () {
                    self.set('card', card);
                });
        }
    }
});
