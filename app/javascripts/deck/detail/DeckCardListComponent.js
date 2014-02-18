MTG.DeckCardListComponent = Ember.Component.extend({
    classNames: ['deck-card-list'],

    edit: false,

    deck: null,
    collection: null,

    actions: {
        addCard: function (card, count) {
            var data = [
                {
                    card: card.id,
                    count: count + 1
                }
            ];

            this.saveCardData(data);
        },

        removeCard: function (card, count) {
            var data = [
                {
                    card: card.id,
                    count: count - 1
                }
            ];

            this.saveCardData(data);
        }
    },

    saveCardData: function (data) {
        var deck = this.get('deck');
        var path = deck.get('path');

        MTG.Ajax.post(path + 'update_cards/', data).then(function () {
            MTG.socket('deck').emit('deck_update', deck.get('id'));
        });
    }
});
