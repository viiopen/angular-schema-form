if (!customValidators) {

  console.log("Cannot define validator validateDecideGoalsList()", new Date());

} else {

  customValidators.validateDecideGoalsList = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecideGoalsList(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Minimum number of options missing
    //   5001: Option is null or blank
    //
    for (var i = 0; i < viewValue.length; i++) {

      if (viewValue[i].goal.things_to_do.length < form.initialListLength) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 5000
          }
        }
      }

      // if the number of non-blank/null options is less than required, return error
      var option_count = 0;

      for (var ii = 0; ii < viewValue[i].goal.things_to_do.length; ii++ ) {
        if (viewValue[i].goal.things_to_do[ii] != null) {
          var o = viewValue[i].goal.things_to_do[ii].option;
          if (o.option != null && /\S/.test(o.option)) option_count++;
        }
      }

      if (option_count < form.initialListLength) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 5001
          }
        }
      }

    }

    return {valid:true};
  }

}
