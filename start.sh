#!/bin/bash

echo "Pornesc backend-ul..."
cd backend
source ../venv/bin/activate
python3 app.py &

echo "Pornesc frontend-ul..."
cd ../frontend
npm run dev -- --host 0.0.0.0

// Pentru a porni, foloseste: ./start.sh