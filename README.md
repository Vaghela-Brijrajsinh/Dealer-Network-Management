# 🏢 Dealer Network Management System

### A Full-Stack Web Application for Managing Dealers, Products, Orders, Payments and Deliveries

Dealer Network Management is a web-based application built to manage the
day-to-day operations between an administrator and registered dealers.
The system provides separate Admin and Dealer modules so administrators
can manage business data while dealers can browse products, place
orders, make payment submissions, track shipments and raise complaints.

The project uses **React + Vite** for the frontend and **Node.js,
Express.js, MongoDB and Mongoose** for the backend.

------------------------------------------------------------------------

## 📌 Project Overview

The application is designed around two main roles:

-   **Admin** -- manages dealers, product catalogue, categories, orders,
    payments, shipments, complaints and contact messages.
-   **Dealer** -- registers or logs in, views available products,
    manages a shopping cart, places orders, submits payment details,
    tracks shipments, raises complaints and manages profile information.

The backend exposes REST API endpoints under `/api`, while the frontend
uses React Router to navigate between public, administrator and dealer
pages.

------------------------------------------------------------------------

## ✨ Key Features

### 🛡️ Admin Module

Administrators can manage the main operations of the dealer network:

-   Admin dashboard
-   View dealer registration requests
-   Approve or block dealer accounts
-   Add dealers directly
-   View and manage registered dealers
-   Delete dealer records
-   Add, update and delete products
-   Upload product images
-   Manage product categories
-   Add and manage subcategories and product types
-   View and manage customer/dealer orders
-   Review and verify payment submissions
-   Manage shipment records and delivery status
-   View and update complaints
-   View and manage contact messages

### 🧑‍💼 Dealer Module

Registered dealers can use the dealer-side features:

-   Dealer registration
-   Login and OTP verification flow
-   Dealer dashboard
-   Browse available products
-   View product details and stock
-   Add products to cart
-   Place orders
-   View personal order history
-   View order details and status
-   Submit payment information and transaction/UTR details
-   View shipment information
-   Track delivery status
-   Raise complaints related to orders/products
-   View personal complaints and their status
-   Manage dealer profile

### 📦 Product Management

-   Product creation and editing
-   Product name, category, subcategory and product type
-   Price and stock management
-   Product description
-   Product image upload
-   Active/Inactive product status
-   Product listing for the Admin module
-   Dealer product listing endpoint

### 🛒 Order Management

-   Dealers can submit orders containing product items and quantities.
-   The backend checks product records and stock before creating an
    order.
-   Order records store dealer and amount information.
-   Admin can view and update order status.
-   Dealer can view orders associated with their dealer ID.

### 💳 Payment Management

-   Dealers can submit payment details for an order.
-   Transaction ID / UTR validation is implemented.
-   Duplicate transaction IDs are checked.
-   Payment records can be viewed by order.
-   Admin can approve or reject payment submissions.
-   Payment approval/rejection updates the related order/payment state
    and uses email notification helpers.

### 🚚 Shipment Management

-   Shipment records are created against orders.
-   Shipment information can be viewed by Admin and the related Dealer.
-   Shipment status can be updated.
-   Dealer-specific shipment endpoints are available.
-   Delivered shipment information can be retrieved separately.
-   Email notification helpers are used for shipment creation and
    delivery events.

### 🧾 Complaint Management

-   Dealers can submit complaints.
-   Complaint records can be associated with dealer, order and product
    information.
-   Admin can view complaints and update complaint status.
-   Dealers can retrieve their own complaint records through the
    dealer-specific endpoint.

### 📩 Contact Management

-   Public contact messages can be submitted.
-   Admin can list and view contact records.
-   Admin can update message status and delete records.

### 🔐 Authentication and Account Management

-   Dealer registration
-   Login
-   Password hashing using `bcryptjs`
-   Email normalization
-   Registration input validation
-   OTP verification route
-   Dealer approval status
-   Role information for Admin and Dealer accounts

> Account access and approval behavior should be reviewed in the
> authentication routes and frontend before deployment. Do not treat
> this README as a substitute for server-side authorization review.

------------------------------------------------------------------------

