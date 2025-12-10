# Brevo (formerly Sendinblue) Setup Guide

This guide explains how to set up Brevo as your email service. This is a great alternative to Resend if you don't have a custom domain but want to send emails to users.

## Why Brevo?

*   ✅ **Works on Render:** Uses HTTPS API (no blocked ports).
*   ✅ **Free Tier:** 300 emails/day (generous!).
*   ✅ **Single Sender:** You can verify just your Gmail address and send to anyone (solves the "Resend Domain Problem").

---

## Step 1: Sign Up

1.  Go to **[Brevo Sign Up](https://onboarding.brevo.com/account/register)**.
2.  Create a free account.
3.  Fill in your details (User "Student Network" as company name).
4.  Choose the **Free Plan** (skip payment details).

---

## Step 2: Get API Key

1.  Log in to your dashboard.
2.  Click on your name (top right) > **SMTP & API**.
3.  Or go directly to: **[API Keys](https://app.brevo.com/settings/keys/api)**.
4.  Click **"Generate a new API key"**.
5.  Name it (e.g., "StudentNetworkRender").
6.  **Copy the key** (`xkeysib-xxxxxxxx...`). Save it!

---

## Step 3: Verify Your Sender Email

This is the **most important step** to send emails without a domain.

1.  Go to **[Senders & IPs](https://app.brevo.com/settings/senders)**.
2.  You should see your signup email (e.g., `adixxx.0x69@gmail.com`) already listed.
3.  If it says "Verified", you are good!
4.  If not, click "Verify" and check your inbox.
5.  **Note:** This email (`adixxx.0x69@gmail.com`) will be the `EMAIL_FROM` address.

---

## Step 4: Configure Local Environment (`.env`)

Update your local `.env` file to test Brevo:

```env
EMAIL_SERVICE=brevo
BREVO_API_KEY=xkeysib-your-long-api-key-here
EMAIL_FROM=adixxx.0x69@gmail.com
```

*(Note: `EMAIL_FROM` must exactly match the verified sender in Brevo)*.

---

## Step 5: Configure Render (Production)

1.  Go to your **Render Dashboard**.
2.  Select your **Backend Service**.
3.  Go to **Environment**.
4.  Add/Update these variables:

| Key | Value |
| :--- | :--- |
| `EMAIL_SERVICE` | `brevo` |
| `BREVO_API_KEY` | `xkeysib-your-key...` |
| `EMAIL_FROM` | `adixxx.0x69@gmail.com` |

5.  Save. Render will redeploy.

---

## Troubleshooting

### "Sender not allowed" Error
*   Make sure `EMAIL_FROM` in your .env matches EXACTLY the email you verified in Brevo Senders list.

### 401 Unauthorized
*   Check that you copied the full API key (`xkeysib-...`).

### Emails going to Promotions/Spam
*   This is normal for free Gmail sending without a domain.
*   For professional delivery, verify a custom domain later.
