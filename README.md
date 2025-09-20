
# Lead Management System

A full-stack Lead Management System built with **Node.js**, **Express**, and **React**. This project allows businesses to efficiently manage and track leads, automate workflows, and visualize lead data.

---

## Project Structure

lead-management-app/
├── frontend/ # React frontend
│ ├── public/
│ ├── src/
│ ├── package.json
│ ├── package-lock.json
│ └── README.md
├── backend/ # Node.js/Express backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── utils/
│ ├── server.js
│ ├── package.json
│ └── package-lock.json
├── config/ # Configuration files
├── .env # Environment variables
├── README.md
└── LICENSE

yaml
Copy code

---

## Features

- Manage leads with **CRUD operations**  
- Organize leads by status, source, and priority  
- Track lead history and updates  
- Interactive frontend built with **React**  
- RESTful API backend with **Node.js** and **Express**  
- Modular codebase for scalability  
- Configurable via environment variables  

---

## Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express.js, MongoDB (or your DB choice)  
- **Authentication:** JWT (optional)  
- **Tools:** npm, Postman, Git/GitHub  

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/oaniruddh/lead-management-system.git
cd lead-management-app
2. Backend Setup
bash
Copy code
cd backend
npm install
cp .env.example .env
# Configure your environment variables
node server.js
3. Frontend Setup
bash
Copy code
cd frontend
npm install
npm start
The frontend should now run on http://localhost:3000

The backend should run on http://localhost:5000 (or configured port)

Environment Variables
Create a .env file in the backend folder with the following variables:

ini
Copy code
PORT=5000
DB_URI=<your-database-uri>
JWT_SECRET=<your-secret-key>
Contributing
Fork the repository

Create a feature branch (git checkout -b feature-name)

Commit your changes (git commit -m "Add feature")

Push to branch (git push origin feature-name)

Open a Pull Request

License
This project is licensed under the MIT License.

Author
Aniruddh Ojha
