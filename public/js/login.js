// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    const usernameOrEmail = form.usernameOrEmail.value.trim();
    const password = form.password.value;

    // Client-side validation
    if (!usernameOrEmail || !password) {
      errorDiv.textContent = 'All fields are required.';
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        window.location.href = '/';
      } else {
        errorDiv.textContent = `Error: ${result.error}`;
      }
    } catch (error) {
      console.error(error);
      errorDiv.textContent = 'An error occurred. Please try again.';
    }
  });
});
