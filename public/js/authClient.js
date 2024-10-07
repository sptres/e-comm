function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

// check login status
document.addEventListener('DOMContentLoaded', () => {
  const loginStatus = document.getElementById('login-status');
  if (loginStatus) {
    if (isLoggedIn()) {
      loginStatus.textContent = 'Logged In';
      const logoutButton = document.createElement('button');
      logoutButton.textContent = 'Logout';
      logoutButton.addEventListener('click', logout);
      loginStatus.appendChild(logoutButton);
    } else {
      loginStatus.textContent = 'Not Logged In';
    }
  }
});
