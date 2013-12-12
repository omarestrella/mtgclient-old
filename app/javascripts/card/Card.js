MTG.Card = DS.Model.extend({
    name: DS.attr(),
    text: DS.attr(),
    set: DS.attr(),
    cmc: DS.attr(),
    type_name: DS.attr(),
    types: DS.attr(),
    subtypes: DS.attr(),
    colors: DS.attr(),
    layout: DS.attr(),
    power: DS.attr(),
    toughness: DS.attr(),
    image_name: DS.attr()
});
