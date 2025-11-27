# Firebase Setup Guide - Perpustakaan Arcadia

## Step 1: Create Firebase Project

1. Go to https://firebase.google.com/
2. Click **"Get Started"** or **"Go to console"**
3. Click **"Create a project"**
4. Enter project name: `perpustakaan-arcadia` (or your choice)
5. Click **"Continue"**
6. Disable Google Analytics (optional, for simplicity) → **"Create project"**
7. Wait for project creation (~2 minutes)

## Step 2: Set Up Firestore Database

1. In Firebase Console, click **"Firestore Database"** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose region closest to you (e.g., `asia-southeast1` for Indonesia)
5. Click **"Create"**

## Step 3: Set Up Authentication

1. Click **"Authentication"** (left sidebar)
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Enable **"Email/Password"** toggle
5. Click **"Save"**

## Step 4: Get Firebase Config

1. Click **"Project Settings"** (gear icon)
2. Go to **"Your apps"** section
3. Click **"</>" (Web icon)** to create a web app
4. Enter app name: `my-app`
5. Click **"Register app"**
6. Copy the config object (you'll use this next)

Your config will look like:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Install Firebase in React

```powershell
cd "c:\Work\UJIKOM JWP\ProyekWeb\frontend\my-app"
npm install firebase
```

## Step 6: Create Firestore Security Rules

1. In Firebase Console, go to **"Firestore Database"** → **"Rules"**
2. Replace rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read for books
    match /buku/{document=**} {
      allow read: if true;
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Create Firestore Collections

In Firestore Database, create these collections:

### 1. **peminjam** collection
```
Document fields:
- idPeminjam (string) - unique ID
- namaPeminjam (string)
- userPeminjam (string) - username
- passPeminjam (string) - stored by Auth, keep empty in Firestore
- tglDaftar (timestamp)
- fotoPeminjam (string) - URL to image
- statusPeminjam (boolean) - true/false
- email (string) - for Firebase Auth
```

### 2. **admin** collection
```
Document fields:
- idAdmin (string) - unique ID
- namaAdmin (string)
- userAdmin (string) - username
- passAdmin (string) - stored by Auth
- email (string) - for Firebase Auth
```

### 3. **buku** collection
```
Document fields:
- idBuku (string) - unique ID
- judulBuku (string)
- namaPengarang (string)
- namaPenerbit (string)
- tglTerbit (timestamp)
```

### 4. **peminjaman** collection
```
Document fields:
- kodePinjam (string) - unique ID
- idPeminjam (string) - reference to peminjam
- tglPesan (timestamp)
- tglAmbil (timestamp)
- tglWajibKembali (timestamp)
- tglKembali (timestamp) - nullable
- statusPinjam (string) - "A", "S", "L", or "B"
```

### 5. **detailPeminjaman** collection
```
Document fields:
- id (string) - unique ID
- kodePinjam (string) - reference to peminjaman
- idBuku (string) - reference to buku
```

## You're All Set!

Next: We'll create the Firebase config file for your React app and update components to use Firestore.
