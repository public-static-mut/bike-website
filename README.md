# Bike Business Scheduler

Simple full-stack website for:
- Customer bike pickup scheduling
- Phone number capture on every booking
- Admin management dashboard for repair workflow and pricing

## What It Includes

- Public booking page: `/`
  - Customer name, phone, pickup address, preferred date/time, repair details
  - Pricing list shown to customers
- Admin dashboard: `/admin`
  - Login with password
  - View and filter bookings by status
  - Update booking status, quote, and internal notes
  - Manage pricing items (add, deactivate, delete)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export ADMIN_PASSWORD='Fun132230!'
export COOKIE_SECRET='Fun132230!e'
export RESEND_API_KEY='re_xxx'
export BOOKING_EMAIL_TO='you@yourdomain.com'
export BOOKING_EMAIL_FROM='Bike Business <bookings@yourdomain.com>'
# Optional: send bookings by email and skip DB booking writes
# export BOOKING_EMAIL_ONLY='true'
```

3. Start server:
```bash
npm start
```

4. Open:
- Customer page: `http://localhost:3000/`
- Admin page: `http://localhost:3000/admin`

## Default Pricing Seed

The app creates starter pricing in SQLite at `data/bike_business.db`.
The default list is intentionally budget-friendly (slightly lower baseline than common full-service shop pricing).
You can change this anytime in the admin dashboard.

## Booking Statuses

- Scheduled
- Picked Up
- In Repair
- Ready
- Completed

## Production Notes

- Change `ADMIN_PASSWORD` and `COOKIE_SECRET` before public deployment.
- Add HTTPS and reverse proxy (Nginx/Caddy) in production.
- Add SMS integration (Twilio, etc.) if you want automatic pickup confirmations.

## Email Booking Mode (No DB Server Needed)

- This app already uses SQLite file storage (`data/bike_business.db`) and does **not** require a separate database server.
- If you only want bookings by email:
  - Set `RESEND_API_KEY`, `BOOKING_EMAIL_TO`, and `BOOKING_EMAIL_FROM`.
  - Set `BOOKING_EMAIL_ONLY=true`.
  - New bookings will be emailed to you and skip booking DB inserts.
