# Database Connection Information

## DigitalOcean PostgreSQL Cluster

- **Cluster ID**: `2ff23557-e61b-44ae-a7b3-290f0fcb7de2`
- **Cluster Name**: `companion-platform-db`
- **Engine**: PostgreSQL 16.0
- **Status**: ✅ Online

## Connection Details

```
Host: companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
Port: 25060
Database: defaultdb
User: doadmin
SSL: Required (sslmode=require)
```

## Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://doadmin:<PASSWORD>@companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Individual Components (alternative to DATABASE_URL)
DB_HOST=companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=<PASSWORD>
DB_SSL=require
```

## Local Connection (psql)

```bash
psql "postgresql://doadmin:<PASSWORD>@companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

## Node.js Connection (pg library)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com',
  port: 25060,
  database: 'defaultdb',
  user: 'doadmin',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Required for DigitalOcean
  },
});
```

## Next Steps

1. ✅ Database cluster created and online
2. ⏳ Execute schema from `db/schema-multi-tenant.sql`
3. ⏳ Add connection pool to backend API
4. ⏳ Test queries from API endpoints

## Security Notes

- **Never commit the password** to version control
- Store password in `.env` file (already in `.gitignore`)
- Use environment variables in production
- SSL is **required** for all connections
- Consider creating separate database users with limited permissions for different services

## Management

- Access via DigitalOcean Console: https://cloud.digitalocean.com/databases
- Use `doctl databases` CLI commands for management
- Monitor performance and connection pools via DO dashboard
