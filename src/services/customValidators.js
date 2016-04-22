angular.module('schemaForm').service('customValidators', [
  function() {
    return {
      validateDECIDETactics: function(viewValue) {
        if (!viewValue) {
          console.log("validateDECIDETactics(): no value provided");
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


      validateCAT: function(viewValue, fieldId) {
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
          errors.unshift('field' + fieldId + "-cat");
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