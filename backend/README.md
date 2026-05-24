# Smart Civic Complaint Management System

A comprehensive web-based civic complaint management system built with Java Spring Boot, Thymeleaf, and MySQL. This system enables citizens to submit, track, and manage civic complaints while providing administrators and field workers with tools to efficiently handle and resolve issues.

## Features

### For Citizens (Users)
- **User Registration & Authentication** - Secure signup/login with email verification
- **Submit Complaints** - File complaints with category, priority, location, and attachments
- **Track Complaints** - Real-time status tracking with unique complaint numbers
- **View History** - Access all submitted complaints and their resolution status
- **Profile Management** - Update personal information and contact details

### For Administrators
- **Dashboard Analytics** - Overview of complaints, resolution rates, and trends
- **Complaint Management** - View, filter, and manage all complaints
- **Worker Assignment** - Assign complaints to field workers based on department
- **User Management** - Manage registered users and workers
- **Worker Management** - Add/edit workers with department and specialization
- **Reports & Statistics** - Track performance metrics and complaint trends

### For Field Workers
- **Assignment Dashboard** - View assigned complaints with priority indicators
- **Status Updates** - Update complaint progress with comments
- **Task Management** - Track pending, in-progress, and completed tasks
- **Due Date Tracking** - Monitor deadlines and overdue assignments

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.x
- **Security**: Spring Security with BCrypt password encoding
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Frontend**: Thymeleaf, Bootstrap 5.3, Bootstrap Icons
- **Build Tool**: Maven

## Prerequisites

Before running this application, ensure you have:

1. **Java 17 or higher** - [Download JDK](https://adoptium.net/)
2. **Maven 3.8+** - [Download Maven](https://maven.apache.org/download.cgi)
3. **MySQL 8.0** - [Download MySQL](https://dev.mysql.com/downloads/)

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/smart-civic-complaint-system.git
cd smart-civic-complaint-system
```

### Step 2: Create MySQL Database

```sql
CREATE DATABASE civic_complaints;
CREATE USER 'civic_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON civic_complaints.* TO 'civic_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/civic_complaints
spring.datasource.username=civic_user
spring.datasource.password=your_password

# File Upload Directory (create this folder)
file.upload-dir=/path/to/uploads
```

### Step 4: Build the Application

```bash
mvn clean install
```

### Step 5: Run the Application

```bash
mvn spring-boot:run
```

The application will start at `http://localhost:8080`

## Default Login Credentials

After first run, the system creates these default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civic.gov | admin123 |
| Worker | worker@civic.gov | worker123 |
| User | user@example.com | user123 |

**Important**: Change these passwords in production!

## Project Structure

```
smart-civic-complaint-system/
├── src/
│   ├── main/
│   │   ├── java/com/civic/
│   │   │   ├── config/          # Security & Web configuration
│   │   │   ├── controller/      # MVC Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── repository/      # Spring Data Repositories
│   │   │   ├── service/         # Business Logic Services
│   │   │   └── SmartCivicComplaintSystemApplication.java
│   │   └── resources/
│   │       ├── templates/       # Thymeleaf HTML templates
│   │       │   ├── admin/       # Admin pages
│   │       │   ├── auth/        # Login/Register pages
│   │       │   ├── user/        # Citizen pages
│   │       │   ├── worker/      # Worker pages
│   │       │   └── error/       # Error pages
│   │       ├── application.properties
│   │       └── schema.sql       # Database schema
│   └── test/                    # Unit tests
├── pom.xml
└── README.md
```

## Complaint Categories

- Roads & Infrastructure
- Water Supply
- Electricity
- Sanitation & Waste
- Public Safety
- Parks & Recreation
- Building & Construction
- Drainage & Sewage
- Street Lighting
- Noise Pollution
- Other

## Complaint Priority Levels

| Priority | Response Time | Color Code |
|----------|---------------|------------|
| CRITICAL | 24 hours | Red |
| HIGH | 3 days | Orange |
| MEDIUM | 7 days | Blue |
| LOW | 14 days | Gray |

## API Endpoints (For Reference)

### Public
- `GET /` - Home page
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /register` - Registration page
- `POST /register` - Create new user

### User (Citizen)
- `GET /user/dashboard` - User dashboard
- `GET /user/submit-complaint` - Complaint form
- `POST /user/submit-complaint` - Submit complaint
- `GET /user/my-complaints` - View complaints
- `GET /user/track/{complaintNumber}` - Track complaint

### Admin
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/complaints` - All complaints
- `GET /admin/complaint/{id}` - Complaint details
- `POST /admin/complaint/{id}/assign` - Assign to worker
- `GET /admin/workers` - Manage workers
- `GET /admin/users` - Manage users

### Worker
- `GET /worker/dashboard` - Worker dashboard
- `GET /worker/assignments` - View assignments
- `GET /worker/assignment/{id}` - Assignment details
- `POST /worker/assignment/{id}/update` - Update status

## Security Features

- BCrypt password hashing
- CSRF protection
- Session management
- Role-based access control (RBAC)
- Secure remember-me functionality
- XSS prevention via Thymeleaf escaping

## Customization

### Adding New Categories

Edit the category dropdown in:
- `src/main/resources/templates/user/submit-complaint.html`
- `src/main/resources/templates/admin/complaints.html`

### Changing Theme Colors

Modify Bootstrap variables or add custom CSS in `layout.html`.

### Email Notifications (Optional)

Uncomment and configure email settings in `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in application.properties
   - Ensure database exists

2. **Port Already in Use**
   - Change port: `server.port=8081` in application.properties

3. **File Upload Errors**
   - Ensure upload directory exists
   - Check write permissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Open a GitHub Issue
- Email: support@civic-complaints.com

---

**Developed for BTech Cloud Computing Project**

*Smart Civic Complaint Management System - Making civic engagement easier for everyone.*
