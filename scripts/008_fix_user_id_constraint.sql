-- Fix user_id constraint for demo usage without auth
ALTER TABLE journal_entries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;

-- Update RLS policies to be more permissive for demo usage
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

-- Create more permissive policies for demo usage
CREATE POLICY "Allow all operations on journal entries" ON journal_entries
  FOR ALL USING (true) WITH CHECK (true);
