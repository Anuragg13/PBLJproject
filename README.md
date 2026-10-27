# Campus Event Registration API

REST API for the Student Practical Assignment.

## Requirements
- Node.js (18 or later recommended)
- MongoDB running locally, or a MongoDB Atlas connection string
- Postman or Thunder Client (optional, for testing)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URI` in `.env` to your MongoDB connection string.
4. Start the API:
   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000`.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/registrations` | Create registration |
| GET | `/api/registrations` | List registrations |
| GET | `/api/registrations?eventType=ROBOTICS` | Filter by event type |
| GET | `/api/registrations?status=CONFIRMED` | Filter by status |
| GET | `/api/registrations/:id` | Get one registration |
| PUT | `/api/registrations/:id` | Update registration |
| DELETE | `/api/registrations/:id` | Delete registration |

## Example POST body
```json
{
  "studentName": "Aarav Sharma",
  "collegeEmail": "aarav.cs24@institute.ac.in",
  "rollNumber": "24CSB102",
  "eventType": "CODING_HACKATHON",
  "teamSize": 3,
  "ticketPrice": 600,
  "discountCode": "CAMPUS50"
}
```

Expected final amount: `300`.

## Business rules
- `CAMPUS50`: 50% off.
- `EARLYBIRD`: subtract 100, but never below 0.
- Other non-empty discount codes are rejected.
- `AI_WORKSHOP` must have `teamSize` exactly `1`.
- Duplicate college emails return HTTP 409.
- Validation errors return HTTP 400.
- Invalid registration IDs return HTTP 400.

Note: DELETE permanently removes a registration, as allowed by the assignment wording.
