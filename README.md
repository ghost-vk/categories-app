# Categories App

## Deploy instructions:

1. Change directory to /app

`cd app`

2. Install dependencies

`npm install`

3. Build project

`npm run build`

4. Change directory back to root

`cd ..`

5. Build Docker images

`docker compose build`

6. Start project

`docker compose up`

7. If you want to seed database, you can use dump in db folder

`cat db/dump.sql | docker exec -i categories_db psql -U cat -d categories`
