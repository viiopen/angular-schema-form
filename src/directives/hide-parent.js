angular.module('schemaForm')

.directive('hideParent', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // viiopen - Add a class to the parent to hide it, KISS since we build w/jquery
      $(element).parent().addClass('hide');
    }
  };

}])

;
