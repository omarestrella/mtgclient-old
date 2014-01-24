MTG.CardListComponent = Ember.Component.extend({
    needs: ['filter'],
    classNames: ['card-list'],

    delegate: null,

    searchQuery: null,

    showMenu: false,
    searching: false,

    showFilters: false,

    searchQueryChanged: function () {
        this.set('controllers.filter.searchQuery', this.get('searchQuery'));
    }.observes('searchQuery'),

    searchContentChanged: function () {
        this.set('content', this.get('controllers.filter.content'));
    }.observes('controllers.filter.content')
});
