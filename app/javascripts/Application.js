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

Ember.Handlebars.registerBoundHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.toString();
    text = text.replace(/(\r\n|\n|\r)/gm, '<br />');
    return new Handlebars.SafeString(text);
});

export default MTG;
