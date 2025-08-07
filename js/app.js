// Sample data - in a real app, this would come from an API
const laws = [
    { id: 1, chapter: 'A1', title: 'Administration of Justice Act', category: 'administrative', type: 'Act' },
    { id: 2, chapter: 'A2', title: 'Arbitration Act', category: 'civil', type: 'Act' },
    { id: 3, chapter: 'B1', title: 'Banking Act', category: 'commercial', type: 'Act' },
    { id: 4, chapter: 'C1', title: 'Companies Act', category: 'commercial', type: 'Act' },
    { id: 5, chapter: 'C2', title: 'Constitution', category: 'constitutional', type: 'Act' },
    { id: 6, chapter: 'C3', title: 'Criminal Code', category: 'criminal', type: 'Act' },
    { id: 7, chapter: 'E1', title: 'Environmental Protection Act', category: 'environmental', type: 'Act' },
    { id: 8, chapter: 'L1', title: 'Labor Relations Act', category: 'labor', type: 'Act' },
    { id: 9, chapter: 'T1', title: 'Tax Administration Act', category: 'tax', type: 'Act' },
    { id: 10, chapter: 'T2', title: 'Trade Marks Act', category: 'commercial', type: 'Act' },
    // Add more sample data as needed
];

// DOM Elements
const tableBody = document.getElementById('lawsTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const firstPageBtn = document.getElementById('firstPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const lastPageBtn = document.getElementById('lastPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageSizeSelect = document.getElementById('pageSize');
const paginationInfo = document.getElementById('paginationInfo');

// Pagination state
let currentPage = 1;
let pageSize = 50;
let filteredLaws = [...laws];

// Initialize the app
function init() {
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

    // Category filter
    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        filterLaws();
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = '';
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

// Filter laws based on search and category
function filterLaws() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    filteredLaws = laws.filter(law => {
        const matchesSearch = !searchTerm || 
            law.title.toLowerCase().includes(searchTerm) || 
            law.chapter.toLowerCase().includes(searchTerm) ||
            law.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || law.category === category;
        
        return matchesSearch && matchesCategory;
    });

    renderTable();
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
                <td><a href="law.html?id=${law.id}">${law.title}</a></td>
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

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
