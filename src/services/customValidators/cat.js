if (!customValidators) {

  console.log("Cannot define validator validateCAT()", new Date());

} else {

  customValidators.validateCAT = function(viewValue, form) {
    var fieldId = form.fieldId;

    if (!viewValue) {
      console.log("validateCAT(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Response(s) missing
    //
    var errors = [];

    if (viewValue.cough == null) errors.push('field' + fieldId + "-cough");
    if (viewValue.phlegm == null) errors.push('field' + fieldId + "-phlegm");
    if (viewValue.chest == null) errors.push('field' + fieldId + "-chest");
    if (viewValue.up == null) errors.push('field' + fieldId + "-up");
    if (viewValue.limited == null) errors.push('field' + fieldId + "-limited");
    if (viewValue.outside == null) errors.push('field' + fieldId + "-outside");
    if (viewValue.sleep == null) errors.push('field' + fieldId + "-sleep");
    if (viewValue.energy == null) errors.push('field' + fieldId + "-energy");

    if (errors.length > 0) {
      errors.unshift('field' + fieldId + "-cat"); // insert at front
      return {
        custom: true,
        valid: false,
        error: {
          code: 5000,
          element_id: errors
        }
      }
    }

    return {valid:true};
  }

}
