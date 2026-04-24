#!/bin/bash

echo "Pornesc backend-ul..."
source backend/venv/bin/activate
python backend/app.py &

echo "Pornesc frontend-ul..."
cd frontend
npm run dev -- --host 0.0.0.0

// Pentru a porni, foloseste: ./start.sh npm run dev