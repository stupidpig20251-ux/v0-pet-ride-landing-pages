-- Add user_id column to link waitlist entries with authenticated users
ALTER TABLE waitlist ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to allow users to insert their own waitlist data
DROP POLICY IF EXISTS "Allow public waitlist insertion" ON waitlist;

CREATE POLICY "Allow authenticated waitlist insertion" ON waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow users to view their waitlist entries" ON waitlist
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
