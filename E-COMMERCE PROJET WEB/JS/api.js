const api = {
    baseURL: 'https://fakestoreapi.com',
    async init() {
        if (!localStorage.getItem('products')) {
            await this.loadInitialData();
        }
    },
    async loadInitialData() {
        try {
            const products = await this.fetchProducts();
            const categories = await this.fetchCategories();
            const transformedProducts = products.map(p => ({
                id: p.id,
                name: p.title,
                price: p.price,
                category: p.category,
                description: p.description,
                image: p.image,
                stock: Math.floor(Math.random() * 100) + 10,
                rating: p.rating?.rate || 4.5
            }));
            localStorage.setItem('products', JSON.stringify(transformedProducts));
            const transformedCategories = categories.map((cat, index) => ({
                id: index + 1,
                name: cat,
                description: `Category for ${cat} products`,
                productCount: transformedProducts.filter(p => p.category === cat).length
            }));
            localStorage.setItem('categories', JSON.stringify(transformedCategories));
            this.generateInitialOrders(transformedProducts);
            this.generateInitialSuppliers();
            this.generateInitialCustomers();   
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.createFallbackData();
        }
    }, 
    async fetchProducts() {
        const response = await fetch(`${this.baseURL}/products`);
        return await response.json();
    },
    async fetchCategories() {
        const response = await fetch(`${this.baseURL}/products/categories`);
        return await response.json();
    },
    generateInitialOrders(products) {
        const statuses = ['pending', 'processing', 'completed', 'cancelled'];
        const orders = [];
        for (let i = 1; i <= 50; i++) {
            const orderProducts = [];
            const numProducts = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numProducts; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                orderProducts.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: Math.floor(Math.random() * 5) + 1,
                    price: product.price
                });
            }
            const total = orderProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            orders.push({
                id: i,
                orderNumber: `ORD-${String(i).padStart(5, '0')}`,
                customerId: Math.floor(Math.random() * 20) + 1,
                customerName: `Customer ${Math.floor(Math.random() * 20) + 1}`,
                date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                products: orderProducts,
                total: parseFloat(total.toFixed(2))
            });
        }
        localStorage.setItem('orders', JSON.stringify(orders));
    },
    generateInitialSuppliers() {
        const suppliers = [
            { id: 1, name: 'TechSupply Inc', contact: 'John Doe', email: 'john@techsupply.com', phone: '+2123456876', address: '123 Tech Street, Silicon Valley, CA' },
            { id: 2, name: 'Global Electronics', contact: 'Jane Smith', email: 'jane@globalelec.com', phone: '+2120987654', address: '456 Circuit Ave, New York, NY' },
            { id: 3, name: 'Digital Distributors', contact: 'Mike Johnson', email: 'mike@digitaldist.com', phone: '+2120987654', address: '789 Binary Blvd, Austin, TX' },
            { id: 4, name: 'Component World', contact: 'Sarah Williams', email: 'sarah@gmail.com', phone: '+212678990', address: '321 Chip Lane, Boston, MA' },
            { id: 5, name: 'Hardware Hub', contact: 'David Brown', email: 'david@gmail.com', phone: '+212098456', address: '654 Device Dr, Seattle, WA' }
        ];
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    },
    generateInitialCustomers() {
        const customers = [];
        const companies = ['Tech Corp', 'Digital Solutions', 'Innovation Ltd', 'Future Systems', 'Smart Tech', 'Cyber Innovations'];       
        for (let i = 1; i <= 30; i++) {
            customers.push({
                id: i,
                name: `Customer ${i}`,
                company: companies[Math.floor(Math.random() * companies.length)],
                email: `customer${i}@gmail.com`,
                phone: `+21298483-${String(i).padStart(4, '0')}`,
                address: `${i * 10} Business Rd, City, State`,
                totalOrders: Math.floor(Math.random() * 20),
                totalSpent: parseFloat((Math.random() * 50000).toFixed(2))
            });
        }        
        localStorage.setItem('customers', JSON.stringify(customers));
    },
    createFallbackData() {
        const fallbackProducts = [
            { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'electronics', stock: 45, description: 'High-performance laptop', image: 'https://via.placeholder.com/300' },
            { id: 2, name: 'Wireless Mouse', price: 29.99, category: 'electronics', stock: 150, description: 'Ergonomic wireless mouse', image: 'https://via.placeholder.com/300' },
            { id: 3, name: 'USB-C Hub', price: 49.99, category: 'electronics', stock: 80, description: 'Multi-port USB hub', image: 'https://via.placeholder.com/300' }
        ];        
        localStorage.setItem('products', JSON.stringify(fallbackProducts));
        localStorage.setItem('categories', JSON.stringify([{ id: 1, name: 'electronics', description: 'Electronic devices', productCount: 3 }]));
        this.generateInitialOrders(fallbackProducts);
        this.generateInitialSuppliers();
        this.generateInitialCustomers();
    }, 
    get(entity) {
        const data = localStorage.getItem(entity);
        return data ? JSON.parse(data) : [];
    },
    getById(entity, id) {
        const items = this.get(entity);
        return items.find(item => item.id === parseInt(id));
    },
    create(entity, item) {
        const items = this.get(entity);
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItem = { ...item, id: newId };
        items.push(newItem);
        localStorage.setItem(entity, JSON.stringify(items));
        return newItem;
    },
    update(entity, id, updates) {
        const items = this.get(entity);
        const index = items.findIndex(item => item.id === parseInt(id));    
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(entity, JSON.stringify(items));
            return items[index];
        }
        return null;
    },
    delete(entity, id) {
        let items = this.get(entity);
        items = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(entity, JSON.stringify(items));
        return true;
    }
};
