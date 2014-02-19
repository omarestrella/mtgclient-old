MTG.DeckCardDetailComponent = Ember.Component.extend({
    tagName: 'span',
    classNames: ['deck-card-detail'],

    card: null,
    count: 0,

    imageUrl: null,

    attachHoverPreview: function () {
        var self = this;
        var card = this.get('card');

        this.$().hover(
            function () {
                MTG.store.find('card', card.id)
                    .then(function (c) {
                        if(c.get('set_name')) {
                            self.set('imageUrl', c.get('mtgImage'));

                            return null;
                        }

                        return c.reload().then(function (c) {
                            self.set('imageUrl', c.get('mtgImage'));
                        });
                    });
            },

            function () {
                self.set('imageUrl', null);
            }
        );
    }.on('didInsertElement'),

    removeListeners: function () {
        this.$().off('hover');
    }.on('willDestroyElement')
});
