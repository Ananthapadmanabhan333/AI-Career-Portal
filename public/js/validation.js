/**
 * Client-Side Advanced Validations & Password Strength Matrix (Task 2 & 4)
 * Provides real-time UI feedback to avoid useless roundtrips.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Select active form
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');

  // Configure Registration inputs if present
  if (registerForm) {
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');

    // Add inputs keyup triggers
    regUsername.addEventListener('input', () => validateUsername(regUsername));
    regEmail.addEventListener('input', () => validateEmail(regEmail));
    regPassword.addEventListener('input', () => {
      validatePassword(regPassword);
      evaluatePasswordStrength(regPassword.value);
    });

    registerForm.addEventListener('submit', (e) => {
      const isUVal = validateUsername(regUsername);
      const isEVal = validateEmail(regEmail);
      const isPVal = validatePassword(regPassword);

      if (!isUVal || !isEVal || !isPVal) {
        e.preventDefault();
      }
    });
  }

  // Configure Login inputs if present
  if (loginForm) {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    loginEmail.addEventListener('input', () => validateEmail(loginEmail));
    loginPassword.addEventListener('input', () => validateRequired(loginPassword));

    loginForm.addEventListener('submit', (e) => {
      const isEVal = validateEmail(loginEmail);
      const isPVal = validateRequired(loginPassword);

      if (!isEVal || !isPVal) {
        e.preventDefault();
      }
    });
  }
});

// Helper: Show input errors
function raiseError(inputElement, errorText) {
  const errorContainer = document.getElementById(`${inputElement.id}Err`);
  const parentContainer = inputElement.closest('.input-group-glass') || inputElement;
  
  parentContainer.style.borderColor = '#ef4444'; // Red border
  if (errorContainer) {
    errorContainer.textContent = errorText;
  }
}

// Helper: Clear input errors
function clearError(inputElement) {
  const errorContainer = document.getElementById(`${inputElement.id}Err`);
  const parentContainer = inputElement.closest('.input-group-glass') || inputElement;
  
  parentContainer.style.borderColor = ''; // Default style
  if (errorContainer) {
    errorContainer.textContent = '';
  }
}

/* ====================================================
   VALIDATION ALGORITHMS
   ==================================================== */

function validateUsername(input) {
  const value = input.value.trim();
  if (value.length < 3) {
    raiseError(input, 'Username must be at least 3 characters long');
    return false;
  }
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    raiseError(input, 'Username can only contain letters, numbers, and underscores');
    return false;
  }
  clearError(input);
  return true;
}

function validateEmail(input) {
  const value = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    raiseError(input, 'Email is required');
    return false;
  }
  if (!emailRegex.test(value)) {
    raiseError(input, 'Please enter a valid email address');
    return false;
  }
  clearError(input);
  return true;
}

function validatePassword(input) {
  const value = input.value;
  if (value.length < 6) {
    raiseError(input, 'Password must be at least 6 characters long');
    return false;
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    raiseError(input, 'Must include an uppercase letter, lowercase letter, and a number');
    return false;
  }
  clearError(input);
  return true;
}

function validateRequired(input) {
  if (!input.value.trim()) {
    raiseError(input, 'This field is required');
    return false;
  }
  clearError(input);
  return true;
}

/* ====================================================
   LIVE PASSWORD ENTROPY STRENGTH INDICATOR (Task 4)
   ==================================================== */

function evaluatePasswordStrength(password) {
  const strengthBar = document.getElementById('passwordStrengthBar');
  const strengthText = document.getElementById('passwordStrengthText');
  const meterWrapper = document.querySelector('.password-meter-wrapper');

  if (!password) {
    if (meterWrapper) meterWrapper.classList.add('d-none');
    return;
  }

  if (meterWrapper) meterWrapper.classList.remove('d-none');

  let score = 0;

  // 1. Length assessment
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 20;

  // 2. Character variations checks
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Bounds
  score = Math.min(score, 100);

  // Apply colors and descriptions according to score ranges
  strengthBar.style.width = `${score}%`;

  if (score < 40) {
    strengthBar.className = 'progress-bar bg-danger';
    strengthText.textContent = 'Weak';
    strengthText.style.color = '#ef4444';
  } else if (score >= 40 && score < 75) {
    strengthBar.className = 'progress-bar bg-warning';
    strengthText.textContent = 'Moderate';
    strengthText.style.color = '#f59e0b';
  } else {
    strengthBar.className = 'progress-bar bg-success';
    strengthText.textContent = 'Strong';
    strengthText.style.color = '#10b981';
  }
}