## 🧩 Technology Stack

  Technology         Usage
  ------------------ --------------------------------------------
  React 19           Frontend user interface
  Vite               Frontend development server and build tool
  React Router       Client-side page navigation
  JavaScript / JSX   Frontend application logic
  Node.js            Backend JavaScript runtime
  Express 5          REST API and routing
  MongoDB            NoSQL database
  Mongoose           MongoDB models and database operations
  bcryptjs           Password hashing
  Multer             Product image upload handling
  Nodemailer         Email functionality
  CORS               Cross-origin request handling
  dotenv             Environment variable configuration
  QRCode React       QR code UI support where used
  HTML / CSS         Page structure and styling

------------------------------------------------------------------------

## 🏗️ System Architecture

The application follows a client-server architecture.

``` text
             ┌──────────────────────────────┐
             │          Web Browser         │
             │       React + Vite UI        │
             └──────────────┬───────────────┘
                            │ HTTP / REST API
                            ▼
             ┌──────────────────────────────┐
             │       Node.js + Express      │
             │       Backend Server        │
             └──────────────┬───────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
   ┌────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Routes   │    │  Middleware │    │   Uploads   │
   │ REST APIs  │    │ JSON / CORS │    │   Multer    │
   └─────┬──────┘    └─────────────┘    └─────────────┘
         │
         ▼
   ┌─────────────────────────────────────────┐
   │          Mongoose Models                │
   │ User, Product, Order, Payment, etc.     │
   └────────────────────┬────────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │    MongoDB     │
               │    Database    │
               └────────────────┘

       External service: Email via Nodemailer
```

### Request Flow

1.  A user opens the React application in a browser.
2.  React Router displays the selected page.
3.  The frontend sends an HTTP request to the Express API.
4.  Express routes validate and process the request.
5.  Mongoose reads or updates the relevant MongoDB collection.
6.  The backend returns a JSON response.
7.  React updates the user interface using the response.

------------------------------------------------------------------------

## 👥 Application Roles

``` text
                 Dealer Network Management
                            |
                 ┌──────────┴──────────┐
                 |                     |
                 ▼                     ▼
               ADMIN                DEALER
                 |                     |
       ┌─────────┼─────────┐    ┌──────┼──────────┐
       ▼         ▼         ▼    ▼      ▼          ▼
    Dealers   Products   Orders Products Cart    Orders
       |         |         |             |          |
       ▼         ▼         ▼             ▼          ▼
   Approval  Categories Payments      Checkout  Payments
                                      / Shipments / Complaints
```

### Admin

Main responsibilities:

-   Dealer account management
-   Product and category management
-   Order management
-   Payment verification
-   Shipment management
-   Complaint management
-   Contact message management

### Dealer

Main responsibilities:

-   Account registration and login
-   Product browsing
-   Cart and order placement
-   Payment submission
-   Shipment tracking
-   Complaint submission
-   Profile management

------------------------------------------------------------------------

## 📁 Project Structure

The following structure is based on the uploaded project archive.
Generated build output, dependencies, Git internals and uploaded
product-image contents are not expanded here.

``` text
Dealer Network Management/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Shipment.js
│   │   ├── Complaint.js
│   │   └── Contact.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── dealerRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── shipmentRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── contactRoutes.js
│   │
│   ├── utils/
│   │   ├── gujaratData.js
│   │   └── sendOTP.js
│   │
│   ├── uploads/
│   │   └── Product images uploaded at runtime
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env                 
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   ├── Admin.jsx
│   │   ├── DealerRequests.jsx
│   │   ├── ManageDealers.jsx
│   │   ├── AdminCategories.jsx
│   │   ├── AddProduct.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── AdminPayments.jsx
│   │   ├── AdminShipments.jsx
│   │   ├── AdminComplaints.jsx
│   │   ├── AdminContacts.jsx
│   │   ├── Dealer.jsx
│   │   ├── Cart.jsx
│   │   ├── MyOrders.jsx
│   │   ├── Payment.jsx
│   │   ├── MyShipments.jsx
│   │   ├── MyComplaints.jsx
│   │   ├── DealerProfile.jsx
│   │   └── gujaratData.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── data/
│   └── mini_app.categories.json
│
└── Images/
    ├── Electronics/
    └── Home Appliances/
```

------------------------------------------------------------------------

## 🗄️ Database

The project uses **MongoDB** with **Mongoose**.

The database connection is configured through the `MONGO_URI`
environment variable and is initialized in `backend/server.js`.

### Main Models / Collections

  Model         Purpose
  ------------- -------------------------------------------------------
  `User`        Admin and dealer account information
  `Product`     Product catalogue, price, stock, image and status
  `Category`    Product categories and related subcategory/type data
  `Order`       Dealer orders, items, amount and order/payment status
  `Payment`     Payment submission and verification information
  `Shipment`    Shipment and delivery information
  `Complaint`   Dealer complaint records and status
  `Contact`     Contact form messages and status

