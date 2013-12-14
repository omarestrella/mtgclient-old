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
    Ember.Handlebars.registerBoundHelper("breaklines", function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.toString();
        text = text.replace(/(\r\n|\n|\r)/gm, "<br />");
        return new Handlebars.SafeString(text);
    });
    __exports__.MTG = MTG;
})(window);

(function() {
    "use strict";
    MTG.FilterController = Ember.Controller.extend({});
})();

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
            data[dataKey] = payload.results;
            return this._super(store, type, data);
        },
        rootJSON: function(json, type, pluralize) {
            var root = this.rootForType(type);
            if (pluralize === "pluralize") {
                root = this.pluralize(root);
            }
            var rootedJSON = {};
            rootedJSON[root] = json;
            return rootedJSON;
        },
        normalize: function(type, payload, property) {
            for (var prop in payload) {
                if (payload.hasOwnProperty(prop)) {
                    payload[prop.camelize()] = payload[prop];
                }
            }
            return this._super(type, payload, property);
        },
        extractMeta: function(store, type, payload) {
            if (payload && payload.next) {
                var nextUrl = payload.next;
                store.metaForType(type, {
                    next: payload.next.split("=")[1]
                });
                delete payload.next;
            }
            if (payload && payload.prev) {
                var prevUrl = payload.prev;
                store.metaForType(type, {
                    next: payload.prev.split("=")[1]
                });
                delete payload.prev;
            }
        }
    });
})();

(function() {
    "use strict";
    MTG.ApplicationController = Ember.Controller.extend({
        needs: [ "filter" ],
        searchQuery: null,
        showMenu: false,
        searching: false,
        showFilters: false,
        actions: {
            toggleFilters: function() {
                this.toggleProperty("showFilters");
            },
            toggleMenu: function() {
                this.toggleProperty("showMenu");
            }
        },
        searchQueryChanged: function() {
            this.set("controllers.filter.searchQuery", this.get("searchQuery"));
        }.observes("searchQuery"),
        searchContentChanged: function() {
            this.set("content", this.get("controllers.filter.content"));
        }.observes("controllers.filter.content")
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
    MTG.ApplicationView = Ember.View.extend({
        routeChanged: function() {
            this.closeMenu();
        }.observes("MTG.router.url"),
        closeMenu: function() {
            this.set("controller.showMenu", false);
        },
        handleClick: function(event) {
            var target = $(event.target);
            if (!target.parents(".card-list").length && !target.parents(".slide").length) {
                this.closeMenu();
            }
        },
        click: function(event) {
            this.handleClick(event);
        },
        touchstart: function(event) {
            this.handleClick(event);
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
        multiverse_id: DS.attr(),
        shortSet: function() {
            return this.get("card_set").match(/\(\w+\)/)[0].match(/\w+/)[0];
        }.property("card_set"),
        mtgImage: function() {
            var url = "http://mtgimage.com/set/%@/%@.jpg";
            var setName = this.get("shortSet");
            return url.fmt(setName, this.get("name").toLowerCase());
        }.property("image_name"),
        gathererImage: function() {
            var url = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=%@&type=card";
            return url.fmt(this.get("multiverse_id"));
        }.property("multiverse_id")
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

(function() {
    "use strict";
    MTG.CardDetailView = Ember.View.extend({
        templateName: "card/detail",
        classNames: [ "card-detail" ]
    });
})();

(function() {
    "use strict";
    MTG.FilterController = Ember.ArrayController.extend({
        searchQuery: "",
        cmc: null,
        color: null,
        searchParametersChanged: function() {
            var promise, self = this;
            var params = {};
            var search = this.get("searchQuery");
            var cmc = this.get("cmc");
            if (search) {
                params.search = search;
            }
            if (cmc) {
                params.cmc = cmc;
            }
            if (params && Ember.keys(params).length > 0) {
                promise = this.store.find("card", params);
            } else {
                promise = this.store.find("card");
            }
            promise.then(function(cards) {
                self.set("content", cards);
            });
        }.observes("searchQuery", "cmc")
    });
})();