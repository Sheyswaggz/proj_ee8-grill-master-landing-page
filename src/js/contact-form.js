/**
 * Contact Form Validation and Submission Handler
 * Provides comprehensive client-side validation, form state management,
 * and user feedback for the contact form.
 */

(function () {
  'use strict';

  // Configuration constants
  const CONFIG = {
    validation: {
      nameMinLength: 2,
      nameMaxLength: 100,
      messageMinLength: 10,
      messageMaxLength: 1000,
      emailPattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
      phonePattern: /^[\d\s\-+()]{10,}$/,
    },
    messages: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number (at least 10 digits)',
      nameTooShort: 'Name must be at least 2 characters long',
      nameTooLong: 'Name must not exceed 100 characters',
      messageTooShort: 'Message must be at least 10 characters long',
      messageTooLong: 'Message must not exceed 1000 characters',
      submitSuccess: 'Thank you for your message! We will get back to you soon.',
      submitError: 'Sorry, there was an error submitting your form. Please try again or contact us directly.',
      networkError: 'Network error. Please check your connection and try again.',
    },
    statusDisplayDuration: 5000,
  };

  // DOM element references
  const elements = {
    form: null,
    nameInput: null,
    emailInput: null,
    phoneInput: null,
    messageInput: null,
    submitButton: null,
    formStatus: null,
  };

  /**
   * Initialize the contact form functionality
   */
  function init() {
    try {
      cacheElements();
      
      if (!elements.form) {
        console.warn('Contact form not found on page');
        return;
      }

      attachEventListeners();
      console.log('Contact form initialized successfully');
    } catch (error) {
      console.error('Error initializing contact form:', error);
    }
  }

  /**
   * Cache DOM element references for performance
   */
  function cacheElements() {
    elements.form = document.querySelector('.contact-form');
    
    if (!elements.form) {
      return;
    }

    elements.nameInput = elements.form.querySelector('#name');
    elements.emailInput = elements.form.querySelector('#email');
    elements.phoneInput = elements.form.querySelector('#phone');
    elements.messageInput = elements.form.querySelector('#message');
    elements.submitButton = elements.form.querySelector('button[type="submit"]');
    elements.formStatus = elements.form.querySelector('.form-status');
  }

  /**
   * Attach event listeners to form elements
   */
  function attachEventListeners() {
    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);

    // Real-time validation on blur
    if (elements.nameInput) {
      elements.nameInput.addEventListener('blur', () => validateField(elements.nameInput, validateName));
      elements.nameInput.addEventListener('input', () => clearFieldError(elements.nameInput));
    }

    if (elements.emailInput) {
      elements.emailInput.addEventListener('blur', () => validateField(elements.emailInput, validateEmail));
      elements.emailInput.addEventListener('input', () => clearFieldError(elements.emailInput));
    }

    if (elements.phoneInput) {
      elements.phoneInput.addEventListener('blur', () => validateField(elements.phoneInput, validatePhone));
      elements.phoneInput.addEventListener('input', () => clearFieldError(elements.phoneInput));
    }

    if (elements.messageInput) {
      elements.messageInput.addEventListener('blur', () => validateField(elements.messageInput, validateMessage));
      elements.messageInput.addEventListener('input', () => clearFieldError(elements.messageInput));
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    // Clear previous status
    hideFormStatus();

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      showFormStatus(CONFIG.messages.submitError, 'error');
      return;
    }

    // Disable form during submission
    setFormDisabled(true);

    try {
      // Collect form data
      const formData = collectFormData();

      // Submit form data
      const success = await submitFormData(formData);

      if (success) {
        showFormStatus(CONFIG.messages.submitSuccess, 'success');
        clearForm();
      } else {
        showFormStatus(CONFIG.messages.submitError, 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormStatus(CONFIG.messages.networkError, 'error');
    } finally {
      setFormDisabled(false);
    }
  }

  /**
   * Validate entire form
   * @returns {boolean} - True if form is valid
   */
  function validateForm() {
    const validations = [
      validateField(elements.nameInput, validateName),
      validateField(elements.emailInput, validateEmail),
      validateField(elements.phoneInput, validatePhone),
      validateField(elements.messageInput, validateMessage),
    ];

    return validations.every(result => result === true);
  }

  /**
   * Validate a single field
   * @param {HTMLElement} field - Input field to validate
   * @param {Function} validator - Validation function
   * @returns {boolean} - True if field is valid
   */
  function validateField(field, validator) {
    if (!field) {
      return false;
    }

    const value = field.value.trim();
    const error = validator(value);

    if (error) {
      showFieldError(field, error);
      return false;
    }

    showFieldSuccess(field);
    return true;
  }

  /**
   * Validate name field
   * @param {string} value - Name value
   * @returns {string|null} - Error message or null if valid
   */
  function validateName(value) {
    if (!value) {
      return CONFIG.messages.required;
    }

    if (value.length < CONFIG.validation.nameMinLength) {
      return CONFIG.messages.nameTooShort;
    }

    if (value.length > CONFIG.validation.nameMaxLength) {
      return CONFIG.messages.nameTooLong;
    }

    return null;
  }

  /**
   * Validate email field
   * @param {string} value - Email value
   * @returns {string|null} - Error message or null if valid
   */
  function validateEmail(value) {
    if (!value) {
      return CONFIG.messages.required;
    }

    if (!CONFIG.validation.emailPattern.test(value)) {
      return CONFIG.messages.invalidEmail;
    }

    return null;
  }

  /**
   * Validate phone field
   * @param {string} value - Phone value
   * @returns {string|null} - Error message or null if valid
   */
  function validatePhone(value) {
    if (!value) {
      return CONFIG.messages.required;
    }

    if (!CONFIG.validation.phonePattern.test(value)) {
      return CONFIG.messages.invalidPhone;
    }

    return null;
  }

  /**
   * Validate message field
   * @param {string} value - Message value
   * @returns {string|null} - Error message or null if valid
   */
  function validateMessage(value) {
    if (!value) {
      return CONFIG.messages.required;
    }

    if (value.length < CONFIG.validation.messageMinLength) {
      return CONFIG.messages.messageTooShort;
    }

    if (value.length > CONFIG.validation.messageMaxLength) {
      return CONFIG.messages.messageTooLong;
    }

    return null;
  }

  /**
   * Show field error state
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   */
  function showFieldError(field, message) {
    field.classList.remove('valid');
    field.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('visible');
    }
  }

  /**
   * Show field success state
   * @param {HTMLElement} field - Input field
   */
  function showFieldSuccess(field) {
    field.classList.remove('invalid');
    field.classList.add('valid');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
  }

  /**
   * Clear field error state
   * @param {HTMLElement} field - Input field
   */
  function clearFieldError(field) {
    field.classList.remove('invalid', 'valid');
    field.removeAttribute('aria-invalid');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
  }

  /**
   * Collect form data
   * @returns {Object} - Form data object
   */
  function collectFormData() {
    return {
      name: elements.nameInput.value.trim(),
      email: elements.emailInput.value.trim(),
      phone: elements.phoneInput.value.trim(),
      message: elements.messageInput.value.trim(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Submit form data to server
   * @param {Object} formData - Form data to submit
   * @returns {Promise<boolean>} - True if submission successful
   */
  async function submitFormData(formData) {
    try {
      console.log('Submitting form data:', formData);

      const response = await fetch(elements.form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error('Form submission failed:', response.status, response.statusText);
        return false;
      }

      console.log('Form submitted successfully');
      return true;
    } catch (error) {
      console.error('Network error during form submission:', error);
      throw error;
    }
  }

  /**
   * Show form status message
   * @param {string} message - Status message
   * @param {string} type - Status type ('success' or 'error')
   */
  function showFormStatus(message, type) {
    if (!elements.formStatus) {
      return;
    }

    elements.formStatus.textContent = message;
    elements.formStatus.className = 'form-status visible ' + type;
    elements.formStatus.setAttribute('role', type === 'error' ? 'alert' : 'status');

    // Auto-hide after duration
    setTimeout(() => {
      hideFormStatus();
    }, CONFIG.statusDisplayDuration);
  }

  /**
   * Hide form status message
   */
  function hideFormStatus() {
    if (!elements.formStatus) {
      return;
    }

    elements.formStatus.textContent = '';
    elements.formStatus.className = 'form-status';
    elements.formStatus.removeAttribute('role');
  }

  /**
   * Clear form fields
   */
  function clearForm() {
    if (elements.form) {
      elements.form.reset();
    }

    // Clear validation states
    [elements.nameInput, elements.emailInput, elements.phoneInput, elements.messageInput].forEach(field => {
      if (field) {
        clearFieldError(field);
      }
    });
  }

  /**
   * Enable or disable form
   * @param {boolean} disabled - True to disable form
   */
  function setFormDisabled(disabled) {
    if (elements.submitButton) {
      elements.submitButton.disabled = disabled;
      elements.submitButton.textContent = disabled ? 'Sending...' : 'Send Message';
    }

    [elements.nameInput, elements.emailInput, elements.phoneInput, elements.messageInput].forEach(field => {
      if (field) {
        field.disabled = disabled;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();