MTG.Deck = DS.Model.extend({
    title: DS.attr(),
    private: DS.attr(),
    cards: DS.attr(),

    path: function () {
        return '/deck/' + this.get('id') + '/';
    }.property('id'),

    size: function () {
        var counts = this.get('cards').mapProperty('count');
        return _.reduce(counts, function (sum, num) {
            return sum + num;
        });
    }.property('cards.[]'),

    creatures: function () {
        return this.filterCardsOnType('Creature');
    }.property('cards.[]'),

    instants: function () {
        return this.filterCardsOnType('Instant');
    }.property('cards.[]'),

    sorceries: function () {
        return this.filterCardsOnType('Sorcery');
    }.property('cards.[]'),

    enchantments: function () {
        return this.filterCardsOnType('Enchantment');
    }.property('cards.[]'),

    lands: function () {
        return this.filterCardsOnType('Land');
    }.property('lands.[]'),

    filterCardsOnType: function (type) {
        var cards = this.get('cards');
        var filtered = cards.filter(function (detail) {
            return _.contains(detail.card.types, type);
        });

        return _.sortBy(filtered, function (data) {
            return data.card.name;
        });
    }
});
