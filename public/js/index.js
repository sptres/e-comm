document.addEventListener('DOMContentLoaded', async () => {
  let isAuthenticated = false;
  let token = localStorage.getItem('token');
  // debugging
  console.log('Token from localStorage:', token);

  const authResponse = await fetch('/auth/session', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  const authData = await authResponse.json();
  // debugging
  console.log('Auth data:', authData);

  // conditional navigation
  const navAuth = document.getElementById('nav-auth');
  if (authData.isAuthenticated) {
    console.log('User is authenticated');
    isAuthenticated = true;
    let navContent = `
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout-link">Logout</a>
      </li>
    `;

    // admin link if user is admin
    if (authData.isAdmin) {
      navContent =
        `
        <li class="nav-item">
          <a class="nav-link" href="/admin">Admin</a>
        </li>
      ` + navContent;
    }

    navAuth.innerHTML = navContent;

    document
      .getElementById('logout-link')
      .addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/auth/logout', { method: 'POST' });
          if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/';
          } else {
            const errorData = await response.json();
            console.error('Logout failed:', errorData.error);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });

    // fetch favorites
    loadFavorites(token);
  } else {
    console.log('User is not authenticated');
    isAuthenticated = false;
    navAuth.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/register">Sign Up</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/login">Login</a>
      </li>
    `;

    // display message for non-authenticated users
    displayFavoritesMessage();
  }

  // load brands for filter panel
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

  // handle filter form submission
  const filterForm = document.getElementById('filter-form');
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadProducts(1);
  });

  // get current page based on url params
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get('page')) || 1;

  // load products
  loadProducts(currentPage);

  // load products
  async function loadProducts(page = 1) {
    // get selected filters
    const selectedBrands = Array.from(
      document.querySelectorAll('#brand-filters input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);
    const selectedTypes = Array.from(
      document.querySelectorAll('#type-filters input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    let url = `/products/api?page=${page}`;
    if (selectedBrands.length > 0) {
      url += `&brand=${selectedBrands.join(';')}`;
    }
    if (selectedTypes.length > 0) {
      url += `&type=${selectedTypes.join(';')}`;
    }

    const productsResponse = await fetch(url);
    const productsData = await productsResponse.json();

    if (productsResponse.ok) {
      if (productsData.products.length === 0) {
        displayNoProductsFound();
      } else {
        displayProducts(productsData.products);
        setupPagination(page, productsData.totalPages);
      }
    } else {
      // handle errors
      document.getElementById(
        'product-gallery'
      ).innerHTML = `<p>${productsData.error}</p>`;
      document.getElementById('pagination').innerHTML = '';
    }

    // pagination url
    const newUrl = `/products?page=${page}${
      selectedBrands.length > 0 ? `&brand=${selectedBrands.join(';')}` : ''
    }${selectedTypes.length > 0 ? `&type=${selectedTypes.join(';')}` : ''}`;
    history.pushState(
      { page: page, brand: selectedBrands, type: selectedTypes },
      '',
      newUrl
    );
  }

  // display products
  function displayProducts(products) {
    const gallery = document.getElementById('product-gallery');
    gallery.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row';

    products.forEach((product) => {
      const productCard = `
        <div class="col-md-4 mb-4">
          <div class="card product-card">
            <img src="/images/${product.image}" class="card-img-top" alt="${
        product.name
      }">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.brand.name}</p>
              <p class="card-text">$${product.price.toFixed(2)}</p>
              <div class="d-flex justify-content-between">
                <a href="/products/details/${
                  product._id
                }" class="btn btn-primary">View Details</a>
                <button class="btn btn-primary favorite-btn" data-product-id="${
                  product._id
                }">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      row.insertAdjacentHTML('beforeend', productCard);
    });

    // if there are fewer than 3 products, add empty columns to maintain layout
    const emptyColumns = 3 - (products.length % 3);
    if (emptyColumns < 3) {
      for (let i = 0; i < emptyColumns; i++) {
        const emptyColumn = `<div class="col-md-4"></div>`;
        row.insertAdjacentHTML('beforeend', emptyColumn);
      }
    }

    gallery.appendChild(row);

    // event listeners to favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach((button) => {
      button.addEventListener('click', handleFavoriteClick);
    });
  }

  // handle favorite button clicks
  async function handleFavoriteClick(e) {
    const productId = e.target.closest('.favorite-btn').dataset.productId;

    if (!isAuthenticated) {
      showErrorMessage('You must be logged in to favorite products');
      return;
    }

    try {
      const response = await fetch(`/products/favorite/${productId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        showSuccessMessage(result.message);
        loadFavorites(token);
      } else {
        const error = await response.json();
        showErrorMessage(error.error);
      }
    } catch (error) {
      console.error('Error favoriting product:', error);
      showErrorMessage('An error occurred. Please try again.');
    }
  }

  // show error message
  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    `;
    document.querySelector('.container-fluid').prepend(errorDiv);

    // remove message after 1 second
    setTimeout(() => {
      errorDiv.remove();
    }, 1000);
  }

  // show success message
  function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.role = 'alert';
    successDiv.innerHTML = `
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    `;
    document.querySelector('.container-fluid').prepend(successDiv);

    // remove message after 1 second
    setTimeout(() => {
      successDiv.remove();
    }, 1000);
  }

  // pagination
  function setupPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // prev button disable if curr == 1
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

    // page num
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = currentPage == i ? 'active' : '';
      pagination.insertAdjacentHTML(
        'beforeend',
        `<li class="page-item ${activeClass}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>`
      );
    }

    // next button disable if curr == totalPages
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

    // event listeners to pagination links
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

  // load favorites
  async function loadFavorites(token) {
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
      displayFavoritesMessage(
        'Error loading favorites. Please try again later.'
      );
    }
  }

  // display favorites
  function displayFavorites(favorites) {
    const favoritesContent = document.getElementById('favorites-content');
    if (favorites.length === 0) {
      favoritesContent.innerHTML = '<p>You have no favorites yet.</p>';
      return;
    }

    const favoritesList = document.createElement('ul');
    favoritesList.className = 'list-group';
    favorites.forEach((product) => {
      const favoriteItem = `
        <li class="list-group-item">
          <a href="/products/details/${product._id}">${product.name}</a>
          <button class="btn btn-sm btn-danger float-right unfavorite-btn" data-product-id="${product._id}">Delete</button>
        </li>
      `;
      favoritesList.insertAdjacentHTML('beforeend', favoriteItem);
    });
    favoritesContent.innerHTML = '';
    favoritesContent.appendChild(favoritesList);

    // event listeners to unfavorite buttons
    const unfavoriteButtons = document.querySelectorAll('.unfavorite-btn');
    unfavoriteButtons.forEach((button) => {
      button.addEventListener('click', handleUnfavoriteClick);
    });
  }

  // handle unfavorite button clicks
  async function handleUnfavoriteClick(e) {
    const productId = e.target.dataset.productId;

    try {
      const response = await fetch(`/products/favorite/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        showSuccessMessage(result.message);
        loadFavorites(token);
      } else {
        const error = await response.json();
        showErrorMessage(error.error);
      }
    } catch (error) {
      console.error('Error unfavoriting product:', error);
      showErrorMessage('An error occurred. Please try again.');
    }
  }

  // display message for non-authenticated users or errors
  function displayFavoritesMessage(
    message = 'Must be logged in for this feature'
  ) {
    const favoritesContent = document.getElementById('favorites-content');
    favoritesContent.innerHTML = `<p class="text-muted">${message}</p>`;
  }

  // display "No products found" message
  function displayNoProductsFound() {
    const gallery = document.getElementById('product-gallery');
    gallery.innerHTML = '<p class="col-12 text-center">No products found</p>';
    document.getElementById('pagination').innerHTML = '';
  }

  // initial
  loadProducts(1);
});
