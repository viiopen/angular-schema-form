angular.module('schemaForm').service('customValidators', [
  function() {
    return {  // customValidators
      validateDecideTactics: function(viewValue) {
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
      },


      validateCnsaDiagnosis: function(viewValue, form, model) {
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
              return { custom: true, valid: false, error: { code: 'sn_level' } }
            }
          } else {
            return { custom: true, valid: false, error: { code: 'sn_comp' } }
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

          for (var i in levels) {
            if (model['toggle_sn_' + levels[i]]) {
              if (model['sn_' + levels[i] + '_side'] == null) {
                return { custom: true, valid: false, error: { code: 'sn_side' } }
              }
              if (model['sn_' + levels[i] + '_type'] == null) {
                return { custom: true, valid: false, error: { code: 'sn_type' } }
              }
            }
          }
        } else {
          /////return { custom: true, valid: false, error: { code: 'sn' } }
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
            return { custom: true, valid: false, error: { code: 'ss_seg' } }
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

          for (var i in levels) {
            if (model['toggle_ss_' + levels[i]]) {
              if (!(
                model['toggle_ss_' + levels[i] + '_listhesis'] ||
                model['ss_' + levels[i] + '_mecDiscColl'] != null ||
                model['toggle_ss_' + levels[i] + '_signFacDis']
              )) {
                return { custom: true, valid: false, error: { code: 'ss_seg_data' } }
              }

              if (!model['toggle_ss_' + levels[i] + '_listhesis']) {
                return { custom: true, valid: false, error: { code: 'ss_listh' } }
              } else {
                if (model['ss_' + levels[i] + '_listh_stable_dynamic'] == null) {
                  return { custom: true, valid: false, error: { code: 'ss_listh_sd' } }
                }
                if (model['ss_' + levels[i] + '_listh_isthmic_degen'] == null) {
                  return { custom: true, valid: false, error: { code: 'ss_listh_id' } }
                }
                if (model['ss_' + levels[i] + '_listh_MaxGrade'] == null) {
                  return { custom: true, valid: false, error: { code: 'ss_listh_max' } }
                }
              }
              if (model['ss_' + levels[i] + '_mecDiscColl'] == null) {
                return { custom: true, valid: false, error: { code: 'ss_disc' } }
              }



            }
          }
        } else {
          ///////return { custom: true, valid: false, error: { code: 'ss' } }
        }

        if (model.clinical_manifestation) {
          if (!(
            model.toggle_cm_radiculopathy ||
            model.toggle_cm_neuroClaud ||
            model.toggle_cm_myelopathy ||
            model.toggle_cm_neuroBowelBladd ||
            model.clinical_manifestation_lowest_motor ||
            model.toggle_cm_backPain
          )) {
            return { custom: true, valid: false, error: { code: 'cmdata' } }
          }

          if (model.clinical_manifestation_lowest_motor) {
            if (model.cm_lowestMotor == null) {
              return { custom: true, valid: false, error: { code: 'lmotor' } }
            }
          }

          if (model.toggle_cm_backPain) {
            if (model.cm_backPain_mechanical == null) {
              return { custom: true, valid: false, error: { code: 'mech' } }
            }
            if (model.cm_back_pain_generator == null || model.cm_back_pain_generator.length < 1) {
              return { custom: true, valid: false, error: { code: 'pg' } }
            }
          }
        } else {
          /////////return { custom: true, valid: false, error: { code: 'cm' } }
        }


        if (model.toggle_deformity) {
          /*
          if (model.def_sva == null) {
            return { custom: true, valid: false, error: { code: 'sva' } }
          }
          if (model.def_ci == null) {
            return { custom: true, valid: false, error: { code: 'ci' } }
          }
          if (model.def_ll_pi == null && model.def_ll == null && model.def_pi == null) {
            return { custom: true, valid: false, error: { code: 'llpi' } }
          } else {
            if (model.def_ll != null && model.def_pi == null) {
              return { custom: true, valid: false, error: { code: 'pi' } }
            } else if (model.def_ll == null && model.def_pi != null) {
              return { custom: true, valid: false, error: { code: 'll' } }
            }
          }
          if (model.def_max_thor_coronalCurve == null) {
            return { custom: true, valid: false, error: { code: 'tcc' } }
          }
          if (model.def_max_lumb_coronalCurve == null) {
            return { custom: true, valid: false, error: { code: 'lcc' } }
          }
          */
          if (model.def_ll != null && model.def_pi == null) {
            return { custom: true, valid: false, error: { code: 'pi' } }
          } else if (model.def_ll == null && model.def_pi != null) {
            return { custom: true, valid: false, error: { code: 'll' } }
          }
        } else {
          ///////return { custom: true, valid: false, error: { code: 'def' } }
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
            return { custom: true, valid: false, error: { code: 'reasons' } }
          }
          if (model.toggle_revision_reason_instFail && model.rev_instFail_months == null) {
            return { custom: true, valid: false, error: { code: 'inst' } }
          }
          if (model.toggle_revision_reason_slrhnp && model.rev_recurrentHNP == null) {
            return { custom: true, valid: false, error: { code: 'hnp' } }
          }
        } else {
          ///////return { custom: true, valid: false, error: { code: 'revision' } }
        }

        return {valid:true}
      },


      validateCnsaTreatment: function(viewValue, form, model) {
        if (!(
          model.toggle_neural_decomp ||
          model.arthrodesis ||
          model.toggle_research_pt
        )) {
          return { custom: true, valid: false, error: { code: 0 } }
        }

        if (model.toggle_neural_decomp) {
          if (model.nd_open == null) {
            return { custom: true, valid: false, error: { code: 'nd_open' } }
          }

          if (!(
            model.toggle_nd_t4 ||
            model.toggle_nd_t5 ||
            model.toggle_nd_t6 ||
            model.toggle_nd_t7 ||
            model.toggle_nd_t8 ||
            model.toggle_nd_t9 ||
            model.toggle_nd_t10 ||
            model.toggle_nd_t11 ||
            model.toggle_nd_t12 ||
            model.toggle_nd_l1 ||
            model.toggle_nd_l2 ||
            model.toggle_nd_l3 ||
            model.toggle_nd_l4 ||
            model.toggle_nd_l5 ||
            model.toggle_nd_s1
          )) {
            return { custom: true, valid: false, error: { code: 'nd_levels' } }
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

          for (var i in levels) {
            if (model['toggle_nd_' + levels[i]]) {
              if (model['nd_' + levels[i] + '_side'] == null) {
                return { custom: true, valid: false, error: { code: 'nd_side' } }
              }
            }
          }

        } else {
          ///////return { custom: true, valid: false, error: { code: 'nd' } }
        }

        if (model.arthrodesis) {
          if (!(model.toggle_post_arthrod || model.toggle_ant_arthrod)) {
            return { custom: true, valid: false, error: { code: 'arth_post_ant' } }
          }

          if (model.toggle_post_arthrod && !(
            model.pa_open != null ||
            model.pa_fixationSystem != null ||
            model.pa_interbodyGraft != null ||
            model.toggle_pa_t4t5 ||
            model.toggle_pa_t5t6 ||
            model.toggle_pa_t6t7 ||
            model.toggle_pa_t7t8 ||
            model.toggle_pa_t8t9 ||
            model.toggle_pa_t9t10 ||
            model.toggle_pa_t10t11 ||
            model.toggle_pa_t11t12 ||
            model.toggle_pa_t12l1 ||
            model.toggle_pa_l1l2 ||
            model.toggle_pa_l2l3 ||
            model.toggle_pa_l3l4 ||
            model.toggle_pa_l4l5 ||
            model.toggle_pa_l5s1 ||
            model.toggle_pa_s1p
          )) {
            return { custom: true, valid: false, error: { code: 'pa' } }
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

          for (var i in levels) {
            if (model['toggle_pa_' + levels[i]]) {
              if (!model['toggle_posa_' + levels[i] + '_spacer']) {
                return { custom: true, valid: false, error: { code: 'pa_spacer' } }
              } else {
                if (model['pa_' + levels[i] + '_spacer'] == null) {
                  return { custom: true, valid: false, error: { code: 'pa_spacer_level' } }
                }
                if (model['pa_' + levels[i] + 'pa_t4t5_spacer_staticExpand'] == null) {
                  return { custom: true, valid: false, error: { code: 'pa_static_exp' } }
                }
              }
            }
          }

          if (model.toggle_ant_arthrod && !(
            model.aa_interbodyGraft != null ||
            model.toggle_pa_t4t5 ||
            model.toggle_pa_t5t6 ||
            model.toggle_pa_t6t7 ||
            model.toggle_pa_t7t8 ||
            model.toggle_pa_t8t9 ||
            model.toggle_pa_t9t10 ||
            model.toggle_pa_t10t11 ||
            model.toggle_pa_t11t12 ||
            model.toggle_pa_t12l1 ||
            model.toggle_pa_l1l2 ||
            model.toggle_pa_l2l3 ||
            model.toggle_pa_l3l4 ||
            model.toggle_pa_l4l5 ||
            model.toggle_pa_l5s1 ||
            model.toggle_pa_s1p
          )) {
            return { custom: true, valid: false, error: { code: 'aa' } }
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

          for (var i in levels) {
            if (model['toggle_aa_' + levels[i]]) {
              if (model['aa_' + levels[i] + '_approach'] == null) {
                return { custom: true, valid: false, error: { code: 'aa_approach' } }
              }
              if (model['aa_' + levels[i] + 'open'] == null) {
                return { custom: true, valid: false, error: { code: 'aa_open' } }
              }
            }
          }

        } else {
          ///////return { custom: true, valid: false, error: { code: 'arth' } }
        }

        return {valid:true}
      }


    } // end customValidators
  }
]);
