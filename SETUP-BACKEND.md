# Turn on customer login, reviews and saved enquiries

GitHub Pages can only show pages. To save customer details and reviews, the site uses **Supabase**, a free online database. Until you do this, the site works normally but Login says "coming soon" and Reviews show "will appear soon".

## 1. Create the project (10 minutes)
1. Go to **supabase.com**, click **Start your project** and sign in (you can use your GitHub account).
2. Click **New project**. Name: `lupin-craftings`. Choose a strong database password and save it somewhere safe. Region: **South Asia (Mumbai)**. Click **Create new project** and wait about two minutes.

## 2. Create the tables
1. In the left menu click **SQL Editor**, then **New query**.
2. Open the file `supabase-setup.sql` from this site, copy everything, paste it in, and click **Run**. You should see "Success".

## 3. Connect the website
1. In Supabase go to **Project Settings > API** (or **Data API**).
2. Copy the **Project URL** and the **anon public** key. (Never use the `service_role` key on the website.)
3. On GitHub open `js/content.js`, find `window.LC_BACKEND`, and paste the two values between the quotes. Commit the change.

## 4. Tell Supabase your website address
1. Go to **Authentication > URL Configuration**.
2. Set **Site URL** to your live address (for example `https://www.lupincraftings.com`, or your GitHub link until the domain works).
3. Under **Redirect URLs** add the same address followed by `/**`.
   This makes the confirmation and password reset emails open your site.

## 5. Make yourself the admin
1. On your website click **Login > Sign up** and create an account with the email you want to use as admin (confirm the email if it asks).
2. In Supabase **SQL Editor** run (use your own email):
   `insert into public.admins (email) values ('Lupincraftings@gmail.com');`
3. Log in on the website. **Open admin page** appears in your account box, or go to `/admin.html`.

## Using it every day
- **Approve reviews:** Admin > *Reviews to approve*. Read the review and photos, then **Approve and publish** or **Delete**. Nothing shows on the site until you approve it.
- **See customers and enquiries:** Admin > *Customers* / *Enquiries*. **Download as Excel / CSV file** saves a copy.
- You can also see all tables in Supabase under **Table Editor**.

## Good to know
- **Phone number is saved, not verified.** Login uses email and password. Checking phone numbers by SMS code needs a paid SMS service. Ask if you want that later.
- **Free plan:** Supabase pauses a free project after about a week with no activity. Visit the Supabase dashboard now and then, or restore it with one click if it pauses.
- **Email limits:** the free built-in email sender is slow and limited. If sign-up emails are not arriving, add your own email service under **Authentication > Emails > SMTP**.
- **Privacy:** you are storing customers' names, emails, phones and photos. Keep admin access to yourself, and add a short privacy policy page when you launch.
- Enquiry saving is optional. If it fails the WhatsApp or Instagram message still opens.