Mongoose models are stored in `backend/models/`. The model schemas
define the fields and validation rules used by the backend.

------------------------------------------------------------------------

## 🔐 Environment Configuration

The backend loads configuration using `dotenv`.

Create a file named `.env` inside the `backend/` directory.

The project code reads these environment variables:

``` env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dealer_network_management
```

Configure the MongoDB connection string for your own local or hosted
database.

Email functionality may also require credentials used by the email
helper in `backend/utils/sendOTP.js`. Check that file and configure the
exact environment variables expected by your copy of the code.

**Security notes:**

-   Never upload `.env` to a public Git repository.
-   Never share database passwords, email passwords or API credentials.
-   Use a dedicated application password for email services when
    required.
-   Use environment variables for production secrets.
-   Restrict database access and use a production-ready MongoDB
    configuration before deployment.

------------------------------------------------------------------------

## 🛠️ Prerequisites

Install the following before running the project:

-   Node.js (a version compatible with the installed Vite version)
-   npm
-   MongoDB Community Server or MongoDB Atlas
-   Git (optional, for cloning the repository)
-   A web browser
-   Postman or Thunder Client (optional, for API testing)

------------------------------------------------------------------------

## 🚀 How to Run the Project

The project has two separate applications: backend and frontend. Run
them in two terminals.

### 1. Download or clone the project

``` bash
git clone <your-repository-url>
cd "Dealer Network Management"
```

If you already have the project ZIP, extract it and open the extracted
`Dealer Network Management` folder in VS Code.

### 2. Configure MongoDB

Start your local MongoDB service, or create a MongoDB Atlas database.

Create `backend/.env`:

``` env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dealer_network_management
```

Use the connection string that matches your MongoDB setup.

### 3. Start the backend

Open a terminal:

``` bash
cd backend
npm install
npm start
```

The backend uses `backend/server.js` as its entry point. When MongoDB
connects successfully, the server listens on the configured `PORT`, or
port `5000` by default.

Backend base URL:

``` text
http://localhost:5000
```

API health/test route:

``` text
GET http://localhost:5000/
```

Expected response:

``` json
{
  "message": "Dealer Network Management API is running....."
}
```

### 4. Start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite displays the local frontend URL in the terminal. Open that URL in
your browser (commonly `http://localhost:5173`).

### 5. Build the frontend

From the `frontend/` directory:

``` bash
npm run build
```

The production build is generated in the frontend `dist/` directory.

------------------------------------------------------------------------

## 🌐 Frontend Pages and Routes

The following client-side routes are registered in
`frontend/src/App.jsx`.

### Public Routes

  Page       Route
  ---------- -------------
  Home       `/`
  About      `/about`
  Contact    `/contact`
  Login      `/login`
  Register   `/register`

### Admin Routes

  Page                Route
  ------------------- --------------------------
  Admin Dashboard     `/admin`
  Dealer Requests     `/admin/dealer-requests`
  Manage Dealers      `/admin/dealers`
  Manage Categories   `/admin/categories`
  Manage Products     `/admin/products`
  Manage Orders       `/admin/orders`
  Manage Payments     `/admin/payments`
  Manage Shipments    `/admin/shipments`
  Manage Complaints   `/admin/complaints`
  Manage Contacts     `/admin/contacts`

### Dealer Routes

  Page                   Route
  ---------------------- ----------------------------
  Dealer Dashboard       `/dealer`
  Cart                   `/dealer/cart`
  My Orders              `/dealer/orders`
  Payment for an Order   `/dealer/payment/:orderId`
  My Shipments           `/dealer/shipments`
  My Complaints          `/dealer/complaints`
  Dealer Profile         `/dealer/profile`

------------------------------------------------------------------------

## 🔌 Backend API Reference

The backend mounts its Express routers in `backend/server.js`. All API
paths below use the base URL:

``` text
http://localhost:5000
```

### Authentication APIs

Base path: `/api`

  Method   Endpoint            Purpose
  -------- ------------------- -------------------------
  POST     `/api/register`     Register a dealer
  POST     `/api/login`        Login
  POST     `/api/verify-otp`   Verify OTP
  GET      `/api/users`        Retrieve users
  GET      `/api/dealers`      Retrieve dealers
  GET      `/api/admins`       Retrieve administrators

