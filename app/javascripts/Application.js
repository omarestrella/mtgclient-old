var MTG = Ember.Application.create({
    LOG_ACTIVE_GENERATION: true,
    LOG_MODULE_RESOLVER: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    modulePrefix: 'mtg'
});

MTG.initializer({
    name: 'mtg',

    initialize: function (container, application) {
        application.set('container', container);
        application.set('store', container.lookup('store:main'));
        application.set('router', container.lookup('router:main'));
    }
});

Ember.RSVP.configure('onerror', function(error) {
    if (error instanceof Error) {
        Ember.Logger.error(error.stack);
    }
});

export default MTG;