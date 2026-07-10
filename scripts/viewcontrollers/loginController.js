import { signIn } from '../services/firebaseService.js';

class LoginController {
  constructor() {
    this.cache();
    this.attach();
  }

  cache() {
    this.email = document.getElementById('login-email');
    this.password = document.getElementById('login-password');
    this.btn = document.getElementById('login-btn');
    this.err = document.getElementById('login-error');
  }

  attach() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  }

  setLoading(loading) {
    if (this.btn) {
      this.btn.disabled = loading;
      this.btn.textContent = loading ? 'Signing in…' : 'Sign in';
    }
  }

  async submit() {
    const email = this.email?.value.trim() || '';
    const password = this.password?.value || '';
    this.err.textContent = '';
    if (!email || !password) {
      this.err.textContent = 'Email and password are required';
      return;
    }

    this.setLoading(true);
    try {
      await signIn(email, password);
      window.location.href = '/dashboard.html';
    } catch (err) {
      this.err.textContent = err.message || 'Login failed';
    } finally {
      this.setLoading(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginController());
