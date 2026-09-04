# College Kit

A personal college organiser for timetables, flexible daily classes, and attendance tracking.

## Run with Docker

The complete production-style stack consists of an Expo Router web bundle served by Nginx and a Node + SQLite API. Nginx proxies the API at the same origin, so no browser CORS or API URL configuration is needed.

```sh
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The API is available through the web container at `http://localhost:8080/api/v1/*`, and its health check is at `http://localhost:8080/health`.

Stop the stack without deleting attendance data:

```sh
docker compose down
```

The SQLite database persists in the named `college-kit-data` Docker volume. To completely reset the seeded application data:

```sh
docker compose down -v
```

## Local development

Start the API and Expo development server in separate terminals:

```sh
npm run api
npm start
```

The local web app uses `http://localhost:4000/api/v1` by default. To use a physical device, point Expo at your computer's LAN IP:

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api/v1 npm start
```

## Backend

The API and its data model are documented in [`backend/README.md`](backend/README.md). It provides persistent recurring timetable rules, dated class overrides, attendance statuses, subjects, and attendance summaries.
