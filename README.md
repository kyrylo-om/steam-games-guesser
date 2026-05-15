# Steam Games Guesser

This project consists of a React frontend and Django backend with a 24-hour game data cache.

## Project Structure

```
steam-games-guesser/
├── frontend/                # React + Vite application
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env
│   └── ...
├── backend/                 # Django application
│   ├── config/              # Django project settings
│   ├── games/               # Games API app
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/                # Python virtual environment
└── README.md
```

## Backend Setup

The backend handles Steam API requests and caches game data for 24 hours.

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Running the Backend

```bash
source venv/bin/activate
python manage.py runserver
```

The backend runs at `http://localhost:8000`

### API Endpoints

- `GET /api/games/fetch/?app_id=<id>` - Fetch game data by Steam app ID
  - Returns cached data if available and not expired (24 hours)
  - Fetches from Steam API and caches if not available

## Frontend Setup

The frontend makes requests to the backend for game data.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Frontend

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

During development, the Vite proxy forwards API requests to the backend.

## How It Works

1. **Frontend** requests game data by app ID (e.g., 440 for Team Fortress 2)
2. **Backend** checks if data exists in cache:
   - **If cached and fresh (< 24h old):** Returns cached data immediately
   - **If not cached or expired:**
     - Fetches from Steam Store API
     - Extracts necessary information (name, release date, price, genres, etc.)
     - Caches in database with timestamp
     - Returns data to frontend
3. **Frontend** displays the game information

## Running Both Simultaneously

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:5173`

## Cache Management

Game data is cached for 24 hours. To clear cache:

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

Then in the Django shell:
```python
from games.models import CachedGame
CachedGame.objects.all().delete()  # Clear all cache
CachedGame.objects.filter(app_id=440).delete()  # Clear specific game
```

## Future Enhancements

- Customize cached game data fields
- User authentication and profiles
- Advanced search/filtering
- Admin panel for cache management
- Deployment configuration
