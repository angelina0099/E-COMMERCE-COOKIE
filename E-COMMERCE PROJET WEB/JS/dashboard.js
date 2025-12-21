const dashboard = {
    charts: {},
    async render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="space-y-6">
                <h2 class="text-3xl font-bold text-gray-800" data-i18n="dashboard">Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.renderKPICards()}
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow card-hover">
                        <h3 class="text-xl font-bold mb-4" data-i18n="revenueChart">Revenue Chart</h3>
                        <canvas id="revenueChart"></canvas>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow card-hover">
                        <h3 class="text-xl font-bold mb-4" data-i18n="ordersChart">Orders Status</h3>
                        <canvas id="ordersChart"></canvas>
                    </div
                    <div class="bg-white p-6 rounded-lg shadow card-hover">
                        <h3 class="text-xl font-bold mb-4" data-i18n="productsChart">Products by Category</h3>
                        <canvas id="productsChart"></canvas>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow card-hover">
                        <h3 class="text-xl font-bold mb-4" data-i18n="salesTrend">Sales Trend</h3>
                        <canvas id="salesTrendChart"></canvas>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow card-hover lg:col-span-2">
                        <h3 class="text-xl font-bold mb-4" data-i18n="topProducts">Top Products</h3>
                        <canvas id="topProductsChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        i18n.updatePage();
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }
        this.renderCharts();
    },
    renderKPICards() {
        const products = api.get('products');
        const orders = api.get('orders');
        const customers = api.get('customers');
        const categories = api.get('categories');
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total, 0);
        const lowStockProducts = products.filter(p => p.stock < 20).length;
        const topCategory = categories.reduce((max, cat) => 
            cat.productCount > (max?.productCount || 0) ? cat : max, null);
        
        const kpis = [
            {
                title: i18n.t('totalRevenue'),
                value: utils.formatCurrency(totalRevenue),
                icon: 'fa-dollar-sign',
                color: 'from-green-500 to-green-600',
                change: '+12.5%'
            },
            {
                title: i18n.t('totalOrders'),
                value: orders.length,
                icon: 'fa-shopping-cart',
                color: 'from-blue-500 to-blue-600',
                change: '+8.2%'
            },
            {
                title: i18n.t('totalProducts'),
                value: products.length,
                icon: 'fa-box',
                color: 'from-purple-500 to-purple-600',
                change: '+3.1%'
            },
            {
                title: i18n.t('totalCustomers'),
                value: customers.length,
                icon: 'fa-users',
                color: 'from-orange-500 to-orange-600',
                change: '+15.3%'
            },
            {
                title: i18n.t('lowStockAlert'),
                value: lowStockProducts,
                icon: 'fa-exclamation-triangle',
                color: 'from-red-500 to-red-600',
                change: '-5.2%'
            },
            {
                title: i18n.t('topCategory'),
                value: topCategory?.name || 'N/A',
                icon: 'fa-trophy',
                color: 'from-yellow-500 to-yellow-600',
                change: ''
            }
        ];
        return kpis.map(kpi => `
            <div class="bg-gradient-to-br ${kpi.color} text-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-white text-opacity-80 text-sm mb-2">${kpi.title}</p>
                        <h3 class="text-3xl font-bold">${kpi.value}</h3>
                        ${kpi.change ? `<p class="text-sm mt-2 text-white text-opacity-80">${kpi.change}</p>` : ''}
                    </div>
                    <div class="bg-white bg-opacity-20 p-3 rounded-lg">
                        <i class="fas ${kpi.icon} text-2xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },
    async loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    renderCharts() {
        setTimeout(() => {
            this.renderRevenueChart();
            this.renderOrdersChart();
            this.renderProductsChart();
            this.renderSalesTrendChart();
            this.renderTopProductsChart();
        }, 100);
    },
    renderRevenueChart() {
        const orders = api.get('orders');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueData = months.map((_, i) => {
            return orders
                .filter(o => new Date(o.date).getMonth() === i && o.status === 'completed')
                .reduce((sum, o) => sum + o.total, 0);
        });
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '$' + value.toFixed(0)
                        }
                    }
                }
            }
        });
    },
    renderOrdersChart() {
        const orders = api.get('orders');
        const statusCount = {
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0
        };
        orders.forEach(o => statusCount[o.status]++);
        const ctx = document.getElementById('ordersChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: [
                        'rgb(251, 191, 36)',
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(239, 68, 68)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    },
    renderProductsChart() {
        const products = api.get('products');
        const categories = {};
        
        products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        const ctx = document.getElementById('productsChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    },
    renderSalesTrendChart() {
        const orders = api.get('orders');
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });
        const salesData = last7Days.map(date => {
            return orders
                .filter(o => o.date === date)
                .reduce((sum, o) => sum + o.total, 0);
        });
        const ctx = document.getElementById('salesTrendChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days.map(d => new Date(d).toLocaleDateString('en', { weekday: 'short' })),
                datasets: [{
                    label: 'Sales',
                    data: salesData,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: 'rgb(139, 92, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    renderTopProductsChart() {
        const products = api.get('products');
        const orders = api.get('orders');
        const productSales = {};
        orders.forEach(order => {
            order.products?.forEach(p => {
                productSales[p.productName] = (productSales[p.productName] || 0) + p.quantity;
            });
        });
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topProducts.map(p => p[0]),
                datasets: [{
                    label: 'Units Sold',
                    data: topProducts.map(p => p[1]),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
};
