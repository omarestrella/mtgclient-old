MTG.ModalComponent = Ember.Component.extend({
    layoutName: 'components/modal',
    classNameBindings: [':modal', 'isVisible:in:', ':fade'],

    isVisible: false,

    delegate: null,

    headerText: 'Modal',
    confirmText: 'Confirm',
    cancelText: 'Cancel',

    contentViewClass: null,

    actions: {
        confirm: function () {
            this.hide();

            var delegate = this.get('delegate');
            delegate.send('confirm');
        },

        cancel: function () {
            this.hide();

            var delegate = this.get('delegate');
            delegate.send('cancel');
        }
    },

    init: function () {
        this._super();

        this.set('content', this.get('delegate'));
    },

    showModal: function () {
        var background = '<div class="modal-backdrop fade"></div>';
        var $background = Ember.$(background);
        $background.appendTo('body');
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('body').addClass('modal-open');

            $background.addClass('in');

            this.set('isVisible', true);
        });

        this.set('$background', $background);
    }.on('didInsertElement'),

    hidingModal: function () {
        this.set('isVisible', false);
    }.on('willDestroyElement'),

    hide: function () {
        var self = this;
        var $background = this.get('$background');

        Ember.$('body').removeClass('modal-open');

        $background.removeClass('in');

        if (!$.support.transition) { // IE...
            $background.remove();
            this.destroy();
        } else {
            this.$().one($.support.transition.end, function () {
                $background.remove();
                self.destroy();
            });
        }
    },

    click: Ember.K
});

MTG.ModalComponent.reopenClass({
    show: function (options) {
        var modal = this.create(options);
        modal.container = modal.get('delegate.container');
        modal.appendTo('.ember-application');
        return modal;
    }
});
