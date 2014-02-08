MTG.Router.map(function () {
    this.resource('search');

    this.resource('card', function () {
        this.route('detail', { path: '/:id' });
    });

    this.resource('deck', function () {
        this.route('detail', { path: '/:id' });
        this.route('edit', { path: '/:id/edit' });
        this.route('new');
    });

    this.route('login');
});
