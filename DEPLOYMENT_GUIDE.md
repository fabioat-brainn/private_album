# Deployment Guide: Going Live! 🚀

Congratulations on building your digital album! Here is a step-by-step guide to deploying your application to the web using **Vercel** (for hosting the site) and **Supabase** (your existing database).

## Prerequisites
- A [GitHub Account](https://github.com/) (to save your code).
- A [Vercel Account](https://vercel.com/) (to host your site).

---

## Step 1: Save your Code to GitHub
We need to upload your project code to GitHub so Vercel can access it.

1.  **Initialize Git** (if you haven't done this locally):
    Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit - Ready for deploy"
    ```

2.  **Create a Repository on GitHub**:
    - Go to [GitHub.com](https://github.com/new).
    - Create a new repository (name it `christmas-album` or similar).
    - **Do not** check "Add a README" or `.gitignore` (you already have them).

3.  **Push your code**:
    - GitHub will show you commands under "…or push an existing repository from the command line". They look like this (copy and run them in your terminal):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Deploy to Vercel
Vercel will take your code from GitHub and turn it into a live website.

1.  Log in to [Vercel](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select **"Continue with GitHub"**.
4.  Find your `christmas-album` repository and click **"Import"**.

---

## Step 3: Configure Environment Variables (Crucial!)
Your live site needs to know how to connect to Supabase, just like your local one did.

1.  On the Vercel import screen, look for **"Environment Variables"**.
2.  Add the following two variables (you can find these values in your local `.env` file or your Supabase Project Settings -> API):

    - **Name**: `VITE_SUPABASE_URL`
      - **Value**: *Your Supabase Project URL* (e.g., `https://xyz.supabase.co`)
    
    - **Name**: `VITE_SUPABASE_KEY`
      - **Value**: *Your Supabase Anon Public Key*

3.  Click **"Deploy"**.
    - Vercel will verify the build. Wait about a minute.
    - Once done, you’ll get a **Deployment URL** (e.g., `https://christmas-album.vercel.app`). **Copy this URL.**

---

## Step 4: Update Supabase Authentication
Supabase needs to know that your new Vercel website is allowed to log users in.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your Project.
3.  Go to **Authentication** -> **URL Configuration**.
4.  **Site URL**: Change this from `http://localhost:5173` to your **new Vercel URL** (e.g., `https://christmas-album.vercel.app`).
5.  **Redirect URLs**: Add your Vercel URL here as well (ensure `https://christmas-album.vercel.app/**` is allowed if needed).
6.  Click **Save**.

---

## 🎉 You're Live!
Visit your Vercel URL on your phone or computer. Your shared album is now accessible from anywhere!
