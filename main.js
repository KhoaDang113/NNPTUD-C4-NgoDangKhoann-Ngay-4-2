// API URL - using Platzi Fake Store API
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Store all products and filtered products
let allProducts = [];
let filteredProducts = [];

// Pagination state
let currentPage = 1;
let itemsPerPage = 10;

// Sorting state
let sortColumn = null; // 'title' or 'price'
let sortDirection = 'asc'; // 'asc' or 'desc'

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
        filteredProducts = data;
        renderTable();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error loading data. Please check your connection.
                </td>
            </tr>
        `;
    }
}

// Render table with pagination
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (currentProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No products found</td>
            </tr>
        `;
        updatePaginationInfo(0, 0, 0);
        renderPaginationControls(0);
        return;
    }

    tableBody.innerHTML = currentProducts.map(product => `
        <tr data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            data-bs-title="${escapeHtml(product.description || 'No description available')}"
            style="cursor: pointer;"
            onclick="openDetailModal(${product.id})">
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
    
    // Update pagination info and controls
    updatePaginationInfo(startIndex + 1, endIndex, totalItems);
    renderPaginationControls(totalPages);
    
    // Initialize Bootstrap tooltips
    initTooltips();
}

// Update pagination info text
function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent = 
        `Showing ${start} to ${end} of ${total} items`;
}

// Render pagination controls
function renderPaginationControls(totalPages) {
    const container = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(1); return false;">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a></li>`;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
}

// Change items per page
function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1; // Reset to first page
    renderTable();
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
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(term)
        );
    }
    
    currentPage = 1; // Reset to first page when searching
    renderTable();
}

// Handle sorting
function handleSort(column) {
    // Toggle direction if same column, otherwise reset to ascending
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Sort filtered products
    filteredProducts.sort((a, b) => {
        let valueA, valueB;
        
        if (column === 'title') {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        } else if (column === 'price') {
            valueA = a.price;
            valueB = b.price;
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    currentPage = 1; // Reset to first page when sorting
    updateSortIcons();
    renderTable();
}

// Update sort icons in table headers
function updateSortIcons() {
    // Reset all icons
    const titleIcon = document.getElementById('sort-title-icon');
    const priceIcon = document.getElementById('sort-price-icon');
    
    titleIcon.className = 'bi sort-icon';
    priceIcon.className = 'bi sort-icon';
    
    // Set active icon
    if (sortColumn === 'title') {
        titleIcon.className = `bi sort-icon active bi-sort-alpha-${sortDirection === 'asc' ? 'down' : 'up'}`;
    } else if (sortColumn === 'price') {
        priceIcon.className = `bi sort-icon active bi-sort-numeric-${sortDirection === 'asc' ? 'down' : 'up'}`;
    }
}

// Export current view data to CSV
function exportToCSV() {
    if (filteredProducts.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // CSV headers
    const headers = ['ID', 'Title', 'Price', 'Description', 'Category', 'Images'];
    
    // Convert data to CSV rows
    const rows = filteredProducts.map(product => {
        return [
            product.id,
            `"${(product.title || '').replace(/"/g, '""')}"`,
            product.price,
            `"${(product.description || '').replace(/"/g, '""')}"`,
            `"${product.category?.name || 'N/A'}"`,
            `"${(product.images || []).join('; ')}"`
        ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create blob and download link
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// Current product being viewed/edited
let currentProduct = null;
let detailModal = null;

// Open detail modal
function openDetailModal(productId) {
    currentProduct = allProducts.find(p => p.id === productId);
    if (!currentProduct) return;
    
    // Populate view mode
    document.getElementById('detailId').textContent = currentProduct.id;
    document.getElementById('detailTitle').textContent = currentProduct.title;
    document.getElementById('detailPrice').textContent = '$' + currentProduct.price;
    document.getElementById('detailCategory').textContent = currentProduct.category?.name || 'N/A';
    document.getElementById('detailDescription').textContent = currentProduct.description || 'No description';
    document.getElementById('detailImage').src = currentProduct.images?.[0] || 'https://via.placeholder.com/250';
    document.getElementById('detailImage').onerror = function() {
        this.src = 'https://via.placeholder.com/250?text=No+Image';
    };
    
    // Populate edit form
    document.getElementById('editId').value = currentProduct.id;
    document.getElementById('editTitle').value = currentProduct.title;
    document.getElementById('editPrice').value = currentProduct.price;
    document.getElementById('editDescription').value = currentProduct.description || '';
    document.getElementById('editImages').value = currentProduct.images?.[0] || '';
    
    // Reset to view mode
    document.getElementById('viewMode').style.display = 'block';
    document.getElementById('editMode').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    
    // Show modal
    if (!detailModal) {
        detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
    }
    detailModal.show();
}

// Toggle between view and edit mode
function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    const isEditing = editMode.style.display === 'block';
    
    if (isEditing) {
        // Switch to view mode
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    } else {
        // Switch to edit mode
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'inline-block';
    }
}

// Save product via PUT API
async function saveProduct() {
    const productId = document.getElementById('editId').value;
    const updatedProduct = {
        title: document.getElementById('editTitle').value,
        price: parseFloat(document.getElementById('editPrice').value),
        description: document.getElementById('editDescription').value,
        images: [document.getElementById('editImages').value || 'https://via.placeholder.com/250']
    };
    
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        const result = await response.json();
        
        // Update local data
        const index = allProducts.findIndex(p => p.id == productId);
        if (index !== -1) {
            allProducts[index] = { ...allProducts[index], ...result };
        }
        
        // Update filtered products too
        const filteredIndex = filteredProducts.findIndex(p => p.id == productId);
        if (filteredIndex !== -1) {
            filteredProducts[filteredIndex] = { ...filteredProducts[filteredIndex], ...result };
        }
        
        // Refresh table and close modal
        renderTable();
        detailModal.hide();
        
        alert('Product updated successfully!');
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
    }
}

// Create modal instance
let createModal = null;

// Open create modal
function openCreateModal() {
    // Reset form
    document.getElementById('createForm').reset();
    document.getElementById('createCategoryId').value = 1;
    
    // Show modal
    if (!createModal) {
        createModal = new bootstrap.Modal(document.getElementById('createModal'));
    }
    createModal.show();
}

// Create product via POST API
async function createProduct() {
    const title = document.getElementById('createTitle').value.trim();
    const price = document.getElementById('createPrice').value;
    const description = document.getElementById('createDescription').value.trim();
    const categoryId = document.getElementById('createCategoryId').value;
    const images = document.getElementById('createImages').value.trim();
    
    // Validate required fields
    if (!title || !price || !categoryId) {
        alert('Please fill in all required fields (Title, Price, Category ID)');
        return;
    }
    
    const newProduct = {
        title: title,
        price: parseFloat(price),
        description: description || 'No description',
        categoryId: parseInt(categoryId),
        images: [images || 'https://via.placeholder.com/250']
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });
        
        if (!response.ok) throw new Error('Failed to create product');
        
        const result = await response.json();
        
        // Add to local data
        allProducts.unshift(result);
        filteredProducts.unshift(result);
        
        // Refresh table and close modal
        currentPage = 1;
        renderTable();
        createModal.hide();
        
        alert('Product created successfully!');
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Error creating product. Please try again.');
    }
}
