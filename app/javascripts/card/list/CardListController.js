MTG.CardListController = Ember.Controller.extend({
    needs: ['filter'],

    delegate: null,

    searching: false,
    searchQuery: null,

    showFilters: false,

    actions: {
        toggleFilters: function () {
            this.toggleProperty('showFilters');
        }
    },

    searchQueryChanged: function () {
        this.set('controllers.filter.searchQuery', this.get('searchQuery'));
    }.observes('searchQuery'),

    searchContentChanged: function () {
        this.set('content', this.get('controllers.filter.content'));
    }.observes('controllers.filter.content')
});
