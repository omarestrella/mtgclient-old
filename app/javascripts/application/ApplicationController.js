MTG.ApplicationController = Ember.Controller.extend({
    needs: ['filter'],

    searchQuery: null,

    searching: false,
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
