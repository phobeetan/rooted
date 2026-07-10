import { createUserProfile } from '../../models/UserProfile.js';
import { createAccount, onAuthChange, signIn } from '../services/supabaseService.js';

class LoginController {
  constructor() {
    this.cache();
    this.attach();
    this.setMode(new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'login');
    onAuthChange((user) => this.showProfile(user));
  }

  cache() {
    this.authCard = document.getElementById('auth-card');
    this.profileCard = document.getElementById('profile-card');
    this.profileEmail = document.getElementById('profile-email');
    this.tabs = document.querySelectorAll('[data-mode]');
    this.panels = document.querySelectorAll('[data-panel]');
    this.loginEmail = document.getElementById('login-email');
    this.loginPassword = document.getElementById('login-password');
    this.loginBtn = document.getElementById('login-btn');
    this.loginErr = document.getElementById('login-error');
    this.signupBtn = document.getElementById('signup-btn');
    this.signupErr = document.getElementById('signup-error');
  }

  attach() {
    this.tabs.forEach((tab) => tab.addEventListener('click', () => this.setMode(tab.dataset.mode)));
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });
    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.signup();
    });
  }

  setMode(mode) {
    this.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
    this.panels.forEach((panel) => panel.hidden = panel.dataset.panel !== mode);
    window.history.replaceState(null, '', `/login.html?mode=${mode}`);
  }

  showProfile(user) {
    if (user) {
      window.location.replace('/dashboard.html');
      return;
    }
    this.authCard.hidden = false;
    this.profileCard.hidden = true;
  }

  setButton(button, loading, text) {
    button.disabled = loading;
    button.textContent = loading ? 'Working...' : text;
  }

  async login() {
    const email = this.loginEmail.value.trim();
    const password = this.loginPassword.value;
    this.loginErr.textContent = '';
    if (!email || !password) {
      this.loginErr.textContent = 'Email and password are required.';
      return;
    }

    this.setButton(this.loginBtn, true, 'Log in');
    try {
      await signIn(email, password);
      window.location.href = '/dashboard.html';
    } catch (err) {
      this.loginErr.textContent = err.message || 'Login failed.';
    } finally {
      this.setButton(this.loginBtn, false, 'Log in');
    }
  }

  async signup() {
    const data = {
      name: document.getElementById('signup-name').value.trim(),
      birthday: document.getElementById('signup-birthday').value,
      email: document.getElementById('signup-email').value.trim(),
      password: document.getElementById('signup-password').value,
      confirm: document.getElementById('signup-confirm').value,
      occupation: document.getElementById('signup-occupation').value.trim(),
      salary: document.getElementById('signup-salary').value,
      monthlySpending: document.getElementById('signup-spending').value,
      goals: document.getElementById('signup-goals').value,
      financialKnowledge: document.getElementById('signup-knowledge').value,
    };
    this.signupErr.textContent = '';

    if (!data.name || !data.birthday || !data.email || !data.password || !data.salary || !data.monthlySpending || !data.goals || !data.financialKnowledge) {
      this.signupErr.textContent = 'Fill out the required fields.';
      return;
    }
    if (data.password !== data.confirm) {
      this.signupErr.textContent = 'Passwords do not match.';
      return;
    }

    this.setButton(this.signupBtn, true, 'Sign up');
    try {
      await createAccount(data.email, data.password, createUserProfile(data));
      window.location.href = '/dashboard.html';
    } catch (err) {
      this.signupErr.textContent = err.message || 'Signup failed.';
    } finally {
      this.setButton(this.signupBtn, false, 'Sign up');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginController());