### Product APIs

Base path: `/api/products`

  Method   Endpoint                 Purpose
  -------- ------------------------ --------------------------------------
  GET      `/api/products`          Retrieve all products
  GET      `/api/products/dealer`   Retrieve products for dealer listing
  POST     `/api/products`          Add a product
  PUT      `/api/products/:id`      Update a product
  DELETE   `/api/products/:id`      Delete a product

Product create/update requests support image upload through the `image`
multipart field.

### Dealer APIs

Base path: `/api/dealers`

  Method   Endpoint                  Purpose
  -------- ------------------------- -------------------------------------
  POST     `/api/dealers`            Add a dealer directly
  GET      `/api/dealers`            Retrieve dealers
  GET      `/api/dealers/requests`   Retrieve pending dealer requests
  PUT      `/api/dealers/:id`        Update dealer approval/block status
  DELETE   `/api/dealers/:id`        Delete a dealer

### Category APIs

Base path: `/api/categories`

  ------------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                     Purpose
  ----------------------- ------------------------------------------------------------ -----------------------
  GET                     `/api/categories`                                            Retrieve categories

  POST                    `/api/categories`                                            Create a category

  PUT                     `/api/categories/:id`                                        Update a category

  POST                    `/api/categories/:id/subcategories`                          Add subcategories

  PUT                     `/api/categories/:categoryId/subcategories/:subcategoryId`   Update a subcategory

  DELETE                  `/api/categories/:categoryId/subcategories/:subcategoryId`   Delete a subcategory

  DELETE                  `/api/categories/:id`                                        Delete a category
  ------------------------------------------------------------------------------------------------------------

### Order APIs

Base path: `/api/orders`

  Method   Endpoint                         Purpose
  -------- -------------------------------- ---------------------------------
  POST     `/api/orders`                    Create an order
  GET      `/api/orders`                    Retrieve orders
  GET      `/api/orders/dealer/:dealerId`   Retrieve orders for a dealer
  GET      `/api/orders/:id`                Retrieve one order
  PUT      `/api/orders/:id`                Update order information/status
  DELETE   `/api/orders/:id`                Delete an order

### Payment APIs

Base path: `/api/payments`

  Method   Endpoint                         Purpose
  -------- -------------------------------- -------------------------------
  POST     `/api/payments`                  Submit payment information
  GET      `/api/payments/order/:orderId`   Retrieve payment for an order
  GET      `/api/payments`                  Retrieve payment records
  PUT      `/api/payments/:id/verify`       Approve or reject a payment
  DELETE   `/api/payments/:id`              Delete a payment record

### Shipment APIs

Base path: `/api/shipments`

  ---------------------------------------------------------------------------------------------
  Method                  Endpoint                                      Purpose
  ----------------------- --------------------------------------------- -----------------------
  POST                    `/api/shipments`                              Create a shipment

  GET                     `/api/shipments`                              Retrieve shipments

  GET                     `/api/shipments/dealer/:dealerId/delivered`   Retrieve delivered
                                                                        orders/shipments for a
                                                                        dealer

  GET                     `/api/shipments/dealer/:dealerId`             Retrieve shipments for
                                                                        a dealer

  GET                     `/api/shipments/:id`                          Retrieve one shipment

  PATCH                   `/api/shipments/:id/status`                   Update shipment status

  DELETE                  `/api/shipments/:id`                          Delete a shipment
  ---------------------------------------------------------------------------------------------

### Complaint APIs

Base path: `/api/complaints`

  ------------------------------------------------------------------------------------
  Method                  Endpoint                             Purpose
  ----------------------- ------------------------------------ -----------------------
  POST                    `/api/complaints`                    Submit a complaint

  GET                     `/api/complaints`                    Retrieve complaints

  GET                     `/api/complaints/dealer/:dealerId`   Retrieve complaints for
                                                               a dealer

  GET                     `/api/complaints/:id`                Retrieve one complaint

  PATCH                   `/api/complaints/:id/status`         Update complaint status

  DELETE                  `/api/complaints/:id`                Delete a complaint
  ------------------------------------------------------------------------------------

### Contact APIs

Base path: `/api/contacts`

  Method   Endpoint                     Purpose
  -------- ---------------------------- -------------------------------
  POST     `/api/contacts`              Submit a contact message
  GET      `/api/contacts`              Retrieve contact messages
  GET      `/api/contacts/:id`          Retrieve one contact message
  PATCH    `/api/contacts/:id/status`   Update contact message status
  DELETE   `/api/contacts/:id`          Delete a contact message

