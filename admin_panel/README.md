# OneTee Admin Panel

A comprehensive admin panel for managing OneTee's marketplace, community, and business operations.

## Features

### 🏠 Dashboard
- **Overview Analytics**: Real-time metrics for users, products, orders, and revenue
- **Quick Actions**: Easy access to common administrative tasks
- **Community Stats**: Social engagement metrics and trends
- **Navigation Hub**: Centralized access to all admin sections

### 📦 Product Management
- **Product Catalog**: View, search, and filter all products
- **Product Creation**: Add new products with images, variants, and metadata
- **Inventory Management**: Track stock levels and manage product variants
- **Product Editing**: Update product details, pricing, and status
- **Tag & Collection Management**: Organize products with tags and collections

### 🛒 Order Management
- **Order Tracking**: View all customer orders with detailed information
- **Status Updates**: Update order status (pending, paid, shipped, delivered, etc.)
- **Order Details**: Complete order information including items and customer data
- **Payment Tracking**: Monitor payment providers and transaction status

### 👥 User Management
- **User Directory**: Browse and search user accounts
- **Account Status**: Activate/deactivate user accounts
- **Admin Permissions**: Grant or revoke admin privileges
- **User Verification**: Track verified vs unverified users
- **User Details**: Complete user profile information

### 💬 Community Management
- **Thread Moderation**: View and manage community threads
- **Content Moderation**: Delete inappropriate content
- **Engagement Metrics**: Track likes, reposts, and bookmarks
- **Community Stats**: Monitor overall community health

### 📊 Analytics
- **Revenue Analytics**: Detailed revenue trends and analysis
- **Top Products**: Best-selling products and performance metrics
- **User Analytics**: User growth and engagement statistics
- **Community Metrics**: Social engagement and community health
- **Business KPIs**: Key performance indicators and insights

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Backend API running on `http://localhost:8000`
- Admin credentials configured in backend environment

### Installation

1. **Install Dependencies**
   ```bash
   cd admin_panel
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the admin_panel directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   Open your browser and navigate to `http://localhost:5173`

### Backend Configuration

Ensure your backend has the following environment variables set:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## API Endpoints

The admin panel communicates with the following backend endpoints:

### Authentication
- `POST /marketplace/admin/login` - Admin login
- `POST /marketplace/admin/logout` - Admin logout

### Analytics
- `GET /marketplace/admin/analytics/overview` - Dashboard overview
- `GET /marketplace/admin/analytics/revenue` - Revenue analytics
- `GET /marketplace/admin/analytics/top-products` - Top selling products

### Products
- `GET /marketplace/admin/products` - List products
- `POST /marketplace/admin/products` - Create product
- `PUT /marketplace/admin/products/{id}` - Update product
- `DELETE /marketplace/admin/products/{id}` - Delete product
- `PUT /marketplace/admin/products/{id}/variants/{variant_id}/stock` - Update stock
- `POST /marketplace/admin/products/{id}/variants` - Add variant

### Orders
- `GET /marketplace/admin/orders` - List orders
- `PUT /marketplace/admin/orders/{id}/status` - Update order status

### Users
- `GET /marketplace/admin/users` - List users
- `PUT /marketplace/admin/users/{id}/status` - Update user status
- `PUT /marketplace/admin/users/{id}/admin` - Update admin status

### Community
- `GET /marketplace/admin/community/stats` - Community statistics
- `GET /marketplace/admin/community/threads` - List threads
- `DELETE /marketplace/admin/community/threads/{id}` - Delete thread

### Tags & Collections
- `GET /marketplace/admin/tags` - List tags
- `POST /marketplace/admin/tags` - Create tag
- `PUT /marketplace/admin/tags/{id}` - Update tag
- `DELETE /marketplace/admin/tags/{id}` - Delete tag
- `GET /marketplace/admin/collections` - List collections
- `POST /marketplace/admin/collections` - Create collection
- `PUT /marketplace/admin/collections/{id}` - Update collection
- `DELETE /marketplace/admin/collections/{id}` - Delete collection

## Usage Guide

### Getting Started

1. **Login**: Use your admin credentials to access the panel
2. **Dashboard**: Start with the dashboard to get an overview of your business
3. **Navigation**: Use the sidebar to navigate between different sections

### Product Management

1. **View Products**: Navigate to Products section to see all products
2. **Add Product**: Click "Add Product" to create a new product
3. **Edit Product**: Click the edit icon to modify product details
4. **Manage Stock**: Update stock levels for product variants
5. **Organize**: Use tags and collections to organize products

### Order Management

1. **View Orders**: Navigate to Orders section to see all orders
2. **Filter Orders**: Use status filters to find specific orders
3. **Update Status**: Change order status as it progresses
4. **View Details**: Click the eye icon to see complete order information

### User Management

1. **Browse Users**: Navigate to Users section to see all users
2. **Search Users**: Use the search function to find specific users
3. **Manage Status**: Activate or deactivate user accounts
4. **Admin Access**: Grant or revoke admin privileges

### Community Management

1. **Monitor Threads**: View all community threads
2. **Moderate Content**: Delete inappropriate content
3. **Track Engagement**: Monitor likes, reposts, and bookmarks
4. **Community Health**: Check community statistics

### Analytics

1. **Overview**: Start with the dashboard overview
2. **Revenue Analysis**: Use the analytics section for detailed revenue insights
3. **Product Performance**: Track top-selling products
4. **User Metrics**: Monitor user growth and engagement

## Security Features

- **Admin Authentication**: Secure login with admin credentials
- **Session Management**: Automatic session handling with cookies
- **Protected Routes**: All admin routes require authentication
- **API Security**: Backend validates admin permissions for all endpoints

## Development

### Project Structure
```
admin_panel/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # UI components (shadcn/ui)
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── ProductManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── CommunityManagement.tsx
│   │   └── Analytics.tsx
│   ├── app/
│   │   └── api.ts          # API client functions
│   ├── router/
│   │   └── AppRouter.tsx   # Routing configuration
│   └── layouts/
│       └── Layout.tsx      # Main layout component
```

### Key Technologies
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:8000`
   - Check CORS configuration in backend
   - Verify admin credentials are set correctly

2. **Authentication Issues**
   - Clear browser cookies and try again
   - Verify admin username/password in backend environment
   - Check browser console for error messages

3. **Component Loading Issues**
   - Ensure all dependencies are installed
   - Check for TypeScript compilation errors
   - Verify component imports are correct

### Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend API endpoints are working
3. Ensure all environment variables are set correctly
4. Check the backend logs for any server-side issues

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test all new features thoroughly
5. Update documentation for any new features

## License

This admin panel is part of the OneTee project and follows the same licensing terms.
