if (!customValidators) {

  console.log("Cannot define validator validateDecideFtrReason()", new Date());

} else {

  customValidators.validateDecideFtrReason = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecideFtrReason(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Minimum number of options missing
    //   5001: Option is null or blank
    //
    if (viewValue.length < 1) {
      return {
        custom: true, valid: false, error: { code: 5000 }
      }
    }

    var all_null = true;
    var good_value = false;

    for (var i in viewValue) {
      if (viewValue[i] != null) {
        all_null = false;
        if (viewValue[i] != "" && /\S/.test(viewValue[i])) {
          good_value = true;
        }
      }
    }

    if (all_null) {
      return {
        custom: true, valid: false, error: { code: 5000 }
      }
    }

    if (!good_value) {
      return {
        custom: true, valid: false, error: { code: 5001 }
      }
    }

    return {valid:true};
  }

}
