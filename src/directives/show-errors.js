angular.module('schemaForm').directive('sfShowErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var child, found = false;

      scope.$on('vii-asf-error', function(event, error) {
        found = false;
        element.addClass('error');
        var children = element.children();
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          if (child.className.indexOf('error-msg') !== -1) {
            found = true;
            break;
          }
        }
        if (found) {
          child.className += ' error';
          child.innerHTML = error;
        }
      });

      scope.$on('vii-remove-asf-error', function() {
        found = false;
        element.removeClass('error');
        var children = element.children();
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          if (child.className.indexOf('error-msg') !== -1) {
            found = true;
            break;
          }
        }
        if (found) {
          child.className = child.className.replace(/\berror\b/gi, '').trim();
          child.innerHTML = '';
        }
      });

    }
  };

}]);
