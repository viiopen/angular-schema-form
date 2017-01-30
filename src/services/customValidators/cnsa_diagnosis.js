if (!customValidators) {

  console.log("Cannot define validator validateCnsaDiagnosis()", new Date());

} else {

  debugger;

  // hellooooo fromt eh schemas repo SYNC SCRIPT WORKS! 1234456456465

  customValidators.validateCnsaDiagnosis = function(viewValue, form, model) {

    debugger;

    var fieldId = form.fieldId;
    var element_ids;

    if (!(
      model.structural_nerve ||
      model.structural_spine ||
      model.clinical_manifestation ||
      model.toggle_deformity ||
      model.toggle_revision
    )) {
      return { custom: true, valid: false, error: { code: 0 } }
    }

    if (model.structural_nerve) {
      if (model.toggle_compression) {
        if (!(
          model.toggle_sn_t4 ||
          model.toggle_sn_t5 ||
          model.toggle_sn_t6 ||
          model.toggle_sn_t7 ||
          model.toggle_sn_t8 ||
          model.toggle_sn_t9 ||
          model.toggle_sn_t10 ||
          model.toggle_sn_t11 ||
          model.toggle_sn_t12 ||
          model.toggle_sn_l1 ||
          model.toggle_sn_l2 ||
          model.toggle_sn_l3 ||
          model.toggle_sn_l4 ||
          model.toggle_sn_l5 ||
          model.toggle_sn_s1
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'sn_level',
              element_ids: [
                'field-toggle_sn_t4-' + fieldId
              ]
            },
            rootScopeBroadCast: true
          }
        }
      }

      var levels = [
        't4',
        't5',
        't6',
        't7',
        't8',
        't9',
        't10',
        't11',
        't12',
        'l1',
        'l2',
        'l3',
        'l4',
        'l5',
        's1'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_sn_' + levels[i]]) {
          if (model['sn_' + levels[i] + '_side'] == null) {
            element_ids.push('field-sn_' + levels[i] + '_side-' + fieldId);
          }
          if (model['sn_' + levels[i] + '_type'] == null) {
            element_ids.push('field-sn_' + levels[i] + '_type-' + fieldId);
          }
        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    if (model.structural_spine) {
      if (!(
        model.toggle_ss_t4t5 ||
        model.toggle_ss_t5t6 ||
        model.toggle_ss_t6t7 ||
        model.toggle_ss_t7t8 ||
        model.toggle_ss_t8t9 ||
        model.toggle_ss_t9t10 ||
        model.toggle_ss_t10t11 ||
        model.toggle_ss_t11t12 ||
        model.toggle_ss_t12l1 ||
        model.toggle_ss_l1l2 ||
        model.toggle_ss_l2l3 ||
        model.toggle_ss_l3l4 ||
        model.toggle_ss_l4l5 ||
        model.toggle_ss_l5s1 ||
        model.toggle_ss_s1p
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'ss_seg',
            element_ids: [
              'field-toggle_ss_t4t5-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        }
      }

      levels = [
        't4t5',
        't5t6',
        't6t7',
        't7t8',
        't8t9',
        't9t10',
        't10t11',
        't11t12',
        't12l1',
        'l1l2',
        'l2l3',
        'l3l4',
        'l4l5',
        'l5s1',
        's1p'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_ss_' + levels[i]]) {

          if (model['toggle_ss_' + levels[i] + '_listhesis']) {
            if (model['ss_' + levels[i] + '_listh_stable_dynamic'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_stable_dynamic-' + fieldId);
            }
            if (model['ss_' + levels[i] + '_listh_isthmic_degen'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_isthmic_degen-' + fieldId);
            }
            if (model['ss_' + levels[i] + '_listh_MaxGrade'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_MaxGrade-' + fieldId);
            }
          }

          if (model['ss_' + levels[i] + '_mecDiscColl'] == null) {
            element_ids.push('field-ss_' + levels[i] + '_mecDiscColl-' + fieldId);
          }

        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    debugger;

    if (model.clinical_manifestation) {
      if (!(
        model.toggle_cm_radiculopathy ||
        model.toggle_cm_neuroClaud ||
        model.toggle_cm_myelopathy ||
        model.toggle_cm_neuroBowelBladd ||
        model.clinical_manifestation_lowest_motor ||
        model.toggle_cm_backPain
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'cm',
            element_ids: [ 'field-toggle_cm_radiculopathy-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.clinical_manifestation_lowest_motor) {
        if (model.cm_lowestMotor == null) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: [ 'field-cm_lowestMotor-' + fieldId ]
            },
            rootScopeBroadCast: true
          }
        }
      }

      element_ids = [];

      if (model.toggle_cm_backPain) {
        if (model.cm_backPain_mechanical == null) {
          element_ids.push('field-cm_backPain_mechanical-' + fieldId);
        }
        if (model.cm_back_pain_generator == null || model.cm_back_pain_generator.length < 1) {
          element_ids.push('field-cm_back_pain_generator-' + fieldId);
        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }


    if (model.toggle_deformity) {
      if (model.def_ll != null && model.def_pi == null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-def_pi-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      } else if (model.def_ll == null && model.def_pi != null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-def_ll-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }
    }


    if (model.toggle_revision) {
      if (!(
        model.toggle_revision_reason_deg ||
        model.toggle_revision_reason_sls ||
        model.toggle_revision_reason_pseudo ||
        model.toggle_revision_reason_pjk ||
        model.toggle_revision_reason_djk ||
        model.toggle_revision_reason_instFail ||
        model.toggle_revision_reason_slrhnp
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'reasons',
            element_ids: [ 'field-toggle_revision_reason_deg-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      element_ids = [];

      if (model.toggle_revision_reason_instFail && model.rev_instFail_months == null) {
        element_ids.push('field-rev_instFail_months-' + fieldId);
      }
      if (model.toggle_revision_reason_slrhnp && model.rev_recurrentHNP == null) {
        element_ids.push('field-rev_recurrentHNP-' + fieldId);
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    return {valid:true}
  }

}
