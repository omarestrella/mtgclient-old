MTG.ApplicationController = Ember.Controller.extend({
    search: null,

    searchChanged: function () {
        if(this.get('search')) {
            this.set('content', this.store.find('card', { search: this.get('search') }));
        } else {
            this.set('content', this.store.find('card'));
        }
    }.observes('search')
});
