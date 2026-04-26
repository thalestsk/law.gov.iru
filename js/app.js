// Get laws data from the HTML table
function getLawsFromTable() {
    const laws = [];
    const rows = document.querySelectorAll('#lawsTableBody tr');
    
    rows.forEach((row, index) => {
        const cells = row.cells;
        if (cells.length >= 4) { // Ensure we have all required columns
            const link = cells[1].querySelector('a');
            laws.push({
                id: index + 1,
                chapter: cells[0].textContent.trim(),
                title: link ? link.textContent.trim() : cells[1].textContent.trim(),
                category: cells[2].textContent.trim(),
                type: cells[3].textContent.trim(),
                href: link ? link.getAttribute('href') : '#'
            });
        }
    });
    
    return laws;
}

let laws = []; // Will be populated in init()

// DOM Elements
const tableBody = document.getElementById('lawsTableBody');
const searchInput = document.getElementById('searchInput');
const categoryCheckboxes = document.querySelectorAll('.category-checkboxes input[type="checkbox"]:not(#selectAll)');
const selectAllCheckbox = document.getElementById('selectAll');
const resetFiltersBtn = document.getElementById('resetFilters');
const firstPageBtn = document.getElementById('firstPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const lastPageBtn = document.getElementById('lastPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageSizeSelect = document.getElementById('pageSize');
const paginationInfo = document.getElementById('paginationInfo');
const tableHeaders = document.querySelectorAll('#lawsTable thead th');

// Pagination state
let currentPage = 1;
let pageSize = 50;
let filteredLaws = [...laws];

// Initialize the app
function init() {
    // Get laws from the HTML table
    laws = getLawsFromTable();
    filteredLaws = [...laws];
    
    // Add sorting indicators and event listeners to headers
    tableHeaders.forEach((header, index) => {
        if (index < 2) { // Only make first two columns sortable (Reference No. and Short Title)
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => sortTable(index));
        }
    });
    
    renderTable();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        filterLaws();
    });

    // Category checkboxes
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectAllCheckbox();
            currentPage = 1;
            filterLaws();
        });
    });

    // Select all checkbox
    selectAllCheckbox.addEventListener('change', () => {
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        currentPage = 1;
        filterLaws();
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        selectAllCheckbox.checked = true;
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        currentPage = 1;
        filterLaws();
    });

    // Pagination controls
    firstPageBtn.addEventListener('click', () => {
        currentPage = 1;
        renderTable();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredLaws.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    lastPageBtn.addEventListener('click', () => {
        currentPage = Math.ceil(filteredLaws.length / pageSize) || 1;
        renderTable();
    });

    // Page size selector
    pageSizeSelect.addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });
}

// Sort direction state
let sortColumn = 0; // 0 for Reference No., 1 for Short Title
let sortDirection = 1; // 1 for ascending, -1 for descending

// Sort the table by column
function sortTable(columnIndex) {
    // If clicking the same column, reverse the sort direction
    if (sortColumn === columnIndex) {
        sortDirection *= -1;
    } else {
        sortColumn = columnIndex;
        sortDirection = 1; // Default to ascending when changing columns
    }
    
    // Update sort indicators
    updateSortIndicators();
    
    // Sort the filteredLaws array
    filteredLaws.sort((a, b) => {
        let valueA, valueB;
        
        if (sortColumn === 0) { // Reference No.
            // Extract numbers from the reference (e.g., 'Cap. 77' -> 77)
            const numA = parseInt(a.chapter.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.chapter.replace(/\D/g, '')) || 0;
            return (numA - numB) * sortDirection;
        } else { // Short Title
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            return valueA.localeCompare(valueB) * sortDirection;
        }
    });
    
    // Reset to first page after sorting
    currentPage = 1;
    renderTable();
}

// Update sort indicators in table headers
function updateSortIndicators() {
    tableHeaders.forEach((header, index) => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (index === sortColumn) {
            header.classList.add(sortDirection === 1 ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const allChecked = Array.from(categoryCheckboxes).every(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allChecked;
}

// Get selected categories
function getSelectedCategories() {
    const selectedCategories = [];
    categoryCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCategories.push(checkbox.value);
        }
    });
    return selectedCategories;
}

// Filter laws based on search and categories
function filterLaws() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategories = getSelectedCategories();

    filteredLaws = laws.filter(law => {
        const matchesSearch = !searchTerm || 
            law.title.toLowerCase().includes(searchTerm) || 
            law.chapter.toLowerCase().includes(searchTerm) ||
            law.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(category => {
            if (category === 'act-of-estates') return law.category === 'Act of Estates';
            if (category === 'proclamation') return law.category === 'Proclamation' || law.category === 'Edict';
            if (category === 'orders-of-state') return law.category === 'Orders of State';
            if (category === 'court-rulings') return law.category === 'Court Rulings';
            if (category === 'regulations') return law.category === 'Regulations';
            return false;
        });
        
        return matchesSearch && matchesCategory;
    });
    
    // Apply current sorting after filtering
    sortTable(sortColumn);
}

// Render the laws table
function renderTable() {
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLaws = filteredLaws.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredLaws.length / pageSize) || 1;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Render laws
    if (paginatedLaws.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="no-results">
                No laws found matching your criteria.
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        paginatedLaws.forEach(law => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${law.chapter}</td>
                <td><a href="${law.href}">${law.title}</a></td>
                <td>${formatCategory(law.category)}</td>
                <td>${law.type}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Update pagination controls
    updatePaginationControls(totalPages);
    updatePaginationInfo(totalPages);
}

// Format category for display
function formatCategory(category) {
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Update pagination controls
function updatePaginationControls(totalPages) {
    // Disable/enable navigation buttons
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    lastPageBtn.disabled = currentPage >= totalPages;

    // Generate page numbers
    let pageNumbersHTML = '';
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbersHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }

    pageNumbers.innerHTML = pageNumbersHTML;

    // Add event listeners to page number buttons
    document.querySelectorAll('.page-number').forEach(button => {
        button.addEventListener('click', (e) => {
            currentPage = parseInt(e.target.dataset.page);
            renderTable();
        });
    });
}

// Update pagination info
function updatePaginationInfo(totalPages) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredLaws.length);
    
    paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${filteredLaws.length} laws`;
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('Mobile menu toggle found:', !!mobileMenuToggle);
    console.log('Nav links found:', !!navLinks);
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked from app.js!');
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
            console.log('Nav links classes:', navLinks.className);
        });
    } else {
        console.error('Mobile menu elements not found in app.js');
    }
}

// Initialize mobile menu with multiple attempts
function tryInitMobileMenu() {
    initMobileMenu();
    // Try again after a delay if header is still loading
    setTimeout(initMobileMenu, 500);
    setTimeout(initMobileMenu, 1000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
    tryInitMobileMenu();
});
