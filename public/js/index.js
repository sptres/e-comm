// public/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token); // Debug log

  const authResponse = await fetch('/auth/session', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  const authData = await authResponse.json();

  console.log('Auth data:', authData); // Debugging line

  // Update Navigation Bar
  const navAuth = document.getElementById('nav-auth');
  if (authData.isAuthenticated) {
    console.log('User is authenticated'); // Debugging line
    navAuth.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout-link">Logout</a>
      </li>
    `;

    document
      .getElementById('logout-link')
      .addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/auth/logout', { method: 'POST' });
          if (response.ok) {
            localStorage.removeItem('token'); // remove the token from localStorage
            window.location.href = '/'; // redirect to home
          } else {
            const errorData = await response.json();
            console.error('Logout failed:', errorData.error);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
  } else {
    console.log('User is not authenticated'); // Debugging line
    navAuth.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/register">Sign Up</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/login">Login</a>
      </li>
    `;
  }

  // Load brands for filter panel
  const brandFiltersDiv = document.getElementById('brand-filters');
  const brandsResponse = await fetch('/products/brands');
  const brandsData = await brandsResponse.json();
  if (brandsResponse.ok) {
    brandsData.brands.forEach((brand) => {
      const brandCheckbox = `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${brand.name}" id="${brand.name}">
            <label class="form-check-label" for="${brand.name}">${brand.name}</label>
          </div>
        `;
      brandFiltersDiv.insertAdjacentHTML('beforeend', brandCheckbox);
    });
  }

  // Handle Filter Form Submission
  const filterForm = document.getElementById('filter-form');
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadProducts(1); // Load products with filters applied
  });

  // Load Products
  async function loadProducts(page = 1) {
    // Get selected filters
    const selectedBrands = Array.from(
      document.querySelectorAll('#brand-filters input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);
    const selectedTypes = Array.from(
      document.querySelectorAll('#type-filters input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    let url = `/products?page=${page}`;
    if (selectedBrands.length > 0) {
      url += `&brand=${selectedBrands.join(';')}`;
    }
    if (selectedTypes.length > 0) {
      url += `&type=${selectedTypes.join(';')}`;
    }

    const productsResponse = await fetch(url);
    const productsData = await productsResponse.json();

    if (productsResponse.ok) {
      displayProducts(productsData.products);
      setupPagination(page, productsData.totalPages);
    } else {
      // Handle errors (e.g., no products found)
      document.getElementById(
        'product-gallery'
      ).innerHTML = `<p>${productsData.error}</p>`;
      document.getElementById('pagination').innerHTML = '';
    }
  }

  // Display Products
  function displayProducts(products) {
    const gallery = document.getElementById('product-gallery');
    gallery.innerHTML = '';
    products.forEach((product) => {
      const productCard = `
          <div class="col-md-4">
            <div class="card mb-4">
              <img src="/images/${product.image}" class="card-img-top" alt="${product.name}">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.brand.name}</p>
                <a href="/products/details/${product._id}" class="btn btn-primary">View Details</a>
              </div>
            </div>
          </div>
        `;
      gallery.insertAdjacentHTML('beforeend', productCard);
    });
  }

  // Setup Pagination
  function setupPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Previous button
    const prevClass = currentPage == 1 ? 'disabled' : '';
    const prevPage = currentPage - 1;
    pagination.insertAdjacentHTML(
      'beforeend',
      `<li class="page-item ${prevClass}">
          <a class="page-link" href="#" data-page="${prevPage}" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>`
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = currentPage == i ? 'active' : '';
      pagination.insertAdjacentHTML(
        'beforeend',
        `<li class="page-item ${activeClass}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>`
      );
    }

    // Next button
    const nextClass = currentPage == totalPages ? 'disabled' : '';
    const nextPage = currentPage + 1;
    pagination.insertAdjacentHTML(
      'beforeend',
      `<li class="page-item ${nextClass}">
          <a class="page-link" href="#" data-page="${nextPage}" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>`
    );

    // Add event listeners to pagination links
    const pageLinks = document.querySelectorAll('#pagination a.page-link');
    pageLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-page'));
        if (!isNaN(page)) {
          loadProducts(page);
        }
      });
    });
  }

  // Load Favorites (if logged in)
  if (authData.isAuthenticated) {
    try {
      const favoritesResponse = await fetch('/auth/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!favoritesResponse.ok) {
        throw new Error(`HTTP error! status: ${favoritesResponse.status}`);
      }
      const favoritesData = await favoritesResponse.json();
      displayFavorites(favoritesData.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  function displayFavorites(favorites) {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    favorites.forEach((product) => {
      const favoriteItem = `
          <li class="list-group-item">
            <a href="/products/details/${product._id}">${product.name}</a>
            <button class="btn btn-sm btn-danger float-right unfavorite-btn" data-product-id="${product._id}">Unfavorite</button>
          </li>
        `;
      favoritesList.insertAdjacentHTML('beforeend', favoriteItem);
    });

    // Add event listeners to unfavorite buttons
    const unfavoriteButtons = document.querySelectorAll('.unfavorite-btn');
    unfavoriteButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const response = await fetch(`/products/favorite/${productId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok) {
          e.target.closest('li').remove();
        } else {
          alert(`Error: ${result.error}`);
        }
      });
    });
  }

  // Initial load
  loadProducts(1);
});
