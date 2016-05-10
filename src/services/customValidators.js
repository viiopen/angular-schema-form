angular.module('schemaForm').service('customValidators', [
  function() {
    return {
      validateDecideTactics: function(viewValue) {
        if (!viewValue) {
          console.log("validateDecideTactics(): no value provided");
          return;
        }

        //
        // Error Codes:
        //   5000: Missing effects (me/others/short/long/will it work/can I do it)
        //
        for (var i = 0; i < viewValue.length; i++) {
          for (var ii = 0; ii < viewValue[i].goal.things_to_do.length; ii++ ) {
            var o = viewValue[i].goal.things_to_do[ii].option;
            if (!(
              typeof o.can_i_do_it != "undefined" &&
              typeof o.effect_on_me != "undefined" &&
              typeof o.effect_on_others != "undefined" &&
              typeof o.long_term_effect != "undefined" &&
              typeof o.short_term_effect != "undefined" &&
              typeof o.will_it_work != "undefined"
            )) return {
              custom: true,
              valid: false,
              error: {
                code: 5000
              }
            };
          }
        }

        return {valid:true};
      },


      validateDecideGoalsList: function(viewValue, form) {
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
      },


      validateDecideFtrReason: function(viewValue, form) {
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
      },


      validateCAT: function(viewValue, form) {
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
              code: 5000
            },
            element_id: errors
          }
        }

        return {valid:true};
      }


    } // return
  }
]);
