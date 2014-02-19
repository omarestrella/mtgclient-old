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
            this.set("token", data.token);
            this.set("user", data.user);
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
        get: function(key) {
            if (arguments.length > 1) {
                return this._get.apply(this, arguments);
            }
            return Ember.get(this, key);
        },
        _get: function(path, data) {
            return new Ember.RSVP.Promise(function(resolve, reject) {
                Ember.$.get(location + path, data).then(function(data) {
                    resolve(data);
                }, function(data) {
                    reject(data);
                });
            });
        },
        post: function(path, data) {
            return new Ember.RSVP.Promise(function(resolve, reject) {
                Ember.$.post(location + path, data).then(function(data) {
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
                if (!self.session.get("isAuthenticated") && transition.targetName !== "register") {
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
    MTG.ModalComponent = Ember.Component.extend({
        layoutName: "components/modal",
        classNameBindings: [ ":modal", "isVisible:in:", ":fade" ],
        isVisible: false,
        delegate: null,
        headerText: "Modal",
        confirmText: "Confirm",
        cancelText: "Cancel",
        contentViewClass: null,
        actions: {
            confirm: function() {
                this.hide();
                var delegate = this.get("delegate");
                delegate.send("confirm");
            },
            cancel: function() {
                this.hide();
                var delegate = this.get("delegate");
                delegate.send("cancel");
            }
        },
        init: function() {
            this._super();
            this.set("content", this.get("delegate"));
        },
        showModal: function() {
            var background = '<div class="modal-backdrop fade"></div>';
            var $background = Ember.$(background);
            $background.appendTo("body");
            Ember.run.scheduleOnce("afterRender", this, function() {
                Ember.$("body").addClass("modal-open");
                $background.addClass("in");
                this.set("isVisible", true);
            });
            this.set("$background", $background);
        }.on("didInsertElement"),
        hidingModal: function() {
            this.set("isVisible", false);
        }.on("willDestroyElement"),
        hide: function() {
            var self = this;
            var $background = this.get("$background");
            Ember.$("body").removeClass("modal-open");
            $background.removeClass("in");
            if (!$.support.transition) {
                $background.remove();
                this.destroy();
            } else {
                this.$().one($.support.transition.end, function() {
                    $background.remove();
                    self.destroy();
                });
            }
        },
        click: Ember.K
    });
    MTG.ModalComponent.reopenClass({
        show: function(options) {
            var modal = this.create(options);
            modal.container = modal.get("delegate.container");
            modal.appendTo(".ember-application");
            return modal;
        }
    });
})();

(function() {
    "use strict";
    MTG.CreateDeckView = Ember.View.extend({
        templateName: "deck/deck-create",
        classNames: [ "create-deck" ]
    });
})();

(function() {
    "use strict";
    MTG.Deck = DS.Model.extend({
        title: DS.attr(),
        "private": DS.attr(),
        cards: DS.attr(),
        edit_group: DS.attr(),
        path: function() {
            return "/deck/" + this.get("id") + "/";
        }.property("id"),
        size: function() {
            var counts = this.get("cards").mapProperty("count");
            if (!counts || counts.length === 0) {
                return 0;
            }
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
        canEdit: function() {
            var user = MTG.get("session.user.id");
            return this.get("edit_group").indexOf(user) > -1;
        }.property("MTG.session.user"),
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
        editMode: false,
        name: null,
        "private": false,
        actions: {
            createNewDeck: function() {
                var createDeckModal = MTG.ModalComponent.show({
                    delegate: this,
                    headerText: "Create Deck",
                    contentViewClass: MTG.CreateDeckView
                });
            },
            confirm: function() {
                var self = this;
                var name = this.get("name"), privateDeck = this.get("private");
                var data = {
                    title: name,
                    "private": privateDeck,
                    user: MTG.get("session.user.id")
                };
                MTG.Ajax.post("/deck/", data).then(function(data) {
                    if (data.id) {
                        self.transitionToRoute("deck.edit", data.id);
                    }
                }).catch(function() {
                    Ember.logger.error("Create deck error");
                });
            },
            cancel: Ember.K
        }
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
                    if (c.get("set_name")) {
                        self.set("imageUrl", c.get("mtgImage"));
                        return null;
                    }
                    return c.reload().then(function(c) {
                        self.set("imageUrl", c.get("mtgImage"));
                    });
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
            var postData = {
                data: JSON.stringify(data)
            };
            MTG.Ajax.post(path + "update_cards/", postData).then(function() {
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
                var postData = {
                    data: JSON.stringify(data)
                };
                MTG.Ajax.post(path + "update_cards/", postData).then(function() {
                    self.get("selectedCards").addObject(card);
                    MTG.socket("deck").emit("deck_update", deck.get("id"));
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
        },
        afterModel: function(model) {
            if (!model.get("canEdit")) {
                this.transitionTo("deck.detail", model.get("id"));
            }
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
    MTG.RegisterController = Ember.Controller.extend({
        username: null,
        email: null,
        password: null,
        passwordRepeat: null,
        registrationError: false,
        usernameFree: false,
        actions: {
            register: function() {
                var username = this.get("username"), email = this.get("email"), password = this.get("password"), passwordRepeat = this.get("passwordRepeat");
                if (username && email && password && password === passwordRepeat) {
                    var self = this;
                    var data = {
                        username: username,
                        password: password,
                        email: email
                    };
                    MTG.Ajax.post("/auth/register/", data).then(function() {
                        self.set("registrationError", false);
                        self.session.authenticateWithCredentials(username, password).then(function() {
                            self.transitionTo("index");
                        });
                    }).catch(function() {
                        self.set("registrationError", true);
                    });
                }
            }
        },
        formNotComplete: function() {
            var username = this.get("username"), email = this.get("email"), password = this.get("password"), passwordRepeat = this.get("passwordRepeat");
            return !(username && email && password && password === passwordRepeat);
        }.property("username", "email", "password", "passwordRepeat"),
        passwordsNoMatch: function() {
            return this.get("password") !== this.get("passwordRepeat");
        }.property("password", "passwordRepeat"),
        usernameCheckPassed: function() {
            var username = this.get("username"), free = this.get("usernameFree");
            return username && free;
        }.property("username", "usernameFree"),
        checkUsername: function() {
            var self = this;
            var data = {
                username: this.get("username")
            };
            MTG.Ajax.get("/auth/register/", data).then(function(res) {
                self.set("usernameFree", false);
            }).catch(function(res) {
                self.set("usernameFree", true);
            });
        }.observes("username")
    });
})();

(function() {
    "use strict";
    MTG.RegisterView = Ember.View.extend({
        templateName: "register/register",
        classNames: [ "register" ],
        submit: function() {
            this.get("controller").send("register");
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