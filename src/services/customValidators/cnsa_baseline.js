if (!customValidators) {

} else {
  customValidators.validateCnsaBaseline = function(viewValue, form, model) {
    var fieldId = form.fieldId;

    var returnValue = {
      custom: true,
      valid: false,
      error: {
        code: 0,
        element_ids: []
      },
      rootScopeBroadCast: true
    };

    if (model.employment == 1) {
      var employedFields = [
        'full_part_time',
        'occupation_level'
      ];

      for (var i = 0; i < employedFields.length; i++) {
        var fieldName = employedFields[i];

        if (!model[fieldName] || model[fieldName] == -88) {
          returnValue.error.element_ids.push('field-' + fieldName + '-' + fieldId);
        }
      }

      if (model.plan_return_work == -88) {
        returnValue.error.element_ids.push('field-plan_return_work-' + fieldId);
      }
    }

    if (model.employment == 2) {
      var notWorkingFields = [
        'employed_not_working',
        'occupation_level'
      ];

      for (var j = 0; j < notWorkingFields.length; j++) {
        var fieldName = notWorkingFields[j];

        if (!model[fieldName] || model[fieldName] == -88) {
          returnValue.error.element_ids.push('field-' + fieldName + '-' + fieldId);
        }
      }

      if (model.plan_return_work == -88) {
        returnValue.error.element_ids.push('field-plan_return_work-' + fieldId);
      }
    }

    if (model.employment == 3) {
      if (!model.unemployed || model.unemployed == -88) {
        returnValue.error.element_ids.push('field-unemployed-' + fieldId);
      }
    }

    if (model.act_out_home == 1) {
      if (!model.describe_act_out || model.describe_act_out == -88) {
        returnValue.error.element_ids.push('field-describe_act_out-' + fieldId);
      }
    }

    if (model.act_in_home == 1) {
      if (!model.describe_act_in || model.describe_act_in == -88) {
        returnValue.error.element_ids.push('field-describe_act_in-' + fieldId);
      }
    }

    if (model.smoking_status == 1 || model.smoking_status == 2) {
      if (!model.smoking_cessation || model.smoking_cessation == -88) {
        returnValue.error.element_ids.push('field-smoking_cessation-' + fieldId);
      }
    }

    if (returnValue.error.element_ids.length > 0) {
      return returnValue;
    }

    return {
      valid: true
    };
  }
}
