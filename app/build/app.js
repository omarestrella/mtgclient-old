(function(__exports__) {
    "use strict";
    var MTG = Ember.Application.create({
        LOG_ACTIVE_GENERATION: true,
        LOG_MODULE_RESOLVER: true,
        LOG_TRANSITIONS: true,
        LOG_TRANSITIONS_INTERNAL: true,
        LOG_VIEW_LOOKUPS: true,
        modulePrefix: "mtg"
    });
    MTG.initializer({
        name: "mtg",
        initialize: function(container, application) {
            application.set("container", container);
            application.set("store", container.lookup("store:main"));
            application.set("router", container.lookup("router:main"));
        }
    });
    Ember.RSVP.configure("onerror", function(error) {
        if (error instanceof Error) {
            Ember.Logger.error(error.stack);
        }
    });
    __exports__.MTG = MTG;
})(window);

(function() {
    "use strict";
    MTG.Router.map(function() {
        this.resource("card", function() {
            this.route("detail", {
                path: "/:id"
            });
        });
    });
})();

(function() {
    "use strict";
    var location = function() {
        if (window.location.hostname === "localhost") {
            return "http://localhost:9000";
        }
        return "http://gatheringapi.herokuapp.com";
    }();
    MTG.ApplicationAdapter = DS.RESTAdapter.extend({
        namespace: location,
        serializer: MTG.ApplicationSerializer,
        buildURL: function(type, id) {
            var url = "%@/%@/".fmt(this.namespace, type);
            if (id) {
                url += "%@/".fmt(id);
            }
            return url;
        }
    });
})();

(function() {
    "use strict";
    MTG.ApplicationSerializer = DS.RESTSerializer.extend({
        extractSingle: function(store, type, payload, id, requestType) {
            var data = {}, dataKey = type.typeKey;
            data[dataKey] = payload;
            return this._super(store, type, data, id, requestType);
        },
        extractArray: function(store, type, payload) {
            var data = {}, dataKey = Ember.String.pluralize(type.typeKey);
            data[dataKey] = payload;
            return this._super(store, type, data);
        }
    });
})();

(function() {
    "use strict";
    MTG.ApplicationController = Ember.Controller.extend({
        search: null,
        searchChanged: function() {
            Ember.run.debounce(this, function() {
                if (this.get("search")) {
                    this.set("content", this.store.find("card", {
                        search: this.get("search")
                    }));
                } else {
                    this.set("content", this.store.find("card"));
                }
            }, 400);
        }.observes("search")
    });
})();

(function() {
    "use strict";
    MTG.ApplicationRoute = Ember.Route.extend({
        model: function() {
            return this.store.find("card");
        }
    });
})();

(function() {
    "use strict";
    MTG.Card = DS.Model.extend({
        name: DS.attr(),
        text: DS.attr(),
        card_set: DS.attr(),
        cmc: DS.attr(),
        type_name: DS.attr(),
        types: DS.attr(),
        subtypes: DS.attr(),
        colors: DS.attr(),
        layout: DS.attr(),
        power: DS.attr(),
        toughness: DS.attr(),
        image_name: DS.attr(),
        shortSet: function() {
            return this.get("card_set").match(/\(\w+\)/)[0].match(/\w+/)[0];
        }.property("card_set"),
        image: function() {
            var url = "http://mtgimage.com/set/%@/%@.jpg";
            var setName = this.get("shortSet");
            return url.fmt(setName, this.get("name").toLowerCase());
        }.property("image_name")
    });
})();

(function() {
    "use strict";
    MTG.CardDetailRoute = Ember.Route.extend({
        beforeModel: function(transition) {
            var id = transition.params.id;
            var card = this.store.recordForId("card", id);
            if (card && !card.currentState.isEmpty && Ember.keys(card._data).length < 4) {
                return card.reload();
            }
        },
        model: function(params) {
            return this.store.find("card", params.id);
        }
    });
})();