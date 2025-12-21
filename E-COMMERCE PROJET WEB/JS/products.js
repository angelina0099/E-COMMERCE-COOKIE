const products = {
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
                    <h2 class="text-3xl font-bold text-gray-800" data-i18n="products">Products</h2>
                    <button onclick="products.showAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-plus mr-2"></i><span data-i18n="addProduct">Add Product</span>
                    </button>
                </div>
                <div class="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
                    <input type="text" id="searchProducts" placeholder="${i18n.t('search')}..." 
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="products.exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-file-csv mr-2"></i><span data-i18n="exportCSV">Export CSV</span>
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="products.sort('id')">
                                        ID
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="products.sort('name')">
                                        <span data-i18n="productName">Name</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="products.sort('category')">
                                        <span data-i18n="category">Category</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="products.sort('price')">
                                        <span data-i18n="price">Price</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="products.sort('stock')">
                                        <span data-i18n="stock">Stock</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        <span data-i18n="actions">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 border-t">
                        <div id="productsPagination"></div>
                    </div>
                </div>
            </div>
        `;
        i18n.updatePage();
        this.renderPagination();
        document.getElementById('searchProducts').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.updateTable();
        });
    },
    getFilteredProducts() {
        let items = api.get('products');
        if (this.searchQuery) {
            items = utils.search(items, this.searchQuery, ['name', 'category', 'description']);
        }
        items = utils.sortBy(items, this.sortKey, this.sortOrder);
        return items;
    },
    renderTableRows() {
        const items = this.getFilteredProducts();
        const paginated = utils.paginate(items, this.currentPage, this.perPage);
        if (paginated.items.length === 0) {
            return '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No products found</td></tr>';
        }
        return paginated.items.map(product => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4">${product.id}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded mr-3">
                        <span class="font-medium">${product.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4">${product.category}</td>
                <td class="px-6 py-4 font-semibold">${utils.formatCurrency(product.price)}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                        product.stock > 50 ? 'bg-green-100 text-green-800' :
                        product.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${product.stock}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="products.showEditModal(${product.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2" title="${i18n.t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="products.deleteProduct(${product.id})" 
                                class="text-red-600 hover:text-red-800 p-2" title="${i18n.t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    updateTable() {
        const tbody = document.getElementById('productsTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTableRows();
            this.renderPagination();
        }
    },
    renderPagination() {
        const items = this.getFilteredProducts();
        const totalPages = Math.ceil(items.length / this.perPage);
        const container = document.getElementById('productsPagination');
        if (!container) return;
        let html = '<div class="pagination">';
        html += `<button onclick="products.changePage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="products.changePage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `<button onclick="products.changePage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
        
        html += '</div>';
        container.innerHTML = html;
    },
    changePage(page) {
        const items = this.getFilteredProducts();
        const totalPages = Math.ceil(items.length / this.perPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.updateTable();
        }
    },
    sort(key) {
        if (this.sortKey === key) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortOrder = 'asc';
        }
        this.updateTable();
    },
    showAddModal() {
        const categories = api.get('categories').map(c => c.name);
        const form = `
            <form id="productForm" class="space-y-4">
                <div class="form-group">
                    <label class="form-label" data-i18n="productName">Product Name</label>
                    <input type="text" name="name" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label" data-i18n="price">Price</label>
                        <input type="number" name="price" step="0.01" min="0" class="form-input" required>
                        <div id="priceError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="stock">Stock</label>
                        <input type="number" name="stock" min="0" class="form-input" required>
                        <div id="stockError" class="form-error"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="category">Category</label>
                    <select name="category" class="form-input" required>
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="description">Description</label>
                    <textarea name="description" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="image">Image URL</label>
                    <input type="url" name="image" class="form-input" required>
                    <div id="imageError" class="form-error"></div>
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
        utils.showModal(i18n.t('addProduct'), form);
        i18n.updatePage();
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },
    showEditModal(id) {
        const product = api.getById('products', id);
        const categories = api.get('categories').map(c => c.name);
        const form = `
            <form id="productForm" class="space-y-4">
                <input type="hidden" name="id" value="${product.id}">
                <div class="form-group">
                    <label class="form-label" data-i18n="productName">Product Name</label>
                    <input type="text" name="name" value="${product.name}" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label" data-i18n="price">Price</label>
                        <input type="number" name="price" value="${product.price}" step="0.01" min="0" class="form-input" required>
                        <div id="priceError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="stock">Stock</label>
                        <input type="number" name="stock" value="${product.stock}" min="0" class="form-input" required>
                        <div id="stockError" class="form-error"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="category">Category</label>
                    <select name="category" class="form-input" required>
                        ${categories.map(cat => `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="description">Description</label>
                    <textarea name="description" class="form-input" rows="3">${product.description}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="image">Image URL</label>
                    <input type="url" name="image" value="${product.image}" class="form-input" required>
                    <div id="imageError" class="form-error"></div>
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
        utils.showModal(i18n.t('editProduct'), form);
        i18n.updatePage();
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },
    saveProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const isValid = utils.validateForm('productForm', {
            name: { required: true, minLength: 3 },
            price: { required: true, min: 0 },
            stock: { required: true, min: 0 },
            image: { required: true }
        });
        if (!isValid) return;
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);
        if (data.id) {
            api.update('products', data.id, data);
            utils.showNotification(i18n.t('updateSuccess'));
        } else {
            api.create('products', data);
            utils.showNotification(i18n.t('addSuccess'));
        }
        utils.closeModal();
        this.updateTable();
    }, 
    deleteProduct(id) {
        utils.confirm(i18n.t('confirmDelete'), () => {
            api.delete('products', id);
            utils.showNotification(i18n.t('deleteSuccess'));
            this.updateTable();
        });
    },
    exportCSV() {
        const items = this.getFilteredProducts();
        const data = items.map(p => ({
            ID: p.id,
            Name: p.name,
            Category: p.category,
            Price: p.price,
            Stock: p.stock
        }));
        utils.exportToCSV(data, 'products.csv');
    }
};
