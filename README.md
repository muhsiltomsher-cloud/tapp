# WhatsApp Business API Application

A comprehensive web-based platform integrated with WhatsApp Business API for customer support, sales, and marketing automation. Built with Next.js, TypeScript, MongoDB, and Socket.IO for real-time communication.

## Features

- **Real-Time Messaging**: Engage with customers instantly through WhatsApp with WebSocket-powered real-time updates
- **User Management**: Role-based access control (Master Admin, Admin, Client User)
- **Campaign Management**: Create, schedule, and send marketing campaigns
- **Product Catalog**: Manage and share product catalogs with customers
- **Analytics Dashboard**: Track performance metrics and gain insights
- **Team Collaboration**: Assign conversations to team members
- **Secure Authentication**: JWT-based authentication system

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Real-Time**: Socket.IO for WebSocket communication
- **Authentication**: JWT (JSON Web Tokens)
- **API Integration**: WhatsApp Business API
- **Icons**: Lucide React
- **Charts**: Recharts

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20.x or higher
- MongoDB (local or MongoDB Atlas)
- WhatsApp Business API credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/whatsapp-business-api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# WhatsApp Business API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Getting Started

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Create your first account by clicking "Get Started" or "Register"

## Project Structure

```
tapp/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── users/        # User management endpoints
│   │   │   ├── messages/     # Messaging endpoints
│   │   │   ├── campaigns/    # Campaign endpoints
│   │   │   ├── products/     # Product catalog endpoints
│   │   │   ├── analytics/    # Analytics endpoints
│   │   │   └── webhooks/     # WhatsApp webhook handler
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   ├── contexts/             # React contexts (Auth, Socket)
│   ├── lib/                  # Utility libraries
│   │   ├── auth/            # Authentication utilities
│   │   ├── db/              # Database connection
│   │   ├── socket/          # Socket.IO server
│   │   └── whatsapp/        # WhatsApp API client
│   ├── models/              # MongoDB models
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Master Admin only)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Master Admin only)

### Messages & Conversations
- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/conversations/[id]` - Get conversation details
- `PUT /api/messages/conversations/[id]` - Update conversation

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/send` - Send campaign

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Analytics
- `GET /api/analytics` - Get analytics data

### Webhooks
- `GET /api/webhooks/whatsapp` - Webhook verification
- `POST /api/webhooks/whatsapp` - Handle incoming WhatsApp messages

## User Roles

1. **Master Admin**
   - Full system access
   - User management (create, edit, delete)
   - Campaign management
   - Analytics access

2. **Admin**
   - User management (view, edit)
   - Campaign management
   - Analytics access
   - Conversation management

3. **Client User**
   - View assigned conversations
   - Send and receive messages
   - Access product catalog

## Development

### Running Linter
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

## WhatsApp Business API Setup

1. Create a Facebook Business Account
2. Set up WhatsApp Business API
3. Get your Phone Number ID and Access Token
4. Configure webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
5. Set webhook verify token in environment variables
6. Subscribe to message events

## MongoDB Setup

### Local MongoDB
```bash
mongod --dbpath /path/to/data
```

### MongoDB Atlas
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`

## Socket.IO Real-Time Features

The application uses Socket.IO for real-time features:
- Live message updates
- Typing indicators
- Conversation status changes
- Real-time notifications

## Security Considerations

- All API routes are protected with JWT authentication
- Passwords are hashed using bcrypt
- Role-based access control for sensitive operations
- Environment variables for sensitive data
- CORS configuration for production

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- AWS
- Google Cloud
- Azure
- DigitalOcean

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or open an issue in the repository.
