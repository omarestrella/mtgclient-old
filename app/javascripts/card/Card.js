MTG.Card = DS.Model.extend({
    name: DS.attr(),
    text: DS.attr(),
    card_set: DS.attr(),
    cmc: DS.attr(),
    type_name: DS.attr(),
    types: DS.attr(),
    subtypes: DS.attr(),
    colors: DS.attr(),
    layout: DS.attr(),
    power: DS.attr(),
    toughness: DS.attr(),
    image_name: DS.attr(),
    multiverse_id: DS.attr(),

    shortSet: function () {
        var set = this.get('card_set');
        if(set) {
            return set.match(/\(\w+\)/)[0].match(/\w+/)[0];
        }

        return '';
    }.property('card_set'),

    mtgImage: function () {
        var url = 'http://mtgimage.com/set/%@/%@.jpg';
        var setName = this.get('shortSet');
        return url.fmt(setName, this.get('name').toLowerCase());
    }.property('image_name'),

    gathererImage: function () {
        var url = 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=%@&type=card';
        return url.fmt(this.get('multiverse_id'));
    }.property('multiverse_id')
});
