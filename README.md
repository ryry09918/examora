# Examora

A Vercel-ready mock-exam and diagnostic landing page. The interface is static HTML/CSS/JavaScript; `api/index.py` is a small Flask backend that creates and grades practice sets.

## Deploy to Vercel

1. Push this folder to a Git repository and import it in Vercel, or run `vercel` from this directory.
2. Vercel detects the Python function from `api/index.py` and installs dependencies from `requirements.txt`.
3. Open the deployment URL. The frontend calls `/api/exam` and `/api/exam/grade` on the same domain.

## Local preview

For a static visual preview, open `public/index.html`. To exercise the API locally, install the requirements and run Flask with `flask --app api.index run`.
