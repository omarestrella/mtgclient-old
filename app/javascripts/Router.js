MTG.Router.map(function () {
    this.resource('search');

    this.resource('card', function () {
        this.route('detail', { path: '/:id' });
    });
});
