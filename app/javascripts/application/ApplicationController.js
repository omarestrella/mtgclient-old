MTG.ApplicationController = Ember.Controller.extend({
    search: null,

    searching: false,

    searchChanged: function () {
        var promise,
            self = this;

        if(!this.get('searching')) {
            this.set('searching', true);

            if(this.get('search')) {
                promise = this.store.find('card', { search: this.get('search') })
            } else {
                promise = this.store.find('card');
            }

            promise.then(function (cards) {
                self.set('content', cards);
                self.set('searching', false);
            });
        }
    }.observes('search')
});
