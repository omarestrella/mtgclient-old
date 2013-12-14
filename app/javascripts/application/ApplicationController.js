MTG.ApplicationController = Ember.Controller.extend({
    needs: ['filter'],

    searchQuery: null,

    showMenu: false,

    searching: false,
    showFilters: false,

    actions: {
        toggleFilters: function () {
            this.toggleProperty('showFilters');
        },

        toggleMenu: function () {
            this.toggleProperty('showMenu');
        }
    },

    searchQueryChanged: function () {
        this.set('controllers.filter.searchQuery', this.get('searchQuery'));
    }.observes('searchQuery'),

    searchContentChanged: function () {
        this.set('content', this.get('controllers.filter.content'));
    }.observes('controllers.filter.content')

});
