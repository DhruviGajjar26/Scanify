<div align="center">

<br/>

```
███████╗ ██████╗ █████╗ ███╗   ██╗██╗███████╗██╗   ██╗
██╔════╝██╔════╝██╔══██╗████╗  ██║██║██╔════╝╚██╗ ██╔╝
███████╗██║     ███████║██╔██╗ ██║██║█████╗   ╚████╔╝ 
╚════██║██║     ██╔══██║██║╚██╗██║██║██╔══╝    ╚██╔╝  
███████║╚██████╗██║  ██║██║ ╚████║██║██║        ██║   
╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝        ╚═╝  
```

###  Smart Document Scanner & PDF Manager

<br/>

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Desktop-blueviolet?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

<br/>

> **Scanify** is a modern, full-stack document scanning and PDF management application.  
> Upload, scan, manage, and extract content from your documents and PDFs — all in one place.

<br/>

---

</div>

<br/>

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#️-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#️-installation)
- [Running the App](#️-running-the-app)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

<br/>

---

##  Features

<br/>

| Feature | Description |
|---|---|
| **Document Upload** | Upload and manage PDF and image documents |
| **PDF Text Extraction** | Extract and parse text content from PDF files |
| **Dashboard** | View and manage all your scanned documents |
| **Secure Backend** | Protected API with middleware authentication |
| **File Management** | Organize uploads with a clean file management system |
| **Fast & Responsive** | Optimized React frontend with smooth user experience |

<br/>

---

##  Tech Stack

<br/>

### Frontend
| Technology | Purpose |
|---|---|
| **React** | UI framework |
| **CSS / Tailwind** | Styling |
| **Axios** | API communication |
| **Context API** | State management |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **pdf-parse** | PDF text extraction |
| **Middleware** | Authentication & validation |


<br/>

---

##  Project Structure

```
Scanify/
│
├── 📁 backend/
│   ├── config/            # Database & app configuration
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # Auth & validation middleware
│   ├── models/            # Data models & schemas
│   ├── routes/            # API route definitions
│   └── uploads/           # Uploaded document storage
│
├── 📁 frontend/
│   ├── public/            # Static assets
│   └── src/
│       ├── api/           # API service calls
│       ├── assets/        # Images, icons, fonts
│       ├── components/
│       │   ├── common/    # Reusable UI components
│       │   ├── dashboard/ # Dashboard components
│       │   └── scanner/   # Scanner components
│       ├── context/       # React context providers
│       ├── pages/         # Application pages
│       └── types/         # TypeScript type definitions
│
├── 📁 electron/           # Electron desktop app config
│
├── package.json
└── README.md
```

<br/>

---

##  Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

<br/>

---

##  Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/Scanify.git
cd Scanify
```

**2. Install Backend dependencies**
```bash
cd backend
npm install
```

**3. Install Frontend dependencies**
```bash
cd ../frontend
npm install
```

**4. Install root dependencies**
```bash
cd ..
npm install
```

<br/>

---

##  Running the App

### Run Backend Server
```bash
cd backend
npm start
```
> Backend runs on `http://localhost:5000`

### Run Frontend (Web)
```bash
cd frontend
npm start
```
> Frontend runs on `http://localhost:3000`

<br/>

---

##  API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a document |
| `GET` | `/api/documents` | Get all documents |
| `GET` | `/api/documents/:id` | Get a specific document |
| `DELETE` | `/api/documents/:id` | Delete a document |
| `POST` | `/api/scan` | Extract text from PDF |

<br/>

---

##  Contributing

Contributions are always welcome! Here's how:

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "Add some AmazingFeature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

<br/>

---

##  License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

Made by **[Dhruvi Gajjar](https://github.com/DhruviGajjar26)**

**Star this repo if you found it helpful! :)** 

</div>
"small change" 
