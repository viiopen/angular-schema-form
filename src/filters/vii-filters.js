angular.module('vii.filters', [])

.filter('trustAsHtml', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  }
})

.filter('trimmed', function() {
  return function(val) {
    if (val) {
      return val.replace(/\s+/g, ' ').trim();
    } else {
      return "";
    }
  }
})

; // end of filters
