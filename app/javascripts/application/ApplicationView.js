MTG.ApplicationView = Ember.View.extend({
    routeChanged: function () {
        this.closeMenu();
    }.observes('MTG.router.url'),

    closeMenu: function () {
        this.set('controller.showMenu', false);
    },

    handleClick: function (event) {
        var target = $(event.target);
        if(!target.parents('.card-list').length && !target.parents('.slide').length) {
            this.closeMenu();
        }
    },

    click: function (event) {
        this.handleClick(event);
    },

    touchstart: function (event) {
        this.handleClick(event);
    }
});
