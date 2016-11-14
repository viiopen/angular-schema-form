if (!customValidators) {

  console.log("Cannot define validator validateDecidePrioritiesAndStyles()", new Date());

} else {

  customValidators.validateDecidePrioritiesAndStyles = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecidePrioritiesAndStyles(): no value provided");
      return;
    }

    var fieldId = form.fieldId;
    var element_ids = [];

    for (var i in viewValue) {
      if (_isEmpty(viewValue[i].what_i_did)) {
        element_ids.push('field' + fieldId + '-' + i + '-what_i_did');
      }
      if (_isEmpty(viewValue[i].priority)) {
        element_ids.push('field' + fieldId + '-' + i + '-priority');
      } else {
        if (viewValue[i].priority == 3 && _isEmpty(viewValue[i].other_priority)) {
          element_ids.push('field' + fieldId + '-' + i + '-other_priority');
        }
      }
      if (_isEmpty(viewValue[i].style)) {
        element_ids.push('field' + fieldId + '-' + i + '-style');
      }
    }

    if (element_ids.length > 0) {
      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids }
      }
    }

    return {valid:true};
  }

}
