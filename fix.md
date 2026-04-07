Context: I have a Node.js + Firebase backend deployed on Vercel. New users signing up on my website are not receiving welcome emails. The app uses Brevo (formerly Sendinblue) as the SMTP relay via nodemailer. The welcome email system lives in src/utils/sendEmail.js and is triggered by the /api/v1/users/sync endpoint in userRoutes.js. The email is gated by a welcomeEmailSent boolean flag in Firebase Firestore.

Task: Diagnose and fix the broken welcome email flow. Here is what I need you to do, step by step:

Step 1 — Audit src/utils/sendEmail.js:
- Confirm the SMTP_FROM override logic is correct. The FROM address sent to Brevo MUST equal BREVO_SMTP_USER. If SMTP_FROM is a Gmail address, it must be replaced with BREVO_SMTP_USER before the nodemailer transport is created, not after.
- Add a console.log at every key decision point: env var values on startup (mask the password), the resolved FROM address, the Firestore flag check result, and the final transporter.sendMail() result or error.
- Wrap the entire send block in a try/catch that logs the full error object (err.code, err.response, err.responseCode) so SMTP rejections are visible in logs.
- Ensure transporter.verify() is called before sendMail() and logs success or failure.

Step 2 — Audit the /api/v1/users/sync route:
- Confirm the route correctly calls the welcome email function after the Firestore user lookup.
- Confirm it only sets welcomeEmailSent: true in Firestore AFTER a confirmed successful send, not before.
- Add error logging so if the email fails, the flag is NOT set to true (preventing permanent lockout).

Step 3 — Fix the Firestore flag lockout:
- Write a one-time admin script (or a secure API endpoint protected by EMAIL_TEST_SECRET) that resets welcomeEmailSent to false for all users where the flag is true but the email was never actually delivered (i.e., created before the current date or before a given timestamp I can specify).

Step 4 — Environment variable validation on startup:
- Add a startup check in the email utility that throws a clear, descriptive error if BREVO_SMTP_USER, BREVO_SMTP_PASS, or SMTP_HOST are undefined or empty, so misconfiguration is caught immediately in Vercel logs rather than failing silently at send time.

Step 5 — Test the fix:
- Show me how to use the existing /api/v1/users/email-test endpoint with curl or Postman to verify the SMTP connection is working end-to-end before testing with a real signup.

Please show me the full corrected code for each file you modify.