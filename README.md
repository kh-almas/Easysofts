## Project Setup Guide

#### 1) Clone / Pull the Repository
```bash
git clone https://github.com/kh-almas/Easysofts.git
cd <PROJECT_FOLDER>
```

#### 2) Install PHP Dependencies
```bash
composer install
```

#### 3) Install Frontend Dependencies & Run Vite
```bash
npm install
npm run dev
```

#### 4) Run Migrations
```bash
php artisan migrate
```

#### 5) Seed Module Data (Factory Module)
```bash
php artisan module:seed Factory
```

#### 6) Run Database Seeders
```bash
php artisan db:seed
```
