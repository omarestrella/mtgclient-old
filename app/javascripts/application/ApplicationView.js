MTG.ApplicationView = Ember.View.extend({
    routeChanged: function () {
        // set current route
    }.observes('MTG.router.url')
});
