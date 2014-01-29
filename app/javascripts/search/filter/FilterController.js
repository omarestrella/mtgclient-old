MTG.FilterController = Ember.ArrayController.extend({
    searchQuery: '',

    cmc: null,
    color: null,

    searchParametersChanged: _.debounce(function () {
        var promise,
            self = this;

        var params = {};

        var search = this.get('searchQuery');
        var cmc = this.get('cmc');

        if(search) {
            params.search = search;
        }

        if(cmc) {
            params.cmc = cmc;
        }

        if(params && Ember.keys(params).length > 0) {
            promise = this.store.find('card', params)
        } else {
            promise = this.store.find('card');
        }

        promise.then(function (cards) {
            self.set('content', cards);
        })
    }, 200).observes('searchQuery', 'cmc')
});
