# HEARTBEAT.md

## Check Supabase Inbox
- Query `signups` and `feedback` tables for new entries (status='new')
- If anything new: notify Tawfeeq on Telegram immediately
- Flag business inquiries, bug reports, or anything urgent
- Mark reviewed items (update status via service_role key)
- Silent if nothing new
