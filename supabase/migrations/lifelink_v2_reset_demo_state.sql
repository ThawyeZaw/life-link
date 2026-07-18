-- ============================================================================
-- LifeLink v2 — Reset demo state (re-run anytime before a pitch/demo)
-- Clears matches, reopens requests, lifts donor cooldowns.
-- ============================================================================

delete from public.matches;

update public.requests
set status = 'OPEN'
where status in ('MATCHED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

update public.profiles
set last_donation_date = null,
    is_available = true
where account_type = 'individual';
