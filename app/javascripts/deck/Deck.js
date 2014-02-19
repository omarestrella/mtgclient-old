MTG.Deck = DS.Model.extend({
    title: DS.attr(),
    private: DS.attr(),
    cards: DS.attr(),
    edit_group: DS.attr(),

    path: function () {
        return '/deck/' + this.get('id') + '/';
    }.property('id'),

    size: function () {
        var counts = this.get('cards').mapProperty('count');

        if (!counts || counts.length === 0) {
            return 0;
        }

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

    canEdit: function () {
        var user = MTG.get('session.user.id');
        return this.get('edit_group').indexOf(user) > -1;
    }.property('MTG.session.user'),

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
