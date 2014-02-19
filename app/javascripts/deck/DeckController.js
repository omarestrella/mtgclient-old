MTG.DeckController = Ember.Controller.extend({
    editMode: false,

    name: null,
    private: false,

    actions: {
        createNewDeck: function () {
            var createDeckModal = MTG.ModalComponent.show({
                delegate: this,
                headerText: 'Create Deck',
                contentViewClass: MTG.CreateDeckView
            });
        },

        confirm: function () {
            var self = this;
            var name = this.get('name'),
                privateDeck = this.get('private');

            var data = {
                title: name,
                private: privateDeck,
                user: MTG.get('session.user.id')
            };

            MTG.Ajax.post('/deck/', data)
                .then(function (data) {
                    if (data.id) {
                        self.transitionToRoute('deck.edit', data.id);
                    }
                })
                .catch(function () {
                    Ember.logger.error('Create deck error');
                });
        },

        cancel: Ember.K
    }
});
