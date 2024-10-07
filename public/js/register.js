document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // client validation
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (
      !usernamePattern.test(username) ||
      username.length < 3 ||
      username.length > 30
    ) {
      showError(
        'Invalid username. Must be 3-30 characters with no special characters.'
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || email.length < 5 || email.length > 50) {
      showError('Invalid email format.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    if (password.length < 8 || password.length > 100) {
      showError('Password must be 8-100 characters.');
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!passwordPattern.test(password)) {
      showError(
        'Password must contain uppercase, lowercase, number, and special character.'
      );
      return;
    }

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
        showError(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      showError('An error occurred. Please try again.');
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
});
