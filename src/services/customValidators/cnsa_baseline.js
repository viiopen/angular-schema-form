if (!customValidators) {

} else {
  customValidators.validateCnsaBaseline = function(viewValue, form, model) {
    var fieldId = form.fieldId;

    console.log('viewValue', viewValue);
    console.log('form', form);
    console.log('model', model);

    if (model.employment == 1) {
      var employedFields = [
        'full_part_time',
        'occupation_level',
        'plan_return_work'
      ];

      var employedReturn = {
        custom: true,
        valid: false,
        error: {
          code: 0,
          element_ids: []
        },
        rootScopeBroadCast: true
      };

      for (var i = 0; i < employedFields.length; i++) {
        var fieldName = employedFields[i];

        if (!model[fieldName]) {
          employedReturn.error.element_ids.push('field-' + fieldName + '-' + fieldId);
        }
      }

      if (employedReturn.error.element_ids.length > 0) {
        return employedReturn;
      }
    }

    if (model.employment == 2) {
      var notWorkingFields = [
        'employed_not_working',
        'occupation_level',
        'plan_return_work'
      ];

      var notWorkingReturn = {
        custom: true,
        valid: false,
        error: {
          code: 0,
          element_ids: []
        },
        rootScopeBroadCast: true
      };

      for (var j = 0; j < notWorkingFields.length; j++) {
        var fieldName = notWorkingFields[j];

        if (!model[fieldName]) {
          notWorkingReturn.error.element_ids.push('field-' + fieldName + '-' + fieldId);
        }
      }

      if (notWorkingReturn.error.element_ids.length > 0) {
        return notWorkingReturn;
      }
    }

    if (model.employment == 3) {
      if (!model.unemployed) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [
              'field-unemployed-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }
    }

    if (model.act_out_home == 1) {
      if (!model.describe_act_out) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [
              'field-describe_act_out-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }
    }

    if (model.act_in_home == 1) {
      if (!model.describe_act_in) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [
              'field-describe_act_in-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }
    }

    if (model.smoking_status == 1 || model.smoking_status == 2) {
      if (!model.smoking_cessation) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [
              'field-smoking_cessation-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }
    }

    return {
      valid: true
    };
  }
}
