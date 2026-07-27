# Agentic AI Trading Platform Backend

This directory houses the Python FastAPI backend designed to orchestrate the AI Agentic workflow (using LangGraph in future phases).

## Project Structure

- `main.py`: Entry point for the FastAPI application.
- `core/`: Base configurations, settings, security.
- `api/`: API Routers and controller endpoints.
- `agents/`: Python-based agents (Supervisor, Technical, Sentiment, etc.).
- `models/`: Database & Pydantic models.
- `services/`: Internal business services.
- `memory/`: Short & Long-term memory components.
- `tools/`: Python tools for agents (execution, risk validation, market queries).

## Running Locally

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`. You can inspect the interactive documentation at `http://localhost:8000/docs`.
