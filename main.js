// API URL - using Platzi Fake Store API
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Store all products
let allProducts = [];

// Fetch and display products when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
});

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allProducts = data;
        renderTable(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error loading data. Make sure json-server is running.
                </td>
            </tr>
        `;
    }
}

// Render table with products
function renderTable(products) {
    const tableBody = document.getElementById('tableBody');
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No products found</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            data-bs-title="${escapeHtml(product.description || 'No description available')}"
            style="cursor: pointer;">
            <td><strong>#${product.id}</strong></td>
            <td>${product.title}</td>
            <td><span class="text-success fw-bold">$${product.price}</span></td>
            <td>
                <span class="category-badge">
                    ${product.category?.name || 'N/A'}
                </span>
            </td>
            <td>
                <img src="${product.images?.[0] || 'https://via.placeholder.com/60'}" 
                     alt="${product.title}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
            </td>
        </tr>
    `).join('');
    
    // Initialize Bootstrap tooltips
    initTooltips();
}

// Escape HTML to prevent XSS in tooltips
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/"/g, '&quot;');
}

// Initialize Bootstrap tooltips
function initTooltips() {
    // Dispose existing tooltips first
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(el => {
        const tooltip = bootstrap.Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    });
    
    // Initialize new tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => {
        new bootstrap.Tooltip(el, {
            container: 'body',
            html: false
        });
    });
}

// Handle search input - realtime filtering
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        renderTable(allProducts);
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(term)
    );
    
    renderTable(filteredProducts);
}
