MTG.DeckEditController = Ember.ObjectController.extend({
    selectedCards: [],

    actions: {
        selectCard: function (card) {
            var self = this;
            var deck = this.get('content');
            var path = deck.get('path');

            var data = [
                {
                    card: card.get('id')
                }
            ];

            MTG.Ajax.post(path + 'update_cards/', data).then(function () {
                self.get('selectedCards').addObject(card);
                deck.reload();
            });
        },

        revertDeck: function () {
            this.get('selectedCards').clear();
        }
    },

    cardList: function () {
        return this.store.find('card');
    }.property()
});
