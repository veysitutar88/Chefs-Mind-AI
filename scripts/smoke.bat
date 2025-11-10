@echo off 
cd frontend-enhanced 
npm run build 
npx next lint 
tsc -p . --noEmit 
