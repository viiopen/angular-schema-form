angular.module('schemaForm').config(['schemaFormDecoratorsProvider', function(decoratorsProvider) {
  var base = 'directives/decorators/foundation/';

  decoratorsProvider.defineDecorator('foundationDecorator', {
    textarea: {template: base + 'textarea.html', replace: false},
    fieldset: {template: base + 'fieldset.html', replace: false},
    /*fieldset: {template: base + 'fieldset.html', replace: true, builder: function(args) {
      var children = args.build(args.form.items, args.path + '.items');
      console.log('fieldset children frag', children.childNodes)
      args.fieldFrag.childNode.appendChild(children);
    }},*/
    array: {template: base + 'array.html', replace: false},
    tabarray: {template: base + 'tabarray.html', replace: false},
    tabs: {template: base + 'tabs.html', replace: false},
    section: {template: base + 'section.html', replace: false},
    conditional: {template: base + 'section.html', replace: false},
    actions: {template: base + 'actions.html', replace: false},
    select: {template: base + 'select.html', replace: false},
    checkbox: {template: base + 'checkbox.html', replace: false},
    checkboxes: {template: base + 'checkboxes.html', replace: false},
    number: {template: base + 'default.html', replace: false},
    password: {template: base + 'default.html', replace: false},
    submit: {template: base + 'submit.html', replace: false},
    button: {template: base + 'submit.html', replace: false},
    radios: {template: base + 'radios.html', replace: false},
    slider: {template: base + 'slider.html', replace: false},
    'detailed-range': { template: base + 'detailed-range.html', replace: false },
    'odl-widget': {template: base + 'odl-widget.html', replace: false },
    save: {template: base + 'save.html', replace: false},
    markdown: {template: base + 'markdown.html', replace: false},
    media: {template: base + 'media.html', replace: false},
    category: {template: base + 'category.html', replace: false},
    'radios-inline': {template: base + 'radios-inline.html', replace: false},
    medications: {template: base + 'medications.html', replace: false},
    height: {template: base + 'height.html', replace: false},
    weight: {template: base + 'weight.html', replace: false},
    /*radiobuttons: {template: base + 'radio-buttons.html', replace: false},*/
    help: {template: base + 'help.html', replace: false},
    hidden: {template: base + 'hidden.html', replace: false},
    'default': {template: base + 'default.html', replace: false}
  }, [
    function(form) {
      console.debug(form, 'www');
    }
  ]);

  //manual use directives
  decoratorsProvider.createDirectives({
    textarea: base + 'textarea.html',
    select: base + 'select.html',
    checkbox: base + 'checkbox.html',
    checkboxes: base + 'checkboxes.html',
    number: base + 'default.html',
    submit: base + 'submit.html',
    button: base + 'submit.html',
    text: base + 'default.html',
    date: base + 'default.html',
    password: base + 'default.html',
    datepicker: base + 'datepicker.html',
    input: base + 'default.html',
    radios: base + 'radios.html',
    slider: base + 'slider.html',
    'detailed-range': base + 'detailed-range.html',
    'odl-widget': base + 'odl-widget.html',
    save: base + 'save.html',
    medications: {template: base + 'medications.html', replace: false},
    height: {template: base + 'height.html', replace: false},
    weight: {template: base + 'weight.html', replace: false},
    markdown: base + 'markdown.html',
    media: base + 'media.html',
    category: base + 'category.html',
    'radios-inline': base + 'radios-inline.html',
    /*radiobuttons: base + 'radio-buttons.html',*/
  });

}]).directive('sfFieldset', function() {
  return {
    transclude: true,
    scope: true,
    templateUrl: 'directives/decorators/foundation/fieldset-trcl.html',
    link: function(scope, element, attrs) {
      scope.title = scope.$eval(attrs.title);
    }
  };
});