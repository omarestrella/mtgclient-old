MTG.RegisterView = Ember.View.extend({
    templateName: 'register/register',
    classNames: ['register'],

    submit: function () {
        this.get('controller').send('register');
    }
});
