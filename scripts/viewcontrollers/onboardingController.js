/**
 * Onboarding Controller - handles DOM events and user interactions
 * No Firebase calls here, all business logic delegated to viewModel
 */

import * as viewModel from '../viewmodels/onboardingViewModel.js';

class OnboardingController {
  constructor() {
    this.currentStep = 1;
    this.step1Data = {
      name: '', birthday: '', email: '', password: '', confirmPassword: '',
      occupation: '', salary: '', monthlySpending: ''
    };
    this.step2Data = { goals: '', financialKnowledge: '' };
    this.errors = {};
    
    this.init();
  }

  /**
   * Initialize controller - set up event listeners
   */
  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.updateStepIndicator();
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    // Step indicators
    this.stepIndicator = document.getElementById('step-indicator');
    
    // Step panels
    this.step1Panel = document.getElementById('step-1');
    this.step2Panel = document.getElementById('step-2');
    
    // Step 1 inputs
    this.inputName = document.getElementById('name');
    this.inputBirthday = document.getElementById('birthday');
    this.inputEmail = document.getElementById('email');
    this.inputPassword = document.getElementById('password');
    this.inputConfirmPassword = document.getElementById('confirmPassword');
    this.inputOccupation = document.getElementById('occupation');
    this.inputSalary = document.getElementById('salary');
    this.inputMonthlySpending = document.getElementById('monthlySpending');
    
    // Step 1 error displays
    this.errName = document.getElementById('error-name');
    this.errBirthday = document.getElementById('error-birthday');
    this.errEmail = document.getElementById('error-email');
    this.errPassword = document.getElementById('error-password');
    this.errConfirmPassword = document.getElementById('error-confirmPassword');
    this.errSalary = document.getElementById('error-salary');
    this.errMonthlySpending = document.getElementById('error-monthlySpending');
    
    // Step 2 button groups
    this.goalsButtons = document.querySelectorAll('[data-goal]');
    this.knowledgeButtons = document.querySelectorAll('[data-knowledge]');
    
    // Step 2 error displays
    this.errGoals = document.getElementById('error-goals');
    this.errKnowledge = document.getElementById('error-knowledge');
    
    // Navigation buttons
    this.nextBtn = document.getElementById('next-btn');
    this.backBtn = document.getElementById('back-btn');
    this.doneBtn = document.getElementById('done-btn');
    
    // Loading indicator
    this.loadingIndicator = document.getElementById('loading');
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Navigation
    this.nextBtn?.addEventListener('click', () => this.goToStep2());
    this.backBtn?.addEventListener('click', () => this.goToStep1());
    this.doneBtn?.addEventListener('click', () => this.submit());
    
    // Step 1 input listeners (for real-time validation)
    [this.inputName, this.inputBirthday, this.inputEmail, this.inputPassword,
     this.inputConfirmPassword, this.inputSalary, this.inputMonthlySpending].forEach(input => {
      if (input) input.addEventListener('blur', () => this.validateStep1Field(input.id));
    });
    
