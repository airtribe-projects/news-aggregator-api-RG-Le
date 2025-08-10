# News Aggregator API

A Node.js Express REST API for user authentication, preferences, and news aggregation.  
Supports user signup, login, JWT authentication, user preferences, and fetching news articles from GNews API.

---

## Features

- User Signup & Login (with JWT authentication)
- User Preferences (categories, etc.)
- Fetch personalized news based on preferences
- Fetch top news if no preferences set
- Secure endpoints with middleware
- Simple file-based user storage (JSON)
- Comprehensive test suite using [tap](https://www.node-tap.org/) and [supertest](https://github.com/visionmedia/supertest)

---

## Folder Structure

```
.
├── app.js
├── src
│   ├── controllers
│   ├── data
│   ├── middlewares
│   ├── models
│   ├── routes
│   └── utils
├── test
│   └── server.test.js
├── .env
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```sh
git clone <repo-url>
cd news-aggregator-api-RG-Le
```

### 2. Install dependencies

```sh
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_api_key
```

### 4. Start the server

```sh
npm start
```
or
```sh
node app.js
```

Server runs on [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### Auth

- `POST /users/signup`  
  `{ "name": "...", "email": "...", "password": "...", "preferences": [...] }`

- `POST /users/login`  
  `{ "email": "...", "password": "..." }`

### User Preferences

- `GET /users/preferences`  
  (Requires Bearer token)

- `PUT /users/preferences`  
  `{ "preferences": [...] }`  
  (Requires Bearer token)

### News

- `GET /news`  
  (Requires Bearer token)

---

## Running Tests

**Important:**  
Before running tests, make sure the user database file is empty.  
Open `src/data/userDB.json` and clear its contents to:

```json
[]
```

### Run the test suite

```sh
npx tap test\server.test.js
```
or
```sh
npm test
```

This will run all API endpoint tests using [tap](https://www.node-tap.org/) and [supertest](https://github.com/visionmedia/supertest).

---

## Notes

- All protected routes require a valid JWT token in the `Authorization` header:  
  `Authorization: Bearer <token>`
- User data is stored in `src/data/userDB.json`
- For development/testing only. Do not use in production as-is.

---

