MTG.Deck = DS.Model.extend({
    title: DS.attr(),
    private: DS.attr(),
    cards: DS.attr(),

    creatures: function () {
        return this.filterCardsOnType('Creature');
    }.property('cards.[]'),

    instants: function () {
        return this.filterCardsOnType('Instant');
    }.property('cards.[]'),

    sorceries: function () {
        return this.filterCardsOnType('Sorcery');
    }.property('cards.[]'),

    filterCardsOnType: function (type) {
        var cards = this.get('cards');
        return cards.filter(function (detail) {
            return _.contains(detail.card.types, type);
        });
    }
});
