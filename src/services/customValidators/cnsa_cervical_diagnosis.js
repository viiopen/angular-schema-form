if (!customValidators) {

} else {
  customValidators.validateCnsaCervicalDiagnosis = function(viewValue, form, model) {

    var fieldId = form.fieldId;
    var element_ids;

    if (model.toggle_compression === null) {
      var returnVal = {
        custom: true,
        valid: false,
        error: {
          code: 0,
          element_ids: [
            'field-toggle_compression-' + fieldId
          ]
        },
        rootScopeBroadCast: true
      };

      if (!model.toggle_clinical_manifestation) {
        returnVal.error.element_ids.push('field-toggle_clinical_manifestation-' + fieldId);
      }

      return returnVal;
    }

    if (model.toggle_compression) {
      if (!(
        model.toggle_sn_occip ||
        model.toggle_sn_c1 ||
        model.toggle_sn_c2 ||
        model.toggle_sn_c3 ||
        model.toggle_sn_c4 ||
        model.toggle_sn_c5 ||
        model.toggle_sn_c6 ||
        model.toggle_sn_c7 ||
        model.toggle_sn_t1 ||
        model.toggle_sn_t2 ||
        model.toggle_sn_t3
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'sn_level',
            element_ids: [
              'field-toggle_compression-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }

      var levels = [
        'occip',
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        'c6',
        'c7',
        't1',
        't2',
        't3'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_sn_' + levels[i]]) {
          if (model['sn_' + levels[i] + '_side'] === null) {
            element_ids.push('field-sn_' + levels[i] + '_side-' + fieldId);
          }
          if (model['sn_' + levels[i] + '_type'] === null) {
            element_ids.push('field-sn_' + levels[i] + '_type-' + fieldId);
          }
          if (model['sn_' + levels[i] + '_nerve_root'] === null) {
            element_ids.push('field-sn_' + levels[i] + '_nerve_root-' + fieldId);
          }
        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: element_ids
          },
          rootScopeBroadCast: true
        };
      }
    }

    if (model.toggle_structural_spine) {
      if (!(
        model.toggle_ss_occipc1 ||
        model.toggle_ss_c1c2 ||
        model.toggle_ss_c2c3 ||
        model.toggle_ss_c3c4 ||
        model.toggle_ss_c4c5 ||
        model.toggle_ss_c5c6 ||
        model.toggle_ss_c6c7 ||
        model.toggle_ss_c7t1 ||
        model.toggle_ss_t1t2 ||
        model.toggle_ss_t2t3 ||
        model.toggle_ss_t3t4
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'ss_seg',
            element_ids: [
              'field-toggle_structural_spine-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        };
      }

      var levels = [
        'occipc1',
        'c1c2',
        'c2c3',
        'c3c4',
        'c4c5',
        'c5c6',
        'c6c7',
        'c7t1',
        't1t2',
        't2t3',
        't3t4'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_ss_' + levels[i]]) {
          if (model['toggle_ss_' + levels[i] + '_listhesis']) {
            if (model['ss_' + levels[i] + '_listh_MaxGrade'] === null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_MaxGrade-' + fieldId);
            }
          }
          if (model['ss_' + levels[i] + '_mecDiscColl'] === null) {
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
        };
      }
    }

    // field is required
    if (model.toggle_clinical_manifestation === null) {
      return {
        custom: true,
        valid: false,
        error: {
          code: '0',
          element_ids: [ 'field-toggle_clinical_manifestation-' + fieldId ]
        },
        rootScopeBroadCast: true
      };
    } else if (model.toggle_clinical_manifestation) {
      if (!(
        model.toggle_cm_radiculopathy ||
        model.toggle_cm_myelopathy ||
        model.toggle_mechanicalInstability ||
        model.toggle_cm_neuroBowelBladd ||
        model.toggle_cm_motor_deficit
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'cm',
            element_ids: [ 'field-toggle_clinical_manifestation-' + fieldId ]
          },
          rootScopeBroadCast: true
        };
      }

      if (model.toggle_cm_motor_deficit) {
        if (model.cm_lowestMotorScore === null) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: [ 'field-cm_lowestMotorScore-' + fieldId ]
            },
            rootScopeBroadCast: true
          };
        }
      }
    }

    if (model.toggle_revision) {
      if (!(
        model.toggle_revision_reason_deg ||
        model.toggle_revision_reason_sameLevelStenosis ||
        model.toggle_revision_reason_pseudoarthrosis ||
        model.toggle_revision_reason_pjk ||
        model.toggle_revision_reason_djk ||
        model.toggle_revision_reason_instFail
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'reasons',
            element_ids: [ 'field-toggle_revision-' + fieldId ]
          },
          rootScopeBroadCast: true
        };
      }

      element_ids = [];

      if (model.toggle_revision_reason_instFail && model.rev_instFail_months === null) {
        element_ids.push('field-rev_instFail_months-' + fieldId);
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        };
      }
    }

    return {
      valid: true
    };
  };
}
