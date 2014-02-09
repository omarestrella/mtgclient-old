MTG.DeckDetailController = Ember.ObjectController.extend({

});

Ember.Handlebars.registerBoundHelper('collection-count', function (collection) {
    if(collection && !_.isEmpty(collection)) {
        var sums = collection.mapProperty('count');
        return _.reduce(sums, function (sum, num) {
            return sum + num;
        });
    }

    return 0;
});
