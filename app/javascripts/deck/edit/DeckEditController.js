MTG.DeckEditController = Ember.ObjectController.extend(MTG.WebSocketMixin, {
    joined: false,

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

            var postData = {
                data: JSON.stringify(data)
            };

            MTG.Ajax.post(path + 'update_cards/', postData).then(function () {
                self.get('selectedCards').addObject(card);
                self.socket.emit('deck_update', deck.get('id'));
            });
        },

        revertDeck: function () {
            this.get('selectedCards').clear();
        }
    },

    init: function () {
        this._super();
    },

    cardList: function () {
        return this.store.find('card');
    }.property(),

    deckLoaded: function () {
        if(this.get('content.id') && !this.get('joined')) {
            MTG.socket('deck').emit('join', this.get('content.id'));
            this.toggleProperty('joined');
        }
    }.observes('content.id'),

    deckUpdated: function () {
        this.get('content').reload();
    }.onEvent('deck', 'deck_update')
});
