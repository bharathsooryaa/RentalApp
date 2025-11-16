# Demo Users Setup

To properly test the sign-in functionality, you need to create demo users in Supabase Auth and link them to the database profiles.

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add User"**
4. **Create these demo accounts:**

### Manager Demo Account
- Email: `john.smith@example.com`
- Password: `Demo123!`
- Email confirmed: ✓

### Tenant Demo Account  
- Email: `carol.white@example.com`
- Password: `Demo123!`
- Email confirmed: ✓

## Option 2: Using SQL (after creating auth users)

After creating the auth users, you need to update the database to link them:

```sql
-- First, get the user IDs from auth.users table
SELECT id, email FROM auth.users WHERE email IN ('john.smith@example.com', 'carol.white@example.com');

-- Update manager table with the correct cognito_id from auth.users
UPDATE manager 
SET cognito_id = 'YOUR_AUTH_USER_ID_FOR_JOHN_SMITH'
WHERE email = 'john.smith@rentalmanager.com';

-- Update tenant table with the correct cognito_id from auth.users  
UPDATE tenant
SET cognito_id = 'YOUR_AUTH_USER_ID_FOR_CAROL_WHITE'
SET email = 'carol.white@example.com'
WHERE id = 3; -- Carol Williams entry
```

## Option 3: Create New Database Entries

Alternatively, you can create new entries that match the auth users:

```sql
-- Get the auth user IDs first
SELECT id, email FROM auth.users WHERE email IN ('john.smith@example.com', 'carol.white@example.com');

-- Insert new manager record
INSERT INTO manager (cognito_id, name, email, phone_number) 
VALUES ('YOUR_AUTH_USER_ID_FOR_JOHN_SMITH', 'John Smith', 'john.smith@example.com', '+1-555-0106');

-- Insert new tenant record
INSERT INTO tenant (cognito_id, name, email, phone_number)
VALUES ('YOUR_AUTH_USER_ID_FOR_CAROL_WHITE', 'Carol White', 'carol.white@example.com', '+1-555-1011');
```

## Testing

1. Set up your Supabase environment variables in `.env.local`
2. Create the demo users as described above
3. Try signing in with:
   - `john.smith@example.com` / `Demo123!` (Manager)
   - `carol.white@example.com` / `Demo123!` (Tenant)

## Environment Variables

Make sure to update your `.env.local` file with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

You can find these values in your Supabase project settings under "API".