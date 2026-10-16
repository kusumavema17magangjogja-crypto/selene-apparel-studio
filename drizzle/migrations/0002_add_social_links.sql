ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS tiktok text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube text NOT NULL DEFAULT '';

UPDATE public.store_settings SET tiktok = '@seleneapparel', facebook = 'seleneapparel' WHERE id = 1;