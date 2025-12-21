const utils = {
    showLoading() {
        return '<div class="spinner"></div>';
    },
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    },
    showModal(title, content, onConfirm = null) {
        const modal = document.getElementById('modalContainer');       
        modal.innerHTML = `
            <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="modal-content bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-bold">${title}</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="utils.closeModal()">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;       
        if (onConfirm) {
            document.getElementById('modalConfirm')?.addEventListener('click', () => {
                onConfirm();
                this.closeModal();
            });
        }
    },
    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
    },
    confirm(message, onConfirm) {
        const content = `
            <p class="mb-6">${message}</p>
            <div class="flex justify-end space-x-4">
                <button onclick="utils.closeModal()" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" data-i18n="no">
                    ${i18n.t('no')}
                </button>
                <button id="modalConfirm" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" data-i18n="yes">
                    ${i18n.t('yes')}
                </button>
            </div>
        `;        
        this.showModal(i18n.t('confirmDelete'), content, onConfirm);
    },
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;        
        document.body.appendChild(notification);        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    validateForm(formId, rules) {
        const form = document.getElementById(formId);
        let isValid = true;        
        for (const [field, validation] of Object.entries(rules)) {
            const input = form.querySelector(`[name="${field}"]`);
            const errorDiv = form.querySelector(`#${field}Error`);           
            if (!input) continue;           
            let error = '';           
            if (validation.required && !input.value.trim()) {
                error = i18n.t('required');
                isValid = false;
            } else if (validation.email && !this.isValidEmail(input.value)) {
                error = i18n.t('invalidEmail');
                isValid = false;
            } else if (validation.min && parseFloat(input.value) < validation.min) {
                error = `${i18n.t('minValue')}: ${validation.min}`;
                isValid = false;
            } else if (validation.minLength && input.value.length < validation.minLength) {
                error = `${i18n.t('minLength')}: ${validation.minLength}`;
                isValid = false;
            }            
            if (errorDiv) {
                errorDiv.textContent = error;
                errorDiv.style.display = error ? 'block' : 'none';
            }            
            input.classList.toggle('border-red-500', !!error);
        }       
        return isValid;
    },   
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    exportToCSV(data, filename) {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(','))
        ].join('\n');
        this.downloadFile(csvContent, filename, 'text/csv');
    },
    exportToPDF(title, headers, data, filename) {
        const content = `
${title}
${'='.repeat(50)}
${headers.join(' | ')}
${'-'.repeat(50)}
${data.map(row => headers.map(h => row[h]).join(' | ')).join('\n')}
        `;
        this.downloadFile(content, filename, 'application/pdf');
    },
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },
    paginate(items, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            items: items.slice(start, end),
            totalPages: Math.ceil(items.length / perPage),
            currentPage: page
        };
    },
    sortBy(items, key, order = 'asc') {
        return [...items].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (typeof aVal === 'string') {
                return order === 'asc' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }           
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        });
    },
    search(items, query, fields) {
        const lowerQuery = query.toLowerCase();
        return items.filter(item => 
            fields.some(field => 
                String(item[field]).toLowerCase().includes(lowerQuery)
            )
        );
    }
};
