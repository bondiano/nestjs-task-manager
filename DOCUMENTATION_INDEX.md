# NestJS IAM Framework - Documentation Index

## Welcome to the NestJS IAM Framework Documentation

This is a comprehensive Identity and Access Management (IAM) framework built with NestJS, TypeScript, PostgreSQL, and Redis. The framework provides a robust foundation for authentication, authorization, and user management in modern web applications.

## 📋 Documentation Overview

This documentation is organized into several focused guides to help you work with the framework effectively:

### 🚀 [API Documentation](./API_DOCUMENTATION.md)
**Primary Reference for API Usage**
- Complete API reference with examples
- Authentication and authorization guides
- Data models and DTOs
- Response formats and error handling
- Usage patterns and best practices
- Setup and configuration instructions

### 🔧 [Component Reference](./COMPONENT_REFERENCE.md)
**Technical Reference for Components**
- Detailed documentation for each component
- Service interfaces and methods
- Guards, interceptors, and decorators
- Entity definitions and utilities
- Error classes and interfaces
- Type definitions and constants

### ⚡ [Quick Reference](./QUICK_REFERENCE.md)
**Daily Development Reference**
- Common patterns and code snippets
- Environment variable reference
- Troubleshooting guide
- Testing patterns
- Docker setup examples
- Development workflow tips

## 🏗️ Framework Architecture

```
NestJS IAM Framework
├── Core Module
│   ├── Health monitoring
│   ├── Error handling
│   ├── Response standardization
│   └── Validation pipeline
├── Features Module
│   └── IAM Module (Dynamic)
│       ├── Authentication service
│       ├── Authorization guards
│       ├── Token management
│       └── User management
└── Library Modules
    ├── Base entities
    ├── Response utilities
    ├── Crypto services
    └── Custom decorators
```

## 🎯 Key Features

- **🔐 JWT Authentication**: Secure token-based authentication with refresh tokens
- **🛡️ Role-Based Access Control**: Flexible role and permission system
- **🔒 Password Security**: Argon2 password hashing with configurable parameters
- **📊 Health Monitoring**: Built-in health checks for database and memory
- **🚦 Functional Programming**: fp-ts integration for robust error handling
- **🎨 Response Standardization**: Consistent API response format
- **📝 Comprehensive Validation**: Class-validator integration with custom decorators
- **🐳 Docker Ready**: Complete containerization setup
- **✅ Test Coverage**: Comprehensive testing framework setup

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Yarn or npm

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd nestjs-iam-framework
   yarn install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d db redis
   
   # Run migrations (if any)
   yarn typeorm:migration:run
   ```

4. **Start Development**
   ```bash
   yarn dev
   ```

5. **Test the API**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/container
   ```

### Integration Example

```typescript
// 1. Create your user entity
@Entity('users')
export class User extends AuthEntity {
  @Column()
  firstName: string;
  
  @Column()
  lastName: string;
}

// 2. Setup the IAM module
@Module({
  imports: [
    IamModule.forRoot<User>({
      entity: User,
      key: 'user'
    })
  ]
})
export class UserModule {}

// 3. Create protected endpoints
@Controller('api/users')
@UseGuards(AccessTokenGuard)
export class UserController {
  @Get('profile')
  getProfile(@ActiveUser() user: IActiveUserData) {
    return user;
  }
}
```

## 📚 Learning Path

### For New Developers
1. Start with [Quick Reference](./QUICK_REFERENCE.md) - Common patterns section
2. Review [API Documentation](./API_DOCUMENTATION.md) - Usage examples
3. Explore [Component Reference](./COMPONENT_REFERENCE.md) - Core concepts

### For Experienced Developers
1. Review [API Documentation](./API_DOCUMENTATION.md) - Architecture overview
2. Deep dive into [Component Reference](./COMPONENT_REFERENCE.md) - Technical details
3. Use [Quick Reference](./QUICK_REFERENCE.md) for daily development

### For Integration
1. Follow the Getting Started guide above
2. Study the integration example patterns
3. Reference troubleshooting guides as needed

## 🛠️ Development Workflow

### Daily Development
```bash
# Start development server
yarn dev

# Run tests during development
yarn test:watch

# Check code quality
yarn lint
```

### Before Deployment
```bash
# Run full test suite
yarn test
yarn test:e2e

# Build for production
yarn build

# Verify build works
yarn start:prod
```

### Production Deployment
```bash
# Build Docker image
docker build -t nestjs-iam-framework .

# Or use docker-compose
docker-compose up -d
```

## 🔍 API Examples

### Authentication Flow
```bash
# Health check
curl GET http://localhost:3000/api/health

# Container info
curl GET http://localhost:3000/api/container

# Note: Authentication endpoints would be implemented in your application
# using the IAM framework's AuthenticationService
```

### Using with Postman/Insomnia
The framework includes Swagger/OpenAPI integration. Start the server and visit:
```
http://localhost:3000/api/docs
```

## 🐛 Troubleshooting

### Common Issues
- **Connection refused**: Check if PostgreSQL and Redis are running
- **JWT errors**: Verify JWT_SECRET and other JWT configuration
- **Validation errors**: Check DTO structure and decorators
- **Module import errors**: Verify IamModule.forRoot() configuration

### Debug Mode
```bash
# Start with debug logging
DEBUG=* yarn dev

# Or use NestJS debug mode
yarn dev:debug
```

See [Quick Reference - Troubleshooting](./QUICK_REFERENCE.md#troubleshooting) for detailed solutions.

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run linting
yarn lint

# Check commit format
yarn commit
```

### Project Structure
- `/src/app` - Main application module
- `/src/core` - Core functionality (global)
- `/src/features` - Feature modules (IAM)
- `/src/lib` - Shared libraries and utilities
- `/test` - Test files and utilities
- `/docs` - Documentation files

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Component Reference](./COMPONENT_REFERENCE.md) - Technical documentation
- [Quick Reference](./QUICK_REFERENCE.md) - Development guide

### Issues and Questions
- Check the troubleshooting section in [Quick Reference](./QUICK_REFERENCE.md)
- Review the FAQ section in [API Documentation](./API_DOCUMENTATION.md)
- Search existing issues in the project repository

### Community
- Follow NestJS best practices
- Adhere to TypeScript strict mode
- Use fp-ts patterns for error handling
- Maintain test coverage above 80%

---

**Happy coding with the NestJS IAM Framework! 🚀**

*This framework provides a solid foundation for building secure, scalable applications with proper authentication and authorization. Start with the Quick Reference for immediate productivity, then dive deeper into the complete documentation as needed.*