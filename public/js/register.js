// public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Client-side validation
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (
      !usernamePattern.test(username) ||
      username.length < 3 ||
      username.length > 30
    ) {
      errorDiv.textContent =
        'Invalid username. Must be 3-30 characters with no special characters.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || email.length < 5 || email.length > 50) {
      errorDiv.textContent = 'Invalid email format.';
      return;
    }

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match.';
      return;
    }

    if (password.length < 8 || password.length > 100) {
      errorDiv.textContent = 'Password must be 8-100 characters.';
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!passwordPattern.test(password)) {
      errorDiv.textContent =
        'Password must contain uppercase, lowercase, number, and special character.';
      return;
    }

    // Send request to server
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        window.location.href = '/login';
      } else {
        errorDiv.textContent = `Error: ${result.error}`;
      }
    } catch (error) {
      console.error(error);
      errorDiv.textContent = 'An error occurred. Please try again.';
    }
  });
});
