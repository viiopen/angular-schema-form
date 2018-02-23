if (!customValidators) {
  console.log("Cannot define validator validateCnsaTreatment()", new Date());
} else {
  customValidators.validateCnsaCervicalTreatment = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids;

    if (!(model.toggle_anterior_approach || model.toggle_posterior_approach)) {
      return {
        // top form level validation
        custom: true,
        valid: false,
        error: {
          code: 'no_aa_pa'
        }
      }
    }

    if (model.toggle_anterior_approach) {
      // all validation for anterior approach nested under here

      if (!(model.toggle_aa_discectomy || model.toggle_aa_corpectomy)) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'aa_no_disc_corp',
            element_ids: ['field-toggle_anterior_approach-' + fieldId]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.toggle_aa_discectomy) {
        if (!(
          model.toggle_aa_discectomy_c2c3 ||
          model.toggle_aa_discectomy_c3c4 ||
          model.toggle_aa_discectomy_c4c5 ||
          model.toggle_aa_discectomy_c5c6 ||
          model.toggle_aa_discectomy_c6c7 ||
          model.toggle_aa_discectomy_c7t1
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'aa_disc_levels',
              element_ids: ['field-toggle_aa_discectomy-' + fieldId]
            },
            rootScopeBroadCast: true
          }
        }

        if (!model['aa_discectomy_procedure']) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: ['field-aa_discectomy_procedure-' + fieldId]
            },
            rootScopeBroadCast: true
          }
        }

        var missingElementIds = [];

        if (model['aa_discectomy_procedure'] == 1) {
          // ACDF procedure was selected
          if (!model['aa_acdf_material']) {
            missingElementIds.push('field-aa_acdf_material-' + fieldId);
          }
          if (!model['aa_acdf_type']) {
            missingElementIds.push('field-aa_acdf_type-' + fieldId);
          }
          if (!model['aa_acdf_companyName']) {
            missingElementIds.push('field-aa_acdf_companyName-' + fieldId);
          }
        }

        if (missingElementIds.length > 0) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: missingElementIds
            },
            rootScopeBroadCast: true
          }
        }
      }

      if (model.toggle_aa_corpectomy) {
        if (!(
          model.toggle_aa_corpectomy_c2 ||
          model.toggle_aa_corpectomy_c3 ||
          model.toggle_aa_corpectomy_c4 ||
          model.toggle_aa_corpectomy_c5 ||
          model.toggle_aa_corpectomy_c6 ||
          model.toggle_aa_corpectomy_c7 ||
          model.toggle_aa_corpectomy_t1
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'aa_corp_levels',
              element_ids: ['field-toggle_aa_corpectomy-' + fieldId]
            },
            rootScopeBroadCast: true
          }
        }

        var corpectomyLevels = [
          'c2',
          'c3',
          'c4',
          'c5',
          'c6',
          'c7',
          't1'
        ];

        var missingElementIds = [];

        for (var i = 0; i < corpectomyLevels.length; i++) {
          const level = corpectomyLevels[i];

          if (model['toggle_aa_corpectomy_' + level]) {
            if (model['aa_corpectomy_' + level + '_material'] === null) {
              missingElementIds.push('field-aa_corpectomy_' + level + '_material-' + fieldId);
            }
            if (model['aa_corpectomy_' + level + '_type'] === null) {
              missingElementIds.push('field-aa_corpectomy_' + level + '_type-' + fieldId);
            }
            if (model['aa_corpectomy_' + level + '_companyName'] === null || model['aa_corpectomy_' + level + '_companyName'] == '') {
              missingElementIds.push('field-aa_corpectomy_' + level + '_companyName-' + fieldId);
            }
          }
        }

        if (missingElementIds.length > 0) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: missingElementIds
            },
            rootScopeBroadCast: true
          }
        }
      }
    }


    if (model.toggle_posterior_approach) {
      // all logic for posterior approach nested under here

      if (model.toggle_neural_decomp === null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'nd',
            element_ids: ['field-toggle_neural_decomp-' + fieldId]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.toggle_neural_decomp == 1) {
        // neural decompression was marked 'Yes'
        var missingNDElementIds = [];

        if (model.nd_open === null) {
          missingNDElementIds.push('field-nd_open-' + fieldId);
        }
        if (model.nd_procedure === null) {
          missingNDElementIds.push('field-nd_procedure-' + fieldId);
        }

        if (missingNDElementIds.length > 0) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: missingNDElementIds
            },
            rootScopeBroadCast: true
          }
        }

        if (!(
          model.toggle_nd_occip ||
          model.toggle_nd_c1 ||
          model.toggle_nd_c2 ||
          model.toggle_nd_c3 ||
          model.toggle_nd_c4 ||
          model.toggle_nd_c5 ||
          model.toggle_nd_c6 ||
          model.toggle_nd_c7 ||
          model.toggle_nd_c8 ||
          model.toggle_nd_t1 ||
          model.toggle_nd_t2 ||
          model.toggle_nd_t3
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'nd_levels',
              element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
            },
            rootScopeBroadCast: true
          };
        }

        var neuralDecompLevels = [
          'occip',
          'c1',
          'c2',
          'c3',
          'c4',
          'c5',
          'c6',
          'c7',
          'c8',
          't1',
          't2',
          't3'
        ];

        var missingNDSideElementIds = [];

        for (var i = 0; i < neuralDecompLevels.length; i++) {
          const level = neuralDecompLevels[i];

          if (model['toggle_nd_' + level]) {
            if (model['nd_' + level + '_side'] === null) {
              missingNDSideElementIds.push('field-nd_' + level + '_side-' + fieldId);
            }
          }
        }

        if (missingNDSideElementIds.length > 0) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: missingNDSideElementIds
            },
            rootScopeBroadCast: true
          }
        }
      } else if (model.toggle_neural_decomp == 0) {
        // neural decompression was marked 'No'
        if (!model.toggle_arthrodesis) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'post_app_no_nd_no_pa',
              element_ids: ['field-toggle_arthrodesis-' + fieldId]
            },
            rootScopeBroadCast: true
          }
        }

        if (!(
          model.toggle_pa_occipc1 ||
          model.toggle_pa_c1c2 ||
          model.toggle_pa_c2c3 ||
          model.toggle_pa_c3c4 ||
          model.toggle_pa_c4c5 ||
          model.toggle_pa_c5c6 ||
          model.toggle_pa_c6c7 ||
          model.toggle_pa_c7t1 ||
          model.toggle_pa_t1t2 ||
          model.toggle_pa_t2t3 ||
          model.toggle_pa_t3t4
        )) {
          return {
            custom: true,
            valid: false,
            error: {
                code: 'pa',
                element_ids: [ 'field-toggle_arthrodesis-' + fieldId ]
            },
            rootScopeBroadCast: true
          };
        }

        var missingPAElementIds = [];

        if (model.pa_fixation_co_name === null || model.pa_fixation_co_name == '') {
          missingPAElementIds.push('field-pa_fixation_co_name-' + fieldId);
        }

        if (missingPAElementIds.length > 0) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: missingPAElementIds
            },
            rootScopeBroadCast: true
          }
        }
      }
    }

    return {
      valid: true
    };
  };
}
