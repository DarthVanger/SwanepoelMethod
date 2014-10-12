(function() {
  'use strict';

  var app = angular.module('calculationModule');
  /** LoadingIndicator service
   *  Provides interface for triggering loading indicators
   */
  app.service('LoadingIndicator', function() {

    this.global = {};
    this.plot = {};

    this.global.show = function() {
      $('#loading').show();
    };
    this.global.hide= function() {
      $('#loading').hide();
    };

    this.plot.show = function() {
      $('#loading').show();
    }
    this.plot.hide= function() {
      $('#loading').hide();
    };

  }); // end service
})(); // end closure
