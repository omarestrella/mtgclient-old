MTG.Router.map(function () {
    this.resource('card', function () {
        this.route('detail', { path: '/:id' });
    });
});
