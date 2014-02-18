MTG.WebSocketMixin = Ember.Mixin.create({
    init: function () {
        this._super();

        var self = this;
        var func, prop, socket;

        for(prop in this) {
            func = this[prop];

            (function (scopedFunc) {
                if (scopedFunc && scopedFunc.__socket_events) {
                    var events = scopedFunc.__socket_events;

                    var namespace = events[0],
                        event = events[1];

                    socket = MTG.socket(namespace);
                    socket.on(event, function () {
                        scopedFunc.apply(self, arguments);
                    });
                }
            })(func);
        }
    }
});
