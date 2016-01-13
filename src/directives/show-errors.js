angular.module('schemaForm')

.directive('sfShowErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var child, found = false;

      var getErrorMsgElement = function(parent) {
        var children = $(parent).children();
        if (children.length > 0) {
          for (var i = 0; i < children.length; i++) {
            child = getErrorMsgElement(children[i]);
            if (child) {
              break;
            }
          }
          return child;
        } else {
          return parent.className.indexOf('error_msg') !== -1 ? parent : false;
        }
      }

      scope.$on('vii-asf-error', function(event, error) {
        found = false;
        element.addClass('error');
        child = getErrorMsgElement(element);
        if (child) {
          if (child.className.indexOf(' error') == -1) child.className += ' error';
          child.innerHTML = error;
        }
      });

      scope.$on('vii-remove-asf-error', function() {
        found = false;
        element.removeClass('error');
        child = getErrorMsgElement(element);
        if (child) {
          child.className = child.className.replace(/\berror\b/gi, '').trim();
          child.innerHTML = '';
        }
      });

    }
  };

}])

.directive('sfShowHealthHistoryErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$on('vii-asf-error', function() {
        element.addClass('hh-error');
      });
      scope.$on('vii-remove-asf-error', function() {
        if ($(element).find('.error').length == 0) element.removeClass('hh-error');
      });
    }
  };

}])

;