> The endpoint list is based on the route declarations in the uploaded
> source archive. For exact request body fields, validation rules and
> response formats, refer to the corresponding file in
> `backend/routes/`.

------------------------------------------------------------------------

## 🧪 Testing

### Test the backend

Start the backend and open:

``` text
GET http://localhost:5000/
```

Confirm that the API returns the running message.

### Test APIs using Postman

1.  Open Postman.
2.  Select the HTTP method required by the endpoint.
3.  Enter the API URL.
4.  For JSON requests, select **Body → raw → JSON**.
5.  Enter the request fields expected by the relevant route.
6.  Click **Send**.
7.  Check the HTTP status and JSON response.
8.  For product image uploads, select **Body → form-data** and use the
    `image` field as a file.

### Test the main workflows

-   Register and log in as a dealer.
-   Verify the OTP flow when configured.
-   Check dealer approval behavior.
-   Add a product from the Admin module.
-   Confirm that the product appears in the dealer product listing.
-   Add products to the cart and place an order.
-   Submit payment details and test Admin verification.
-   Create a shipment and update its status.
-   Submit a complaint and update its status from Admin.
-   Submit a contact message and verify it appears in Admin.

The backend package currently contains a placeholder `npm test` script;
it does not define a project test suite in the uploaded `package.json`.

------------------------------------------------------------------------

## 📷 Screenshots

Add screenshots of the running application to a folder such as:

``` text
docs/
└── screenshots/
    ├── home.png
    ├── login.png
    ├── registration.png
    ├── admin-dashboard.png
    ├── dealer-requests.png
    ├── manage-dealers.png
    ├── manage-products.png
    ├── dealer-dashboard.png
    ├── product-list.png
    ├── cart.png
    ├── orders.png
    ├── payments.png
    ├── shipments.png
    └── complaints.png
```

After adding the images, display them in this section, for example:

``` markdown
![Home Page](docs/screenshots/home.png)
```

------------------------------------------------------------------------

## 🔒 Security and Deployment Notes

Before deploying the application:

-   Configure a secure MongoDB connection.
-   Keep `.env` out of source control.
-   Use strong database credentials.
-   Ensure passwords are hashed before storage.
-   Validate all incoming data on the backend.
-   Review role-based access control for every Admin and Dealer API.
-   Restrict access to uploaded files where appropriate.
-   Configure CORS for the actual frontend domain instead of allowing
    every origin.
-   Use HTTPS in production.
-   Add request logging, error handling and backups.
-   Do not expose private user information or credentials in API
    responses.

------------------------------------------------------------------------

## 🎯 Project Objectives

1.  Provide a centralized system for dealer network operations.
2.  Separate Admin and Dealer workflows.
3.  Simplify dealer registration and account management.
4.  Maintain a manageable product catalogue.
5.  Support dealer ordering and payment submission.
6.  Track shipments and delivery progress.
7.  Provide a complaint handling process.
8.  Manage contact messages from one place.
9.  Use a REST API and MongoDB for data management.

------------------------------------------------------------------------

## 🔮 Future Enhancements

Possible future improvements include:

-   Server-side pagination and filtering for large product/order lists.
-   Stronger role-based authorization middleware.
-   Dashboard analytics and reports.
-   Search and advanced filters.
-   Automated invoice PDF generation.
-   Payment gateway integration.
-   SMS or WhatsApp notifications.
-   Shipment tracking integration.
-   Automated database backups.
-   Unit and integration test coverage.
-   Cloud deployment and CI/CD.

------------------------------------------------------------------------

## 👨‍💻 Developer

**Brijrajsinh Vaghela**

Dealer Network Management -- Full-Stack Web Application

**Technical areas demonstrated:**

-   React and Vite
-   JavaScript and JSX
-   Node.js and Express.js
-   REST API development
-   MongoDB and Mongoose
-   Authentication and password hashing
-   File uploads
-   Order and payment workflows
-   Shipment and complaint management
-   Frontend/backend integration
-   API testing with Postman

------------------------------------------------------------------------

## 📄 License

No open-source license is specified in the uploaded project source. Add
a license file if you intend to distribute the project as open source.

------------------------------------------------------------------------

### Dealer Network Management

**Connecting administrators, dealers and business operations through one
platform.**
