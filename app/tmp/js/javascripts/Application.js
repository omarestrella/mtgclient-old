(function(__exports__) {
  "use strict";
  var MTG = Ember.Application.create({
      LOG_ACTIVE_GENERATION: true,
      LOG_MODULE_RESOLVER: true,
      LOG_TRANSITIONS: true,
      LOG_TRANSITIONS_INTERNAL: true,
      LOG_VIEW_LOOKUPS: true,
      modulePrefix: 'mtg'
      // Resolver: Resolver.default
  });

  __exports__.MTG = MTG;
})(window);