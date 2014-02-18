(function(__exports__) {
    "use strict";
    Ember.RSVP.configure("onerror", function(error) {
        if (error instanceof Error) {
            Ember.Logger.error(error.stack);
        }
    });
    var sockets = {};
    var connect = function(namespace) {
        return io.connect("http://localhost:9000/" + namespace);
    };
    var socket = function(namespace) {
        var socket = sockets[namespace];
        if (!socket) {
            socket = connect(namespace);
            sockets[namespace] = socket;
        }
        return socket;
    };
    Function.prototype.onEvent = function(namespace, eventName) {
        this.__socket_events = [ namespace, eventName ];
        return this;
    };
    var MTG = Ember.Application.create({
        LOG_ACTIVE_GENERATION: true,
        LOG_MODULE_RESOLVER: true,
        LOG_TRANSITIONS: true,
        LOG_TRANSITIONS_INTERNAL: true,
        LOG_VIEW_LOOKUPS: true,
        modulePrefix: "mtg",
        connect: connect,
        socket: socket,
        lookupController: function(name) {
            return this.container.lookup("controller:" + name);
        }
    });
    MTG.initializer({
        name: "mtg",
        initialize: function(container, application) {
            application.set("container", container);
            application.set("store", container.lookup("store:main"));
            application.set("router", container.lookup("router:main"));
            application.register("session:application", MTG.Session);
            application.set("session", container.lookup("session:application"));
            application.inject("route", "session", "session:application");
            application.inject("controller", "session", "session:application");
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
    MTG.Router.map(function() {
        this.resource("search");
        this.resource("card", function() {
            this.route("detail", {
                path: "/:id"
            });
        });
        this.resource("deck", function() {
            this.route("detail", {
                path: "/:id"
            });
            this.route("edit", {
                path: "/:id/edit"
            });
            this.route("new");
        });
        this.route("login");
        this.route("logout");
        this.route("register");
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
    function setAjaxPreflight(data) {
        $.cookie("token", data.token);
        var csrftoken = $.cookie("csrftoken");
        function csrfSafeMethod(method) {
            return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
        }
        Ember.$.ajaxPrefilter(function(options, originalOptions, xhr) {
            options.xhrFields = {
                withCredentials: true
            };
            xhr.setRequestHeader("Authorization", "Token %@".fmt(data.token));
            if (!csrfSafeMethod(options.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
    }
    MTG.Session = Ember.Object.extend({
        user: null,
        token: null,
        init: function() {
            Ember.$.ajaxPrefilter(function(options, originalOptions, xhr) {
                options.xhrFields = {
                    withCredentials: true
                };
            });
        },
        tokenCookie: function() {
            return $.cookie("token");
        }.property(),
        isAuthenticated: function() {
            return this.get("token") !== null && this.get("tokenCookie");
        }.property("token"),
        authenticateWithToken: function() {
            var self = this;
            var token = $.cookie("token");
            return new Ember.RSVP.Promise(function(resolve, reject) {
                if (!token) {
                    reject();
                }
                var path = "%@/auth/".fmt(location);
                var data = {
                    token: token
                };
                $.post(path, data).then(function(data, status, xhr) {
                    self.set("token", token);
                    self.handleAuthentication(data);
                    resolve(data, xhr);
                }, function(data, status, xhr) {
                    reject(data, xhr);
                });
            });
        },
        authenticateWithCredentials: function(username, password) {
            var self = this;
            return new Ember.RSVP.Promise(function(resolve, reject) {
                var path = "%@/auth/".fmt(location);
                var data = {
                    username: username,
                    password: password
                };
                $.post(path, data).then(function(data, status, xhr) {
                    if (data.token) {
                        self.set("token", data.token);
                        self.handleAuthentication(data);
                        resolve(data, xhr);
                    } else {
                        reject(data, xhr);
                    }
                }, function(data, status, xhr) {
                    reject(data, xhr);
                });
            });
        },
        handleAuthentication: function(data) {
            setAjaxPreflight(data);
        },
        logout: function() {
            var self = this;
            return new Ember.RSVP.Promise(function(resolve, reject) {
                var path = "%@/auth/logout/".fmt(location);
                $.post(path, {}).then(function() {
                    $.removeCookie("token");
                    self.set("token", null);
                    self.set("user", null);
                    resolve();
                }, function() {
                    Ember.Logger.error("Logout error");
                    reject();
                });
            });
        }
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
    MTG.Ajax = Ember.Object.create({
        post: function(path, data) {
            return new Ember.RSVP.Promise(function(resolve, reject) {
                var postData = {
                    data: JSON.stringify(data)
                };
                Ember.$.post(location + path, postData).then(function(data) {
                    resolve(data);
                }, function(data) {
                    reject(data);
                });
            });
        }
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
    MTG.ApplicationController = Ember.Controller.extend({});
})();

(function() {
    "use strict";
    MTG.ApplicationRoute = Ember.Route.extend({
        actions: {
            transition: function() {
                if (!this.session.get("isAuthenticated")) {
                    this.transitionTo("login");
                }
            },
            logout: function() {
                var route = this;
                var session = MTG.get("session");
                session.logout().then(function() {
                    route.transitionTo("login");
                });
            }
        },
        beforeModel: function(transition) {
            var self = this;
            return this.session.authenticateWithToken().catch(function() {
                if (!self.session.get("isAuthenticated")) {
                    self.transitionTo("login");
                }
            });
        }
    });
})();

(function() {
    "use strict";
    MTG.ApplicationView = Ember.View.extend({
        routeChanged: function() {
            Ember.run.scheduleOnce("afterRender", this, this.updateActiveNavbar);
        }.observes("MTG.router.url"),
        updateActiveNavbar: function() {
            var activeListItem = this.$(".nav li.active");
            activeListItem.removeClass("active");
            var activeLink = this.$(".nav a.active");
            activeLink.parent().addClass("active");
        }
    });
})();

(function() {
    "use strict";
    MTG.SocketMixin = Ember.Mixin.create({
        init: function() {
            this.socket = MTG.connect("deck");
            this._super();
        }
    });
})();

(function() {
    "use strict";
    MTG.WebSocketMixin = Ember.Mixin.create({
        init: function() {
            this._super();
            var self = this;
            var func, prop, socket;
            for (prop in this) {
                func = this[prop];
                (function(scopedFunc) {
                    if (scopedFunc && scopedFunc.__socket_events) {
                        var events = scopedFunc.__socket_events;
                        var namespace = events[0], event = events[1];
                        socket = MTG.socket(namespace);
                        socket.on(event, function() {
                            scopedFunc.apply(self, arguments);
                        });
                    }
                })(func);
            }
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
            var set = this.get("card_set");
            if (set) {
                return set.match(/\(\w+\)/)[0].match(/\w+/)[0];
            }
            return "";
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
    MTG.CardController = Ember.ObjectController.extend({
        cardBinding: "model"
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
        templateName: "card/card-detail",
        classNames: [ "card-detail" ]
    });
})();

(function() {
    "use strict";
    MTG.CardListController = Ember.Controller.extend({
        needs: [ "filter" ],
        delegate: null,
        searching: false,
        searchQuery: null,
        showFilters: false,
        actions: {
            toggleFilters: function() {
                this.toggleProperty("showFilters");
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
    MTG.CardListView = Ember.View.extend({
        classNames: [ "card-list" ],
        templateName: "card/card-list",
        adjustHeight: function() {
            this.setHeight();
            $(window).on("resize", _.bind(this.setHeight, this));
        }.on("didInsertElement"),
        removeBindings: function() {
            $(window).off("resize");
        }.on("willDestroyElement"),
        setHeight: function() {
            var height = window.innerHeight;
            this.$().css("height", height);
        }
    });
})();

(function() {
    "use strict";
    MTG.Deck = DS.Model.extend({
        title: DS.attr(),
        "private": DS.attr(),
        cards: DS.attr(),
        path: function() {
            return "/deck/" + this.get("id") + "/";
        }.property("id"),
        size: function() {
            var counts = this.get("cards").mapProperty("count");
            return _.reduce(counts, function(sum, num) {
                return sum + num;
            });
        }.property("cards.[]"),
        creatures: function() {
            return this.filterCardsOnType("Creature");
        }.property("cards.[]"),
        instants: function() {
            return this.filterCardsOnType("Instant");
        }.property("cards.[]"),
        sorceries: function() {
            return this.filterCardsOnType("Sorcery");
        }.property("cards.[]"),
        enchantments: function() {
            return this.filterCardsOnType("Enchantment");
        }.property("cards.[]"),
        lands: function() {
            return this.filterCardsOnType("Land");
        }.property("lands.[]"),
        filterCardsOnType: function(type) {
            var cards = this.get("cards");
            var filtered = cards.filter(function(detail) {
                return _.contains(detail.card.types, type);
            });
            return _.sortBy(filtered, function(data) {
                return data.card.name;
            });
        }
    });
})();

(function() {
    "use strict";
    MTG.DeckController = Ember.Controller.extend({
        editMode: false
    });
})();

(function() {
    "use strict";
    MTG.DeckRoute = Ember.Route.extend({
        model: function() {
            return this.store.find("deck");
        }
    });
})();

(function() {
    "use strict";
    MTG.DeckView = Ember.View.extend({
        templateName: "deck",
        classNames: [ "deck" ]
    });
})();

(function() {
    "use strict";
    MTG.DeckCardDetailComponent = Ember.Component.extend({
        tagName: "span",
        classNames: [ "deck-card-detail" ],
        card: null,
        count: 0,
        imageUrl: null,
        attachHoverPreview: function() {
            var self = this;
            var card = this.get("card");
            this.$().hover(function() {
                MTG.store.find("card", card.id).then(function(c) {
                    self.set("imageUrl", c.get("mtgImage"));
                });
            }, function() {
                self.set("imageUrl", null);
            });
        }.on("didInsertElement"),
        removeListeners: function() {
            this.$().off("hover");
        }.on("willDestroyElement")
    });
})();

(function() {
    "use strict";
    MTG.DeckCardListComponent = Ember.Component.extend({
        classNames: [ "deck-card-list" ],
        edit: false,
        deck: null,
        collection: null,
        actions: {
            addCard: function(card, count) {
                var data = [ {
                    card: card.id,
                    count: count + 1
                } ];
                this.saveCardData(data);
            },
            removeCard: function(card, count) {
                var data = [ {
                    card: card.id,
                    count: count - 1
                } ];
                this.saveCardData(data);
            }
        },
        saveCardData: function(data) {
            var deck = this.get("deck");
            var path = deck.get("path");
            MTG.Ajax.post(path + "update_cards/", data).then(function() {
                MTG.socket("deck").emit("deck_update", deck.get("id"));
            });
        }
    });
})();

(function() {
    "use strict";
    MTG.DeckDetailController = Ember.ObjectController.extend({});
    Ember.Handlebars.registerBoundHelper("collection-count", function(collection) {
        if (collection && !_.isEmpty(collection)) {
            var sums = collection.mapProperty("count");
            return _.reduce(sums, function(sum, num) {
                return sum + num;
            });
        }
        return 0;
    });
})();

(function() {
    "use strict";
    MTG.DeckDetailRoute = Ember.Route.extend({
        beforeModel: function() {
            var controller = this.controllerFor("deck");
            controller.set("editMode", false);
        },
        model: function(params) {
            return this.store.find("deck", params.id);
        }
    });
})();

(function() {
    "use strict";
    MTG.DeckDetailView = Ember.View.extend({
        templateName: "deck/deck-detail",
        classNames: [ "deck-detail" ]
    });
})();

(function() {
    "use strict";
    MTG.DeckEditController = Ember.ObjectController.extend(MTG.WebSocketMixin, {
        joined: false,
        selectedCards: [],
        actions: {
            selectCard: function(card) {
                var self = this;
                var deck = this.get("content");
                var path = deck.get("path");
                var data = [ {
                    card: card.get("id")
                } ];
                MTG.Ajax.post(path + "update_cards/", data).then(function() {
                    self.get("selectedCards").addObject(card);
                    self.socket.emit("deck_update", deck.get("id"));
                });
            },
            revertDeck: function() {
                this.get("selectedCards").clear();
            }
        },
        init: function() {
            this._super();
        },
        cardList: function() {
            return this.store.find("card");
        }.property(),
        deckLoaded: function() {
            if (this.get("content.id") && !this.get("joined")) {
                MTG.socket("deck").emit("join", this.get("content.id"));
                this.toggleProperty("joined");
            }
        }.observes("content.id"),
        deckUpdated: function() {
            this.get("content").reload();
        }.onEvent("deck", "deck_update")
    });
})();

(function() {
    "use strict";
    MTG.DeckEditRoute = Ember.Route.extend({
        beforeModel: function() {
            var controller = this.controllerFor("deck");
            controller.set("editMode", true);
        },
        model: function(params) {
            return this.store.find("deck", params.id);
        }
    });
})();

(function() {
    "use strict";
    MTG.DeckEditView = Ember.View.extend({
        templateName: "deck/deck-edit",
        classNames: [ "deck-edit" ]
    });
})();

(function() {
    "use strict";
    MTG.LoginController = Ember.Controller.extend({
        username: null,
        password: null,
        actions: {
            login: function() {
                var self = this;
                var username = this.get("username");
                var password = this.get("password");
                this.session.authenticateWithCredentials(username, password).then(function() {
                    self.transitionToRoute("index");
                }).catch(function() {
                    alert("Error");
                });
            }
        }
    });
})();

(function() {
    "use strict";
    MTG.LoginView = Ember.View.extend({
        classNames: [ "login" ],
        templateName: [ "login/login" ],
        submit: function() {
            this.get("controller").send("login");
        }
    });
})();

(function() {
    "use strict";
    MTG.LogoutRoute = Ember.Route.extend({
        activate: function() {
            this.send("logout");
        }
    });
})();

(function() {
    "use strict";
    MTG.SearchController = Ember.Controller.extend({
        card: null,
        actions: {
            selectCard: function(card) {
                var self = this;
                card.reload().then(function() {
                    self.set("card", card);
                });
            }
        }
    });
})();

(function() {
    "use strict";
    MTG.SearchRoute = Ember.Route.extend({
        model: function() {
            return this.store.find("card");
        }
    });
})();

(function() {
    "use strict";
    MTG.SearchView = Ember.View.extend({
        templateName: "search/search",
        classNames: [ "search" ]
    });
})();

(function() {
    "use strict";
    MTG.FilterController = Ember.ArrayController.extend({
        searchQuery: "",
        cmc: null,
        color: null,
        searchParametersChanged: _.debounce(function() {
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
        }, 200).observes("searchQuery", "cmc")
    });
})();