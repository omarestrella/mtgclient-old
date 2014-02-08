MTG.ApplicationView = Ember.View.extend({
    routeChanged: function () {
        Ember.run.scheduleOnce('afterRender', this, this.updateActiveNavbar);
    }.observes('MTG.router.url'),

    updateActiveNavbar: function () {
        // Handle the situation where you have an active item
        var activeListItem = this.$('.nav li.active');
        activeListItem.removeClass('active');

        var activeLink = this.$('.nav a.active');
        activeLink.parent().addClass('active');
    }
});
