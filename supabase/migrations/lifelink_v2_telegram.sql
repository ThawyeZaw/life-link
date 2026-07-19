-- Add Telegram chat_id to profiles so donors can receive instant alerts
alter table public.profiles
  add column if not exists telegram_chat_id bigint unique;

comment on column public.profiles.telegram_chat_id is
  'Telegram user chat_id, set when a donor links their account via the LifeLink bot.';
