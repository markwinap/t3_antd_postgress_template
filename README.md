# T3 Stack + Ant Design + Postgress + RDS

## Docker

### Create And Run Docker Image
```sh
docker run --name t3_antd_potgress_prisma_nextauth_postgres -e POSTGRES_PASSWORD=Password123 -e POSTGRES_DB=prisma_db -d -p 5432:5432 docker.io/postgres
```
### Start Existing Docker Image
```sh
docker start t3_antd_potgress_prisma_nextauth_postgres
```

## Prisma

### Push DB Schema
```sh
npx prisma db push
```

### DEV Only
- Reruns the existing migration history in the shadow database in order to detect schema drift (edited or deleted migration file, or a manual changes to the database schema)
- Applies pending migrations to the shadow database (for example, new migrations created by colleagues)
- Generates a new migration from any changes you made to the Prisma schema before running migrate dev
- Applies all unapplied migrations to the development database and updates the _prisma_migrations table
- Triggers the generation of artifacts (for example, Prisma Client)

```sh
npx prisma migrate dev --name added_job_title
```