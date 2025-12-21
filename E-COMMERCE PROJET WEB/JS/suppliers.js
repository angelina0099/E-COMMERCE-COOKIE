const suppliers = {
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
                    <h2 class="text-3xl font-bold text-gray-800" data-i18n="suppliers">Suppliers</h2>
                    <button onclick="suppliers.showAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-plus mr-2"></i><span data-i18n="addSupplier">Add Supplier</span>
                    </button>
                </div>
                <div class="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
                    <input type="text" id="searchSuppliers" placeholder="${i18n.t('search')}..." 
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="suppliers.exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-file-csv mr-2"></i><span data-i18n="exportCSV">Export CSV</span>
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="suppliers.sort('id')">
                                        ID
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="suppliers.sort('name')">
                                        <span data-i18n="supplierName">Name</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="suppliers.sort('contact')">
                                        <span data-i18n="contact">Contact</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        <span data-i18n="phone">Phone</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        <span data-i18n="address">Address</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="suppliersTableBody">
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 border-t">
                        <div id="suppliersPagination"></div>
                    </div>
                </div>
            </div>
        `;        
        i18n.updatePage();
        this.renderPagination();        
        document.getElementById('searchSuppliers').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.updateTable();
        });
    },    
    getFilteredSuppliers() {
        let items = api.get('suppliers');        
        if (this.searchQuery) {
            items = utils.search(items, this.searchQuery, ['name', 'contact', 'email', 'phone', 'address']);
        }        
        items = utils.sortBy(items, this.sortKey, this.sortOrder);        
        return items;
    },    
    renderTableRows() {
        const items = this.getFilteredSuppliers();
        const paginated = utils.paginate(items, this.currentPage, this.perPage);        
        if (paginated.items.length === 0) {
            return '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No suppliers found</td></tr>';
        }        
        return paginated.items.map(supplier => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4">${supplier.id}</td>
                <td class="px-6 py-4 font-semibold">${supplier.name}</td>
                <td class="px-6 py-4">${supplier.contact}</td>
                <td class="px-6 py-4">${supplier.email}</td>
                <td class="px-6 py-4">${supplier.phone}</td>
                <td class="px-6 py-4 text-sm">${supplier.address}</td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="suppliers.showEditModal(${supplier.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2" title="${i18n.t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="suppliers.deleteSupplier(${supplier.id})" 
                                class="text-red-600 hover:text-red-800 p-2" title="${i18n.t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }, 
    updateTable() {
        const tbody = document.getElementById('suppliersTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTableRows();
            this.renderPagination();
        }
    },   
    renderPagination() {
        const items = this.getFilteredSuppliers();
        const totalPages = Math.ceil(items.length / this.perPage);
        const container = document.getElementById('suppliersPagination');        
        if (!container) return;       
        let html = '<div class="pagination">';        
        html += `<button onclick="suppliers.changePage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;     
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="suppliers.changePage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }     
        html += `<button onclick="suppliers.changePage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
        
        html += '</div>';
        container.innerHTML = html;
    },   
    changePage(page) {
        const items = this.getFilteredSuppliers();
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
        const form = `
            <form id="supplierForm" class="space-y-4">
                <div class="form-group">
                    <label class="form-label" data-i18n="supplierName">Supplier Name</label>
                    <input type="text" name="name" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="contact">Contact Person</label>
                    <input type="text" name="contact" class="form-input" required>
                    <div id="contactError" class="form-error"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-input" required>
                        <div id="emailError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="phone">Phone</label>
                        <input type="tel" name="phone" class="form-input" required>
                        <div id="phoneError" class="form-error"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="address">Address</label>
                    <textarea name="address" class="form-input" rows="2" required></textarea>
                    <div id="addressError" class="form-error"></div>
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
        utils.showModal(i18n.t('addSupplier'), form);
        i18n.updatePage();
        document.getElementById('supplierForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupplier();
        });
    },
    showEditModal(id) {
        const supplier = api.getById('suppliers', id);
        const form = `
            <form id="supplierForm" class="space-y-4">
                <input type="hidden" name="id" value="${supplier.id}">
                <div class="form-group">
                    <label class="form-label" data-i18n="supplierName">Supplier Name</label>
                    <input type="text" name="name" value="${supplier.name}" class="form-input" required>
                    <div id="nameError" class="form-error"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="contact">Contact Person</label>
                    <input type="text" name="contact" value="${supplier.contact}" class="form-input" required>
                    <div id="contactError" class="form-error"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" value="${supplier.email}" class="form-input" required>
                        <div id="emailError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="phone">Phone</label>
                        <input type="tel" name="phone" value="${supplier.phone}" class="form-input" required>
                        <div id="phoneError" class="form-error"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="address">Address</label>
                    <textarea name="address" class="form-input" rows="2" required>${supplier.address}</textarea>
                    <div id="addressError" class="form-error"></div>
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
        utils.showModal(i18n.t('editSupplier'), form);
        i18n.updatePage();
        document.getElementById('supplierForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupplier();
        });
    },
    saveSupplier() {
        const form = document.getElementById('supplierForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const isValid = utils.validateForm('supplierForm', {
            name: { required: true, minLength: 2 },
            contact: { required: true },
            email: { required: true, email: true },
            phone: { required: true },
            address: { required: true }
        });
        if (!isValid) return;
        if (data.id) {
            api.update('suppliers', data.id, data);
            utils.showNotification(i18n.t('updateSuccess'));
        } else {
            api.create('suppliers', data);
            utils.showNotification(i18n.t('addSuccess'));
        }
        utils.closeModal();
        this.updateTable();
    },
    deleteSupplier(id) {
        utils.confirm(i18n.t('confirmDelete'), () => {
            api.delete('suppliers', id);
            utils.showNotification(i18n.t('deleteSuccess'));
            this.updateTable();
        });
    },
    exportCSV() {
        const items = this.getFilteredSuppliers();
        const data = items.map(s => ({
            ID: s.id,
            Name: s.name,
            Contact: s.contact,
            Email: s.email,
            Phone: s.phone,
            Address: s.address
        }));
        utils.exportToCSV(data, 'suppliers.csv');
    }
};
