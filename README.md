# JobFinder

JobFinder is a job search platform where users can explore job opportunities, apply filters, and apply for jobs. It connects job seekers with top employers, showcasing the latest job listings from verified companies. This app is built with React, Chakra UI, Firebase, and Firestore.

## Features

- **User-Friendly Interface**: Clean and modern UI using Chakra UI for responsive design.
- **Job Listings**: Users can browse and explore a variety of job listings from different industries.
- **Search and Filters**: Filter jobs by job title, location, and experience required.
- **FireStore Integration**: Real-time job data fetched from Firestore.
- **Responsive Design**: Fully responsive layout that works across various devices.

## Tech Stack

- **Frontend**:
  - React
  - Chakra UI
- **Backend**:
  - Firebase
  - Firestore Database for storing job listings.
- **Authentication**:
  - Firebase Authentication for secure login/signup functionality.
- **Routing**:
  - React Router for page navigation.

## Prerequisites

Before running this project locally, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

## Installation

Follow the steps below to get your local development environment up and running:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mohanseetha/jobfinder.git
   cd jobfinder

   ```

2. **Install dependencies**:

   ```bash
   npm install

   ```

3. **Firebase Configuration**:

- Go to Firebase Console, create a new Firebase project (or use an existing one).
- Set up Firestore and Firebase Authentication.
- Copy your Firebase configuration from the Firebase console and create a firebase.js file in the src directory, then paste your Firebase config as shown below:

  ```javascript
  import { initializeApp } from "firebase/app";
  import { getFirestore } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  export { db };
  ```

4. **Start the Development Server**:

- Run the following command to start the app locally:

  ```bash
  npm start
  ```

- This will start the React development server, and you can view the app at http://localhost:3000

## Firebase Firestore Setup

1. **Create a Firestore Collection for Jobs**:

- In the Firestore database, create a collection named jobs.
- Each document should represent a job listing with the following fields:
  - title: (string) The job title.
  - company: (string) The company offering the job.
  - location: (string) Job location.
  - skills: (array of strings) List of required skills.
  - experience: (string) The experience required for the job.

2. **Example Job Document**:

   ```json
   {
     "title": "Software Engineer",
     "company": "Tech Corp",
     "location": "San Francisco, CA",
     "skills": ["JavaScript", "React", "Node.js"],
     "experience": "3+ years"
   }
   ```

## Contributing

We welcome contributions to improve the functionality of this project. If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -am 'Add new feature').
5. Push to the branch (git push origin feature-branch).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License.
