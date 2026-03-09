Textoria API 📝
Textoria is a robust, full-stack blogging backend built with Node.js, Express, and Prisma. It features advanced content management, secure authentication, and a dynamic categorization system, all hosted on Render with a Neon PostgreSQL database.

🚀 Live Demo
Base URL: https://textoria.onrender.com

🛠️ Tech Stack
Runtime: Node.js (v22+)

Framework: Express.js (v5)

Database: PostgreSQL (via Neon)

ORM: Prisma (v7) with new Config API

Auth: JWT (JSON Web Tokens) & Bcrypt

File Storage: Cloudinary (via Multer)

Validation: Zod

🔑 Key Features
User Auth: Secure registration, login, and profile management.

Advanced Content Logic: * Draft vs. Published states.

Automatic "Read Time" calculation.

View count tracking.

Social Interactions: Like/Unlike posts and threaded comments.

Smart Categorization: Uses Prisma's connectOrCreate logic to manage post categories efficiently.

Cloud Integration: Automatic image upload to Cloudinary with smart deletion of old assets on update.

🚀 Live Demo
Base URL: https://textoria-91fv.onrender.com

🛣️ API Endpoints
1. Authentication (/auth)
2. Posts (/posts)
3. Users & Profiles (/users & /profile)
4. Comments (/comments)

⚙️ Environment Variables
To run this project locally, create a .env file in the root directory:

🛠️ Installation & Setup
Clone the repo:

Install dependencies:

Generate Prisma Client:

Run Migrations:

Start the server:

📄 License
Distributed under the ISC License.
