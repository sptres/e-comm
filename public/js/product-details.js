document.addEventListener('DOMContentLoaded', async () => {
  const productId = window.location.pathname.split('/').pop();
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/products/api/details/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (response.ok) {
      displayProductDetails(data.product);
      displayRelatedProducts(data.relatedProducts);
    } else {
      showErrorMessage(data.error);
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    showErrorMessage('An error occurred while fetching product details.');
  }
});

function displayProductDetails(product) {
  const productDetailsDiv = document.getElementById('product-details');
  productDetailsDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="/images/${product.image}" alt="${
    product.name
  }" class="img-fluid">
            </div>
            <div class="col-md-6">
                <h2>${product.name}</h2>
                <p>Brand: ${product.brand.name}</p>
                <p>Price: $${product.price.toFixed(2)}</p>
                <p>Description: ${product.description}</p>
                <p>Type: ${product.type}</p>
                <button id="favorite-btn" class="btn btn-primary" data-product-id="${
                  product._id
                }">
                    <i class="fas fa-heart"></i> Favorite
                </button>
            </div>
        </div>
    `;

  document
    .getElementById('favorite-btn')
    .addEventListener('click', handleFavoriteClick);
}

function displayRelatedProducts(relatedProducts) {
  const relatedProductsDiv = document.getElementById('related-products');
  relatedProductsDiv.innerHTML = relatedProducts
    .map(
      (product) => `
        <div class="col-md-3 mb-3">
            <div class="card">
                <img src="/images/${product.image}" class="card-img-top" alt="${
        product.name
      }">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">$${product.price.toFixed(2)}</p>
                    <a href="/products/details/${
                      product._id
                    }" class="btn btn-primary">View Details</a>
                </div>
            </div>
        </div>
    `
    )
    .join('');
}

async function handleFavoriteClick(e) {
  const productId = e.target.dataset.productId;
  const token = localStorage.getItem('token');

  if (!token) {
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

    const result = await response.json();

    if (response.ok) {
      showSuccessMessage(result.message);
    } else {
      showErrorMessage(result.error);
    }
  } catch (error) {
    console.error('Error favoriting product:', error);
    showErrorMessage('An error occurred. Please try again.');
  }
}

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
  document.querySelector('.container').prepend(errorDiv);

  // Automatically remove the message after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 1000);
}

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
  document.querySelector('.container').prepend(successDiv);

  // Automatically remove the message after 5 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 1000);
}
