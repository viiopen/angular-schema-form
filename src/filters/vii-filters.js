angular.module('vii.filters', [])

.filter('trustAsHtml', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  }
})

; // end of filters
