# CulinAIry Express App

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#description">Description</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#how-to-run-the-project">How to run the project</a></li>
      </ul>
    </li>
    <li>
      <a href="#endpoints">Endpoints</a>
    </li>
  </ol>
</details>


## About The Project
### Description
This is a backend service for the CulinAIry mobile app. It is a RESTful API that provides CRUD operations for Transactions, Products, and Users.

### Built With
* [![Node.js][Node.js]][Node.js-url]
* [![Express.js][Express.js]][Express.js-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Firebase][Firebase]][Firebase-url]
* [![Docker][Docker]][Docker-url]



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm (Node package manager)

### How to run the project

1. Clone the repo
   ```sh
   git clone https://github.com/bernarduswillson/bangkit_backend.git 
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the project
   ```sh
    npm start
    ```



<!-- ENDPOINTS -->
## Endpoints
- Transactions
  - GET /transactions
  - GET /transactions/:id
  - POST /transactions
  - PUT /transactions/:id
  - DELETE /transactions/:id
  - POST /transactions/ocr
- Products
  - GET /products
  - GET /products/:id
  - POST /products
  - PUT /products/:id
  - DELETE /products/:id
- Users
  - POST /users/register
  - POST /users/login




[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white
[Node.js-url]: https://nodejs.org/en/
[Express.js]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express.js-url]: https://expressjs.com/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Firebase]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black
[Firebase-url]: https://firebase.google.com/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/