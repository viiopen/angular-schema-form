angular.module('schemaForm').directive('sfShowErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var child, found = false;

      scope.$on('vii-asf-error', function(event, error) {
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
        } else {
          console.log('Could not find error-msg for this field', element);
        }
      });

      scope.$on('vii-remove-asf-error', function() {
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
        } else {
          console.log('Could not find error-msg for this field', element);
        }
      });

    }
  };

}]);
