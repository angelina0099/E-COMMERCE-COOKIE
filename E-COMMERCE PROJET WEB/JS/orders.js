const orders = {
    currentPage: 1,
    perPage: 10,
    sortKey: 'id',
    sortOrder: 'desc',
    searchQuery: '',
    filterStatus: 'all',
    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-gray-800" data-i18n="orders">Orders</h2>
                    <button onclick="orders.showAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-plus mr-2"></i><span data-i18n="addOrder">Add Order</span>
                    </button>
                </div>
                <div class="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
                    <input type="text" id="searchOrders" placeholder="${i18n.t('search')}..." 
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <select id="filterStatus" class="px-4 py-2 border rounded-lg">
                        <option value="all">All Status</option>
                        <option value="pending">${i18n.t('pending')}</option>
                        <option value="processing">${i18n.t('processing')}</option>
                        <option value="completed">${i18n.t('completed')}</option>
                        <option value="cancelled">${i18n.t('cancelled')}</option>
                    </select>
                    <button onclick="orders.exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-file-csv mr-2"></i><span data-i18n="exportCSV">Export CSV</span>
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="orders.sort('orderNumber')">
                                        <span data-i18n="orderNumber">Order #</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="orders.sort('customerName')">
                                        <span data-i18n="customer">Customer</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="orders.sort('date')">
                                        <span data-i18n="date">Date</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="orders.sort('total')">
                                        <span data-i18n="total">Total</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700 sortable" onclick="orders.sort('status')">
                                        <span data-i18n="status">Status</span>
                                    </th>
                                    <th class="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 border-t">
                        <div id="ordersPagination"></div>
                    </div>
                </div>
            </div>
        `;
        i18n.updatePage();
        this.renderPagination();
        document.getElementById('searchOrders').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.updateTable();
        });
        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.updateTable();
        });
    },
    getFilteredOrders() {
        let items = api.get('orders');
        if (this.searchQuery) {
            items = utils.search(items, this.searchQuery, ['orderNumber', 'customerName']);
        }
        if (this.filterStatus !== 'all') {
            items = items.filter(o => o.status === this.filterStatus);
        }
        items = utils.sortBy(items, this.sortKey, this.sortOrder);
        return items;
    },
    renderTableRows() {
        const items = this.getFilteredOrders();
        const paginated = utils.paginate(items, this.currentPage, this.perPage);
        if (paginated.items.length === 0) {
            return '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No orders found</td></tr>';
        }
        return paginated.items.map(order => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4 font-semibold">${order.orderNumber}</td>
                <td class="px-6 py-4">${order.customerName}</td>
                <td class="px-6 py-4">${utils.formatDate(order.date)}</td>
                <td class="px-6 py-4 font-bold text-green-600">${utils.formatCurrency(order.total)}</td>
                <td class="px-6 py-4">
                    <span class="status-badge status-${order.status}">${i18n.t(order.status)}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="orders.showViewModal(${order.id})" 
                                class="text-green-600 hover:text-green-800 p-2" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="orders.showEditModal(${order.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2" title="${i18n.t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="orders.deleteOrder(${order.id})" 
                                class="text-red-600 hover:text-red-800 p-2" title="${i18n.t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    updateTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTableRows();
            this.renderPagination();
        }
    },
    renderPagination() {
        const items = this.getFilteredOrders();
        const totalPages = Math.ceil(items.length / this.perPage);
        const container = document.getElementById('ordersPagination');
        if (!container) return;
        let html = '<div class="pagination">';
        html += `<button onclick="orders.changePage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="orders.changePage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `<button onclick="orders.changePage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
        
        html += '</div>';
        container.innerHTML = html;
    },
    changePage(page) {
        const items = this.getFilteredOrders();
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
    showViewModal(id) {
        const order = api.getById('orders', id); 
        const content = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Order Number</p>
                        <p class="font-bold text-lg">${order.orderNumber}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Status</p>
                        <span class="status-badge status-${order.status}">${i18n.t(order.status)}</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Customer</p>
                        <p class="font-semibold">${order.customerName}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Date</p>
                        <p class="font-semibold">${utils.formatDate(order.date)}</p>
                    </div>
                </div>
                <div class="border-t pt-4">
                    <h4 class="font-bold mb-3">Products</h4>
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left">Product</th>
                                <th class="px-4 py-2 text-left">Quantity</th>
                                <th class="px-4 py-2 text-left">Price</th>
                                <th class="px-4 py-2 text-left">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.products?.map(p => `
                                <tr class="border-t">
                                    <td class="px-4 py-2">${p.productName}</td>
                                    <td class="px-4 py-2">${p.quantity}</td>
                                    <td class="px-4 py-2">${utils.formatCurrency(p.price)}</td>
                                    <td class="px-4 py-2 font-semibold">${utils.formatCurrency(p.price * p.quantity)}</td>
                                </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>
                </div>
                <div class="border-t pt-4 flex justify-between items-center">
                    <span class="text-lg font-bold">Total:</span>
                    <span class="text-2xl font-bold text-green-600">${utils.formatCurrency(order.total)}</span>
                </div>
            </div>
        `;
        utils.showModal(`Order Details - ${order.orderNumber}`, content);
    },
    showAddModal() {
        const customers = api.get('customers');
        const products = api.get('products');
        const form = `
            <form id="orderForm" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label" data-i18n="customer">Customer</label>
                        <select name="customerId" class="form-input" required onchange="orders.updateCustomerName()">
                            <option value="">Select customer</option>
                            ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <input type="hidden" name="customerName" id="customerName">
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="status">Status</label>
                        <select name="status" class="form-input" required>
                            <option value="pending">${i18n.t('pending')}</option>
                            <option value="processing">${i18n.t('processing')}</option>
                            <option value="completed">${i18n.t('completed')}</option>
                            <option value="cancelled">${i18n.t('cancelled')}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="date">Date</label>
                    <input type="date" name="date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="border-t pt-4">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-bold">Products</h4>
                        <button type="button" onclick="orders.addProductRow()" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-plus-circle mr-1"></i> Add Product
                        </button>
                    </div>
                    <div id="productsContainer">
                        <div class="product-row flex gap-2 mb-2">
                            <select name="productId[]" class="form-input flex-1" required>
                                <option value="">Select product</option>
                                ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${p.name}">${p.name} - ${utils.formatCurrency(p.price)}</option>`).join('')}
                            </select>
                            <input type="number" name="quantity[]" placeholder="Qty" class="form-input w-24" min="1" value="1" required>
                            <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-800 px-2">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
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
        utils.showModal(i18n.t('addOrder'), form);
        i18n.updatePage();
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });
    },
    showEditModal(id) {
        const order = api.getById('orders', id);
        const customers = api.get('customers');
        const products = api.get('products');
        const form = `
            <form id="orderForm" class="space-y-4">
                <input type="hidden" name="id" value="${order.id}">
                <input type="hidden" name="orderNumber" value="${order.orderNumber}">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Order Number</label>
                        <input type="text" value="${order.orderNumber}" class="form-input" disabled>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="status">Status</label>
                        <select name="status" class="form-input" required>
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>${i18n.t('pending')}</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>${i18n.t('processing')}</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>${i18n.t('completed')}</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>${i18n.t('cancelled')}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="date">Date</label>
                    <input type="date" name="date" class="form-input" value="${order.date}" required>
                </div>
                <input type="hidden" name="customerId" value="${order.customerId}">
                <input type="hidden" name="customerName" value="${order.customerName}">
                <input type="hidden" name="products" value='${JSON.stringify(order.products)}'>
                <input type="hidden" name="total" value="${order.total}">
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
        utils.showModal(i18n.t('editOrder'), form);
        i18n.updatePage();
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });
    },
    updateCustomerName() {
        const select = document.querySelector('[name="customerId"]');
        const customerName = select.options[select.selectedIndex].text;
        document.getElementById('customerName').value = customerName;
    },
    addProductRow() {
        const products = api.get('products');
        const container = document.getElementById('productsContainer');
        const row = document.createElement('div');
        row.className = 'product-row flex gap-2 mb-2';
        row.innerHTML = `
            <select name="productId[]" class="form-input flex-1" required>
                <option value="">Select product</option>
                ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${p.name}">${p.name} - ${utils.formatCurrency(p.price)}</option>`).join('')}
            </select>
            <input type="number" name="quantity[]" placeholder="Qty" class="form-input w-24" min="1" value="1" required>
            <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-800 px-2">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
    },
    saveOrder() {
        const form = document.getElementById('orderForm');
        const formData = new FormData(form);
        const data = {
            id: formData.get('id'),
            orderNumber: formData.get('orderNumber'),
            customerId: parseInt(formData.get('customerId')),
            customerName: formData.get('customerName'),
            date: formData.get('date'),
            status: formData.get('status')
        };
        if (data.id) {
            data.products = JSON.parse(formData.get('products'));
            data.total = parseFloat(formData.get('total'));
        } else {
            const productIds = formData.getAll('productId[]').filter(id => id);
            const quantities = formData.getAll('quantity[]');
            if (productIds.length === 0) {
                alert('Please add at least one product');
                return;
            }
            const allProducts = api.get('products');
            data.products = productIds.map((id, index) => {
                const product = allProducts.find(p => p.id === parseInt(id));
                return {
                    productId: product.id,
                    productName: product.name,
                    quantity: parseInt(quantities[index]),
                    price: product.price
                };
            });
            data.total = data.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            data.orderNumber = `ORD-${String(Date.now()).slice(-5)}`;
        }
        if (data.id) {
            api.update('orders', data.id, data);
            utils.showNotification(i18n.t('updateSuccess'));
        } else {
            api.create('orders', data);
            utils.showNotification(i18n.t('addSuccess'));
        }
        utils.closeModal();
        this.updateTable();
    },
    deleteOrder(id) {
        utils.confirm(i18n.t('confirmDelete'), () => {
            api.delete('orders', id);
            utils.showNotification(i18n.t('deleteSuccess'));
            this.updateTable();
        });
    },
    exportCSV() {
        const items = this.getFilteredOrders();
        const data = items.map(o => ({
            OrderNumber: o.orderNumber,
            Customer: o.customerName,
            Date: o.date,
            Total: o.total,
            Status: o.status
        }));
        utils.exportToCSV(data, 'orders.csv');
    }
};
