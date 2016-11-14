angular.module('schemaForm')

.directive('sfShowErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var child;

      scope.$on('vii-asf-error', function(event, err) {
        var error = err;
        var showMsg = true;

        if (angular.isObject(err)) {
          error = err.error;
          // if there's a list of element ids, exit the function if this element's id
          // is not in that list
          if (err.element_ids && err.element_ids.length > 0) {
            if (err.element_ids.indexOf(element.attr("id")) < 0) {
              return;
            }
          }

          if ( err.noMsg && err.noMsg[element.attr("id")] ) showMsg = false;
        }

        element.addClass('error');

        if (showMsg) {
          $(element).find('> .error_msg').addClass('error').html(error);
        }
      });

      scope.$on('vii-remove-asf-error', function() {
        element.removeClass('error');
        $(element).children('.error').html('').removeClass('error');
      });

    }
  };

}])

;
