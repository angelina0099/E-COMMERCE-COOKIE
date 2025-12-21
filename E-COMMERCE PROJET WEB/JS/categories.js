const categories = {
    currentPage: 1,
    perPage: 10,
    sortKey: 'id',
    sortOrder: 'asc',
    searchQuery: '',
    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-gray-800" data-i18n="categories">Categories</h2>
                    <button onclick="categories.showAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-plus mr-2"></i><span data-i18n="addCategory">Add Category</span>
                    </button>
                </div>
                <div class="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
                    <input type="text" id="searchCategories" placeholder="${i18n.t('search')}..." 
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="categories.exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-file-csv mr-2"></i><span data-i18n="exportCSV">Export CSV</span>
                    </button>
                </div>
                <div id="categoriesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.renderCards()}
                </div>
                <div id="categoriesPagination"></div>
            </div>
        `;
        i18n.updatePage();
        this.renderPagination();
        document.getElementById('searchCategories').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.updateView();
        });
    },
    getFilteredCategories() {
        let items = api.get('categories');
        if (this.searchQuery) {
            items = utils.search(items, this.searchQuery, ['name', 'description']);
        }
        items = utils.sortBy(items, this.sortKey, this.sortOrder);
        return items;
    },
    renderCards() {
        const items = this.getFilteredCategories();
        const paginated = utils.paginate(items, this.currentPage, this.perPage);
        if (paginated.items.length === 0) {
            return '<div class="col-span-full text-center py-8 text-gray-500">No categories found</div>';
        }
        return paginated.items.map(cat => `
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${cat.name}</h3>
                    <div class="flex space-x-2">
                        <button onclick="categories.showEditModal(${cat.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="categories.deleteCategory(${cat.id})" 
                                class="text-red-600 hover:text-red-800 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-600 mb-4">${cat.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">Products:</span>
                    <span class="text-lg font-bold text-blue-600">${cat.productCount || 0}</span>
                </div>
            </div>
        `).join('');
    },
    updateView() {
        const grid = document.getElementById('categoriesGrid');
        if (grid) {
            grid.innerHTML = this.renderCards();
            this.renderPagination();
        }
    },
    renderPagination() {
        const items = this.getFilteredCategories();
        const totalPages = Math.ceil(items.length / this.perPage);
        const container = document.getElementById('categoriesPagination');
        if (!container) return;
        let html = '<div class="pagination">';
        html += `<button onclick="categories.changePage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="categories.changePage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `<button onclick="categories.changePage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
        html += '</div>';
        container.innerHTML = html;
    },
    changePage(page) {
        const items = this.getFilteredCategories();
        const totalPages = Math.ceil(items.length / this.perPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.updateView();
        }
    },
    showAddModal() {
        const form = `
            <form id="categoryForm" class="space-y-4">
                <div class="form-group">
                    <label class="form-label" data-i18n="categoryName">Category Name</label>
                    <input type="text" name="name" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="description">Description</label>
                    <textarea name="description" class="form-input" rows="3"></textarea>
                </div>
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" onclick="utils.closeModal()" 
                            class="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400" data-i18n="cancel">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-i18n="save">
                        Save
                    </button>
                </div>
            </form>
        `;
        utils.showModal(i18n.t('addCategory'), form);
        i18n.updatePage();
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
    },
    showEditModal(id) {
        const category = api.getById('categories', id);
        const form = `
            <form id="categoryForm" class="space-y-4">
                <input type="hidden" name="id" value="${category.id}">
                <div class="form-group">
                    <label class="form-label" data-i18n="categoryName">Category Name</label>
                    <input type="text" name="name" value="${category.name}" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="description">Description</label>
                    <textarea name="description" class="form-input" rows="3">${category.description}</textarea>
                </div>
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" onclick="utils.closeModal()" 
                            class="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400" data-i18n="cancel">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-i18n="save">
                        Save
                    </button>
                </div>
            </form>
        `;
        utils.showModal(i18n.t('editCategory'), form);
        i18n.updatePage();
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
    },
    saveCategory() {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const isValid = utils.validateForm('categoryForm', {
            name: { required: true, minLength: 2 }
        });
        if (!isValid) return;
        if (data.id) {
            api.update('categories', data.id, data);
            utils.showNotification(i18n.t('updateSuccess'));
        } else {
            data.productCount = 0;
            api.create('categories', data);
            utils.showNotification(i18n.t('addSuccess'));
        }
        utils.closeModal();
        this.updateView();
    },
    deleteCategory(id) {
        utils.confirm(i18n.t('confirmDelete'), () => {
            api.delete('categories', id);
            utils.showNotification(i18n.t('deleteSuccess'));
            this.updateView();
        });
    },
    exportCSV() {
        const items = this.getFilteredCategories();
        const data = items.map(c => ({
            ID: c.id,
            Name: c.name,
            Description: c.description,
            Products: c.productCount
        }));
        utils.exportToCSV(data, 'categories.csv');
    }
};
