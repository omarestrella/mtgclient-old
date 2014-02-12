MTG.CardListView = Ember.View.extend({
    classNames: ['card-list'],
    templateName: 'card/card-list',

    adjustHeight: function () {
        this.setHeight();
        $(window).on('resize', _.bind(this.setHeight, this));
    }.on('didInsertElement'),

    removeBindings: function () {
        $(window).off('resize');
    }.on('willDestroyElement'),

    setHeight: function () {
        var height = window.innerHeight;
        this.$().css('height', height);
    }
});
