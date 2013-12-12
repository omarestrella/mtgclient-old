MTG.ApplicationController = Ember.Controller.extend({
    search: null,

    searchChanged: function () {
        Ember.run.debounce(this, function () {
            if(this.get('search')) {
                this.set('content', this.store.find('card', { search: this.get('search') }));
            } else {
                this.set('content', this.store.find('card'));
            }
        }, 400);
    }.observes('search')
});