    // Goals button group
    this.goalsButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectGoal(btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectGoal(btn);
        }
      });
    });
    
    // Knowledge button group
    this.knowledgeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectKnowledge(btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectKnowledge(btn);
        }
      });
    });
  }

  /**
   * Update step 1 data from inputs
   */
  updateStep1Data() {
    this.step1Data = {
      name: this.inputName?.value || '',
      birthday: this.inputBirthday?.value || '',
      email: this.inputEmail?.value || '',
      password: this.inputPassword?.value || '',
      confirmPassword: this.inputConfirmPassword?.value || '',
      occupation: this.inputOccupation?.value || '',
      salary: this.inputSalary?.value || '',
      monthlySpending: this.inputMonthlySpending?.value || ''
    };
  }

  /**
   * Validate a single field in step 1
   */
  validateStep1Field(fieldId) {
    this.updateStep1Data();
    const fieldMap = {
      name: 'name',
      birthday: 'birthday',
      email: 'email',
      password: 'password',
      confirmPassword: 'confirmPassword',
      salary: 'salary',
      monthlySpending: 'monthlySpending'
    };
    
    const field = fieldMap[fieldId];
    if (!field) return;
    
    let error = null;
    
    switch (field) {
      case 'name':
        error = this.step1Data.name?.trim() ? null : 'Full name is required';
        break;
      case 'birthday':
        error = viewModel.validateBirthday(this.step1Data.birthday);
        break;
      case 'email':
        error = viewModel.validateEmail(this.step1Data.email);
        break;
      case 'password':
        error = viewModel.validatePassword(this.step1Data.password);
        break;
      case 'confirmPassword':
        error = viewModel.validatePasswordMatch(this.step1Data.password, this.step1Data.confirmPassword);
        break;
      case 'salary':
        error = this.step1Data.salary ? null : 'Salary is required';
        break;
      case 'monthlySpending':
        error = this.step1Data.monthlySpending ? null : 'Monthly spending is required';
        break;
    }
    
    this.displayFieldError(fieldId, error);
  }

  /**
   * Display error for a single field
   */
  displayFieldError(fieldId, error) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    if (errorElement) {
      errorElement.textContent = error || '';
      errorElement.style.display = error ? 'block' : 'none';
    }
  }

  /**
   * Clear all step 1 errors
   */
  clearStep1Errors() {
    [this.errName, this.errBirthday, this.errEmail, this.errPassword,
     this.errConfirmPassword, this.errSalary, this.errMonthlySpending].forEach(el => {
      if (el) {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
    // remove visual invalid state
    ['name','birthday','email','password','confirmPassword','salary','monthlySpending'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.classList.remove('input-error');
        input.removeAttribute('aria-invalid');
        const err = document.getElementById(`error-${id}`);
        if (err) input.removeAttribute('aria-describedby');
      }
    });
    const summaryEl = document.getElementById('error-summary');
    if (summaryEl) { summaryEl.textContent = ''; summaryEl.style.display = 'none'; }
  }

  /**
   * Validate and display all step 1 errors
   */
  displayStep1Errors(errors) {
    this.clearStep1Errors();
    const errorMap = {
      'name': this.errName,
      'birthday': this.errBirthday,
      'email': this.errEmail,
      'password': this.errPassword,
      'confirmPassword': this.errConfirmPassword,
      'salary': this.errSalary,
      'monthlySpending': this.errMonthlySpending
    };
    let summary = [];
    let firstInvalidField = null;
    Object.entries(errors).forEach(([field, message]) => {
      summary.push(message);
      if (errorMap[field]) {
        errorMap[field].textContent = message;
        errorMap[field].style.display = 'block';
      }

      // mark input as invalid
      const input = document.getElementById(field);
      if (input) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        const errEl = document.getElementById(`error-${field}`);
        if (errEl) input.setAttribute('aria-describedby', `error-${field}`);
        if (!firstInvalidField) firstInvalidField = input;
      }
    });

    const summaryEl = document.getElementById('error-summary');
    if (summaryEl) {
      summaryEl.textContent = summary.join(' • ');
      summaryEl.style.display = summary.length ? 'block' : 'none';
    }

    if (firstInvalidField) {
      try { firstInvalidField.focus(); } catch (e) { /* ignore */ }
    }
  }

  /**
   * Handle Next button - validate step 1 and move to step 2
   */
  goToStep2() {
    this.updateStep1Data();
    console.log('Attempting to go to Step 2; step1Data=', this.step1Data);
    const validation = viewModel.validateStep1(this.step1Data);
    console.log('Step1 validation:', validation);
    
    if (!validation.isValid) {
      this.displayStep1Errors(validation.errors);
      return;
    }
    
    this.clearStep1Errors();
    this.currentStep = 2;
    this.updateStepIndicator();
    this.showStep2();
  }

  /**
   * Handle Back button - return to step 1 without losing data
   */
  goToStep1() {
    this.currentStep = 1;
    this.updateStepIndicator();
    this.showStep1();
  }

  /**
   * Show step 1 panel
   */
  showStep1() {
    if (this.step1Panel) {
      this.step1Panel.style.display = 'block';
      this.step1Panel.setAttribute('aria-hidden', 'false');
    }
    if (this.step2Panel) {
      this.step2Panel.style.display = 'none';
      this.step2Panel.setAttribute('aria-hidden', 'true');
    }
    if (this.backBtn) this.backBtn.style.display = 'none';
    if (this.nextBtn) this.nextBtn.style.display = 'inline-block';
    if (this.doneBtn) this.doneBtn.style.display = 'none';
  }

  /**
   * Show step 2 panel
   */
  showStep2() {
    if (this.step1Panel) {
      this.step1Panel.style.display = 'none';
      this.step1Panel.setAttribute('aria-hidden', 'true');
    }
    if (this.step2Panel) {
      this.step2Panel.style.display = 'block';
      this.step2Panel.setAttribute('aria-hidden', 'false');
    }
    if (this.backBtn) this.backBtn.style.display = 'inline-block';
    if (this.nextBtn) this.nextBtn.style.display = 'none';
    if (this.doneBtn) this.doneBtn.style.display = 'inline-block';
    this.updateDoneButtonState();
  }

  /**
   * Update step indicator text
   */
  updateStepIndicator() {
    if (this.stepIndicator) {
      this.stepIndicator.textContent = `Step ${this.currentStep} of 2`;
    }
  }

  /**
   * Select a goal option (mutually exclusive)
   */
  selectGoal(button) {
    this.goalsButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    this.step2Data.goals = button.dataset.goal;
    
    if (this.errGoals) {
      this.errGoals.textContent = '';
      this.errGoals.style.display = 'none';
    }
    
    this.updateDoneButtonState();
  }

  /**
   * Select a knowledge level (mutually exclusive)
   */
  selectKnowledge(button) {
    this.knowledgeButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    this.step2Data.financialKnowledge = button.dataset.knowledge;
    
    if (this.errKnowledge) {
      this.errKnowledge.textContent = '';
      this.errKnowledge.style.display = 'none';
    }
    
    this.updateDoneButtonState();
  }

  /**
   * Update Done button state (enabled only if both questions answered)
   */
  updateDoneButtonState() {
    if (!this.doneBtn) return;
    
    const bothAnswered = this.step2Data.goals && this.step2Data.financialKnowledge;
    this.doneBtn.disabled = !bothAnswered;
  }

  /**
   * Handle Done button - submit and create account
   */
  async submit() {
    if (this.loadingIndicator) this.loadingIndicator.style.display = 'block';
    if (this.doneBtn) this.doneBtn.disabled = true;
    
    try {
      const result = await viewModel.completeOnboarding(this.step1Data, this.step2Data);
      
      if (result.success) {
        // User is already signed in by Firebase after account creation — send them to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // Show error message
        alert(result.message);
      }
    } catch (error) {
      alert('An unexpected error occurred: ' + error.message);
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
      if (this.doneBtn) this.doneBtn.disabled = false;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OnboardingController();
});