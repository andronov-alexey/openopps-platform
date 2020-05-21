var $ = require('jquery');
var _ = require('underscore');
var async = require('async');
var Bootstrap = require('bootstrap');
var Backbone = require('backbone');
var BaseView = require('../../../../base/base_view');
var UIConfig = require('../../../../config/ui.json');

var TaskApplyTemplate = require('../templates/task_apply_template.html');
var TaskResumeTemplate = require('../templates/task_apply_resume_template.html');
var TaskApplyNextTempalte = require('../templates/task_apply_next_template.html');


var TaskApplyView = BaseView.extend({
  events: {
    'click #accept-toggle'            :'toggleAccept', 
    'click #submit'                   :'submitVolunteer',
    'blur .validate'                  :'validateField',
    'change .validate'                :'validateField',
    'change input[name=resumes]'      :'changeResume', 
    'click #cancel'                   :'cancel',                   
    'keypress #statement'             :'characterCount',
    'keydown #statement'              :'characterCount',
    'click #upload-resume'            :'upload',
    'click #refresh-resumes'          :'refresh' ,  
  },

  initialize: function (options) {
    this.options = options;
    this.params = new URLSearchParams(window.location.search);
    this.resumes=[];
    this.render();
    $('#search-results-loading').hide();
  },

  render: function () {
    this.getResumes();  
    
    var compiledTemplate = _.template(TaskApplyTemplate)(); 
    this.$el.html(compiledTemplate);
    this.renderResumes();
    this.$el.localize();
    $('#search-results-loading').hide();
  },

  getResumes: function () {   
    $.ajax({
      url: '/api/volunteer/user/resumes' ,
      type: 'GET',
      async: false,
      success: function (resumes) {      
        this.resumes = resumes;    
      }.bind(this),
    });
     
  },

  submitVolunteer: function () {
    var statement= $('#statement').val();
    var selectedResume = $('input[name=resumes]:checked').val(); 
    if(!this.validateFields()){
      $.ajax({
        url: '/api/volunteer/',
        type: 'POST',
        data: {
          taskId: this.options.data.taskId,
          statementOfInterest:statement,
          resumeId: selectedResume ? selectedResume.split('|')[0] : null,
        },
      }).done( function (data) {
        this.renderNext();      
        // Backbone.history.navigate('/tasks/' + data.taskId , { trigger: true });
      }.bind(this));
    }
  },

  validateFields: function () {
    var children = this.$el.find( '.validate' );
    var abort = false;
    
    _.each( children, function ( child ) {
      var iAbort = validate( { currentTarget: child } );
      abort = abort || iAbort;
    } );

    if ($('input[name=resumes]:checked').length == 0) {
      $('#apply-resume').addClass('usa-input-error');            
      $('#apply-resume >.upload-error').show(); 
      $('#apply-resume >.refresh-error').hide(); 
      abort=true;
    }
    if($('#refresh-resumes').css('display') != 'none')
    {
      $('#apply-resume').addClass('usa-input-error');        
      $('#apply-resume>.upload-error').hide(); 
      $('#apply-resume>.refresh-error').show();    
      abort=true;
    }

    if(abort) {
      $('.usa-input-error').get(0).scrollIntoView();
    }     
    return abort;
   
  },

  validateField: function (e) {
    return validate(e);
  },
  cancel: function (e){
    Backbone.history.navigate('/tasks/' + this.options.data.taskId , { trigger: true });
  },

  characterCount: function () {
    $('#statement').charCounter(3000, {
      container: '#statement-count',
    });
  },

  changeResume: function (){
    if($('[name=resumes]:checked').length>0){ 
      $('#apply-resume').removeClass('usa-input-error');    
      $('#apply-resume>.field-validation-error').hide();   
    }
   
  },

  renderResumes: function () { 
    this.data = { 
      resumes: this.resumes,
    }; 
    var resumeTemplate = _.template(TaskResumeTemplate)(this.data);
    $('#apply-resume-section').html(resumeTemplate);  
  },

  renderNext: function () {
    this.data = {
      community: 'Need Name',
      opportunity: 'Title',
    };
    var nextTemplate = _.template(TaskApplyNextTempalte)(this.data);
    $('#apply-next-section').append(nextTemplate); 
    $('#apply-section').hide();      
    $('#apply-help-section').hide();
  },

  upload: function (){
    window.open(usajobsURL + '/Applicant/ProfileDashboard/Resumes/');          
    $('#upload-resume').hide();
    $('#refresh-resumes').show();
  },

  refresh :function (e) {
    e.preventDefault && e.preventDefault();
    $('#refresh-resumes').hide();
    $('#refreshing-resumes').show();
    this.getResumes();
    this.renderResumes();  
  },

  cleanup: function () {
    removeView(this);
  },
});

module.exports = TaskApplyView;
