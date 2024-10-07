document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch('/admin/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Admin access denied');
    }

    const data = await response.json();
    displayAdminData(data);
  } catch (error) {
    console.error('Error:', error.message);
    alert(error.message);
    if (
      error.message === 'Authentication required' ||
      error.message === 'Access denied. Admin only.'
    ) {
      window.location.href = '/login';
    }
  }
});

function displayAdminData(data) {
  const adminContent = document.getElementById('admin-content');

  let tableHTML = `
    <div class="table-container">
      <table class="table table-striped">
        <thead class="thead-light">
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Favorites</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.users.forEach((user) => {
    tableHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.isAdmin ? 'Yes' : 'No'}</td>
        <td>
    `;

    if (user.favorites && user.favorites.length > 0) {
      tableHTML += '<ul class="list-unstyled mb-0">';
      user.favorites.forEach((favorite) => {
        tableHTML += `<li>${favorite.name || 'Unnamed item'}</li>`;
      });
      tableHTML += '</ul>';
    } else {
      tableHTML += 'No favorites';
    }

    tableHTML += `
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  adminContent.innerHTML = `
    <h2 class="mb-3">User Data</h2>
    ${tableHTML}
  `;
}
