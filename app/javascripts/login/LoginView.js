MTG.LoginView = Ember.View.extend({
    classNames: ['login'],
    templateName: ['login/login'],

    submit: function () {
        this.get('controller').send('login');
    }
});
