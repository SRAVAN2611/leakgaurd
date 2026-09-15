<<<<<<< HEAD
# leakgaurd
=======
# LeakGuard AI – Pre-LLM Security Gateway

**LeakGuard AI** is an enterprise-grade pre-LLM security gateway designed to intercept, detect, rate, and sanitize sensitive data and prompt injection attacks in real time before inputs reach external Large Language Models (LLMs).

---

## Key Features

- **Deterministic Multi-Category Detection**:
  - **PII**: Social Security Numbers (SSN), Email Addresses, Phone Numbers, Credit Cards, IPv4/IPv6 Addresses.
  - **Secrets & API Keys**: AWS Access/Secret Keys, GitHub PATs, Stripe Secret Keys, OpenAI Keys, Slack Tokens, Google API Keys.
  - **Credentials & Passwords**: Hardcoded password/secret variable assignments and authentication tokens.
  - **JWT Tokens**: Three-part JWT bearer token structures.
  - **Private Keys**: RSA, OPENSSH, EC, and DSA private key blocks.
  - **Database Connection Strings**: Connection URLs for PostgreSQL, MySQL, MongoDB, Redis, RabbitMQ.
  - **Prompt Injection & Safety**: Instruction overrides, system prompt extraction attempts, DAN/jailbreak roleplay, and suspicious directives.
- **Multimodal Scanner**: Support for Text, Code, and Image (OCR text extraction via `pytesseract` and `PIL`).
- **Deterministic Risk Scoring Engine**: Calculates normalized 0–100 risk score and severity level (`Low`, `Medium`, `High`, `Critical`).
- **Database-Driven Policy Engine**: Real-time evaluation against configurable security policies (`ALLOW`, `WARN`, `REDACT`, `BLOCK`).
- **Context-Aware Sanitization**: Masking sensitive matches (`[REDACTED_<CATEGORY>]`) while preserving context.
- **Live Security Analytics**: Backend SQL aggregations for scan history, threat category distribution, risk score trends, and latency metrics.

---

## Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyTesseract, PIL, Pytest
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS, Recharts, Lucide Icons, Axios
- **Database**: SQLite (default `sqlite:///./leakguard.db`) or PostgreSQL

---

## Getting Started

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Alembic migrations to initialize database schema
alembic upgrade head

# Start FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```powershell
# In the project root directory
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## Running Automated Tests

To execute the full backend unit test and REST API test suite:

```powershell
cd backend
pytest -v
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & database connection status |
| `POST` | `/api/v1/scans/text` | Scan text prompt for security threats |
| `POST` | `/api/v1/scans/code` | Scan source code for hardcoded secrets |
| `POST` | `/api/v1/scans/image` | Scan image via OCR for embedded text/secrets |
| `GET` | `/api/v1/scans` | List paginated security scans with filters |
| `GET` | `/api/v1/scans/{id}` | Get detailed scan record by ID |
| `GET` | `/api/v1/policies` | Get all security policies |
| `POST` | `/api/v1/policies` | Create new security policy |
| `PATCH` | `/api/v1/policies/{id}/status` | Toggle policy enabled state |
| `DELETE` | `/api/v1/policies/{id}` | Delete security policy |
| `GET` | `/api/v1/analytics/overview` | Get aggregated security analytics metrics |
| `GET` | `/api/v1/settings` | Get system sensitivity & detector settings |
| `POST` | `/api/v1/settings` | Update system sensitivity & detector settings |

---

## License

MIT License. Built for enterprise AI protection and research.
>>>>>>> e93ce19 (Initial commit: LeakGuard AI Pre-LLM Multimodal Security Gateway complete codebase and research evaluation)
