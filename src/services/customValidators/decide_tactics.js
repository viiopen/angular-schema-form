if (!customValidators) {

  console.log("Cannot define validator validateDecideTactics()", new Date());

} else {

  customValidators.validateDecideTactics = function(viewValue) {
    if (!viewValue) {
      console.log("validateDecideTactics(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Each goal requires at least 1 option
    //   5000: Missing effects (me/others/short/long/will it work/can I do it)
    //

    for (var i = 0; i < viewValue.length; i++) {
      for (var ii = 0; ii < viewValue[i].goal.things_to_do.length; ii++ ) {

        if (viewValue[i].goal.things_to_do.join('').length == 0) {
          // missing options
          return {
            custom: true,
            valid: false,
            error: {
              code: 5000
            }
          };
        }

        if (viewValue[i].goal.things_to_do[ii] != null) {
          var o = viewValue[i].goal.things_to_do[ii].option;

          if (o.option == null || o.option.length == 0 || !/\S/.test(o.option)) {
            // options are blank
            return {
              custom: true,
              valid: false,
              error: {
                code: 5001
              }
            };
          }

          if (!(
            typeof o.can_i_do_it != "undefined" &&
            typeof o.effect_on_me != "undefined" &&
            typeof o.effect_on_others != "undefined" &&
            typeof o.long_term_effect != "undefined" &&
            typeof o.short_term_effect != "undefined" &&
            typeof o.will_it_work != "undefined"
          )) {
            // missing effects
            return {
              custom: true,
              valid: false,
              error: {
                code: 5000
              }
            };
          }
        }

      }
    }

    return {valid:true};
  }

}
