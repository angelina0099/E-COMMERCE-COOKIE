const customers = {
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
                    <h2 class="text-3xl font-bold text-gray-800" data-i18n="customers">Customers</h2>
                    <button onclick="customers.showAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-plus mr-2"></i><span data-i18n="addCustomer">Add Customer</span>
                    </button>
                </div>
                <div class="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
                    <input type="text" id="searchCustomers" placeholder="${i18n.t('search')}..." 
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="customers.exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-file-csv mr-2"></i><span data-i18n="exportCSV">Export CSV</span>
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="customers.sort('id')">
                                        ID
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="customers.sort('name')">
                                        <span data-i18n="customerName">Name</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="customers.sort('company')">
                                        <span data-i18n="company">Company</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        <span data-i18n="phone">Phone</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="customers.sort('totalOrders')">
                                        Total Orders
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="customers.sort('totalSpent')">
                                        Total Spent
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="customersTableBody">
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 border-t">
                        <div id="customersPagination"></div>
                    </div>
                </div>
            </div>
        `;
        i18n.updatePage();
        this.renderPagination();
        document.getElementById('searchCustomers').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.updateTable();
        });
    },
    getFilteredCustomers() {
        let items = api.get('customers');
        if (this.searchQuery) {
            items = utils.search(items, this.searchQuery, ['name', 'company', 'email', 'phone']);
        }
        items = utils.sortBy(items, this.sortKey, this.sortOrder);
        return items;
    },
    renderTableRows() {
        const items = this.getFilteredCustomers();
        const paginated = utils.paginate(items, this.currentPage, this.perPage);
        if (paginated.items.length === 0) {
            return '<tr><td colspan="8" class="px-6 py-8 text-center text-gray-500">No customers found</td></tr>';
        }
        return paginated.items.map(customer => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4">${customer.id}</td>
                <td class="px-6 py-4 font-semibold">${customer.name}</td>
                <td class="px-6 py-4">${customer.company}</td>
                <td class="px-6 py-4">${customer.email}</td>
                <td class="px-6 py-4">${customer.phone}</td>
                <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        ${customer.totalOrders}
                    </span>
                </td>
                <td class="px-6 py-4 font-bold text-green-600">
                    ${utils.formatCurrency(customer.totalSpent)}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="customers.showEditModal(${customer.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2" title="${i18n.t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="customers.deleteCustomer(${customer.id})" 
                                class="text-red-600 hover:text-red-800 p-2" title="${i18n.t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    updateTable() {
        const tbody = document.getElementById('customersTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTableRows();
            this.renderPagination();
        }
    },
    renderPagination() {
        const items = this.getFilteredCustomers();
        const totalPages = Math.ceil(items.length / this.perPage);
        const container = document.getElementById('customersPagination');
        if (!container) return;
        let html = '<div class="pagination">';
        html += `<button onclick="customers.changePage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="customers.changePage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `<button onclick="customers.changePage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
        html += '</div>';
        container.innerHTML = html;
    },
    changePage(page) {
        const items = this.getFilteredCustomers();
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
            <form id="customerForm" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label" data-i18n="customerName">Customer Name</label>
                        <input type="text" name="name" class="form-input" required>
                        <div id="nameError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="company">Company</label>
                        <input type="text" name="company" class="form-input" required>
                        <div id="companyError" class="form-error"></div>
                    </div>
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
        utils.showModal(i18n.t('addCustomer'), form);
        i18n.updatePage();
        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });
    },
    showEditModal(id) {
        const customer = api.getById('customers', id);
        const form = `
            <form id="customerForm" class="space-y-4">
                <input type="hidden" name="id" value="${customer.id}">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label" data-i18n="customerName">Customer Name</label>
                        <input type="text" name="name" value="${customer.name}" class="form-input" required>
                        <div id="nameError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="company">Company</label>
                        <input type="text" name="company" value="${customer.company}" class="form-input" required>
                        <div id="companyError" class="form-error"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" value="${customer.email}" class="form-input" required>
                        <div id="emailError" class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="phone">Phone</label>
                        <input type="tel" name="phone" value="${customer.phone}" class="form-input" required>
                        <div id="phoneError" class="form-error"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="address">Address</label>
                    <textarea name="address" class="form-input" rows="2" required>${customer.address}</textarea>
                    <div id="addressError" class="form-error"></div>
                </div>
                <input type="hidden" name="totalOrders" value="${customer.totalOrders}">
                <input type="hidden" name="totalSpent" value="${customer.totalSpent}">
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
        utils.showModal(i18n.t('editCustomer'), form);
        i18n.updatePage();
        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });
    },
    saveCustomer() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const isValid = utils.validateForm('customerForm', {
            name: { required: true, minLength: 2 },
            company: { required: true },
            email: { required: true, email: true },
            phone: { required: true },
            address: { required: true }
        });
        if (!isValid) return;
        if (data.id) {
            data.totalOrders = parseInt(data.totalOrders);
            data.totalSpent = parseFloat(data.totalSpent);
            api.update('customers', data.id, data);
            utils.showNotification(i18n.t('updateSuccess'));
        } else {
            data.totalOrders = 0;
            data.totalSpent = 0;
            api.create('customers', data);
            utils.showNotification(i18n.t('addSuccess'));
        }
        utils.closeModal();
        this.updateTable();
    },
    deleteCustomer(id) {
        utils.confirm(i18n.t('confirmDelete'), () => {
            api.delete('customers', id);
            utils.showNotification(i18n.t('deleteSuccess'));
            this.updateTable();
        });
    },
    exportCSV() {
        const items = this.getFilteredCustomers();
        const data = items.map(c => ({
            ID: c.id,
            Name: c.name,
            Company: c.company,
            Email: c.email,
            Phone: c.phone,
            TotalOrders: c.totalOrders,
            TotalSpent: c.totalSpent
        }));
        utils.exportToCSV(data, 'customers.csv');
    }
};
