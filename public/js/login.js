document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const usernameOrEmail = form.usernameOrEmail.value.trim();
    const password = form.password.value;

    // client validation
    if (!usernameOrEmail || !password) {
      showError('All fields are required.');
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
        localStorage.setItem('token', result.token);
        localStorage.setItem('isAdmin', result.isAdmin);
        if (result.isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        showError(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An error occurred. Please try again.');
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
});
