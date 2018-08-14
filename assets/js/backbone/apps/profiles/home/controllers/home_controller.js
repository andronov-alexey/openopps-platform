var _ = require('underscore');
var Backbone = require('backbone');
var BaseController = require('../../../../base/base_controller');
var HomeView = require('../views/home_view');

var HomeController = BaseController.extend({
  // The initialize method is mainly used for event bindings (for efficiency)
  initialize: function (options) {
    this.options - options;
    this.homeView = new HomeView({
      el: '#container',
      data: options,
    }).render();
    return this;
  },

  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function () {
    if (this.homeView) this.homeView.cleanup();
    removeView(this);
  },

});

module.exports = HomeController;
