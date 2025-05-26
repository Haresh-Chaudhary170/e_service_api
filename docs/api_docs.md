# **Service Booking System API Documentation**

**Base URL:** `http://localhost:8000`

---

## **1. User Registration**

### **1.1 Register a User**

**Endpoint:** `POST /api/users/register`  
**Description:** Creates a new user.  
**Request Body:**

```json
{
    "email": "customer@gmail.com",
    "password": "hary123",
    "phone": "1235567899",
    "firstName": "Harry",
    "lastName": "Potter",
    "role": "CUSTOMER"
}
```

**Response:** `201 Created`

```json
{
    "user": {
        "id": "cm6jm53xj0003008n47gnar55",
        "email": "customer@gmail.com",
        "phone": "1235567899",
        "password": "$2a$10$L13iGiw2gowH4TBDvW4QXeIcAPpvtZhB2hdz5pYkKw39vwgOGELiS",
        "role": "CUSTOMER",
        "firstName": "Harry",
        "lastName": "Potter",
        "avatar": null,
        "status": "PENDING_VERIFICATION",
        "emailVerified": false,
        "phoneVerified": false,
        "createdAt": "2025-01-30T17:32:31.399Z",
        "updatedAt": "2025-01-30T17:32:31.399Z",
        "lastLoginAt": null,
        "lastLoginIp": null
    },
    "message": "User created successfully"
}
```

### **1.2 Register as Customer**

**Endpoint:** `POST /api/users/register-customer`  
**Description:** Registers user as Customer.  
**Request Body:**

```json
{
    "userId": "cm6jm53xj0003008n47gnar55",
    "emergencyContact": "9823121233"
}
```

**Response:** `200 OK`

```json
{
    "customer": {
        "id": "cm6jm776q0007008nykgaiol5",
        "userId": "cm6jm53xj0003008n47gnar55",
        "emergencyContact": "9823121212"
    },
    "message": "Customer created successfully"
}
```

### **1.3 Register as Service Provider**

**Endpoint:** `POST /api/users/register-provider`  
**Description:** Registers user as Service Provider.  
**Request Body:**

```json
{
    "userId": "cm6jmd14x000a008nx35uqlj5",
    "bio": "i m a  rider a provider",
    "experience": 2,
    "businessName": "Electrician",
    "categoryId": "pjhggggggggggfd"
}
```

**Response:** `200 OK`

```json
{
    "provider": {
        "id": "cm6jmh8cu000e008nb9a6uuev",
        "userId": "cm6jmd14x000a008nx35uqlj5",
        "bio": "i m a  rider a provider",
        "experience": 2,
        "businessName": "Electrician",
        "averageRating": null,
        "totalBookings": 0,
        "categoryId": "pjhggggggggggfd",
        "kycStatus": "PENDING",
        "kycVerifiedAt": null,
        "kycVerifiedBy": null
    },
    "message": "Service provider created successfully"
}
```

### **1.4 Add User address**

**Endpoint:** `POST /api/users/add-address`  
**Description:** Adds User Addres.  
**Request Body:**

```json
{
    "userId": "cm6jm53xj0003008n47gnar55",
    "type": "HOME",
    "name": "khara tech",
    "street": "sankhamul",
    "area": "ward 11",
    "state": "Bagmati",
    "city": "lalitpur",
    "zipCode": "44600",
    "landmark": "un park",
    "location": "call eat mandu"
}
```

**Response:** `200 OK`

```json
{
    "address": {
        "id": "cm6jmnjyu000i008nxbuekdjh",
        "userId": "cm6jm53xj0003008n47gnar55",
        "type": "HOME",
        "name": "khara tech",
        "street": "sankhamul",
        "area": "ward 11",
        "city": "lalitpur",
        "state": "Bagmati",
        "zipCode": "44600",
        "landmark": "un park",
        "location": "call eat mandu",
        "isDefault": false,
        "isVerified": false,
        "metadata": null,
        "createdAt": "2025-01-30T17:46:51.990Z",
        "updatedAt": "2025-01-30T17:46:51.990Z"
    },
    "message": "Address created successfully"
}
```

### **1.5 Upload KYC document**

**Endpoint:** `POST /api/users/upload-kyc-document`  
**Description:** Adds User Addres.  
**Request Body (Form Data):**

```json
{
    "providerId": "cm66doe1e000300xidscjenhx",
    "type": "ID_PROOF",
    "name": "document",
    "metadata": { "abc": "bc" },
    "image": "download.jpg"
}
```

**Response:** `200 OK`

```json
{
    "document": {
        "id": "cm6jna4yq000m008nqw573w4u",
        "providerId": "cm6jmh8cu000e008nb9a6uuev",
        "type": "ID_PROOF",
        "name": "document",
        "url": "uploads/document/cm6jmh8cu000e008nb9a6uuev/ID_PROOF/1738260265343-835311322.png",
        "verificationStatus": "PENDING",
        "verifiedAt": null,
        "verifiedBy": null,
        "rejectionReason": null,
        "expiryDate": null,
        "uploadedAt": "2025-01-30T18:04:25.634Z",
        "metadata": "{abc:abc}"
    },
    "message": "Provider document uploaded successfully"
}
```

---

## **2. Authentication**

### **2.1 Login**

**Endpoint:** `POST /api/login`  
**Description:** Login to system. **Request Body:**

```json
{
    "email": "provider@gmail.com",
    "password": "hary123"
}
```

**Response:** `200 OK`

```json
{
    "message": "Login successful",
    "user": {
        "id": "cm6jmd14x000a008nx35uqlj5",
        "firstName": "Service",
        "lastName": "Provider",
        "email": "provider@gmail.com",
        "role": "SERVICE_PROVIDER"
    }
}
```

### **2.2 Logout**

**Endpoint:** `POST /api/logout`  
**Description:** Log out of system.

**Response:** `200 OK`

```json
{
    "message": "Logout successful"
}
```

### **2.3 Send OTP to email**

**Endpoint:** `POST /api/send-otp-email`  
**Description:** Sends verification OTP to email. **Request Body:**

```json
{
    "email": "hareshchaudhary250@gmail.com"
}
```

**Response:** `200 OK`

```json
{
    "userId": "cm66bj7br000200zg8wxrpjyk",
    "message": "OTP sent successfully. Please check your email."
}
```

### **2.4 Send OTP to phone**

**Endpoint:** `POST /api/send-otp-phone`  
**Description:** Sends verification OTP to phone. **Request Body:**

```json
{
    "phone": "9860689987"
}
```

**Response:** `200 OK`

```json
{
    "userId": "cm66bj7br000200zg8wxrpjyk",
    "message": "OTP sent successfully. Please check your phone."
}
```

### **2.5 Verify Email**

**Endpoint:** `POST /api/verify-email`  
**Description:** Verifies email. **Request Body:**

```json
{
    "userId": "cm66bj7br000200zg8wxrpjyk",
    "otp": "997937"
}
```

**Response:** `200 OK`

```json
{
    "message": "Email verified successfully"
}
```

### **2.6 Verify Phone**

**Endpoint:** `POST /api/verify-phonne`  
**Description:** Verifies phone number. **Request Body:**

```json
{
    "userId": "cm66bj7br000200zg8wxrpjyk",
    "otp": "997937"
}
```

**Response:** `200 OK`

```json
{
    "message": "Error"
}
```

---

## **3. Categories**

### **3.1 Add category**

**Endpoint:** `POST /api/categories/add`  
**Description:** Adds category.  
**Request Body:**

```json
{
    "type": "categories",
    "name": "Plumbing",
    "description": "bla bla bla",
    "parentId": "null (optional)",
    "image": "image.png"
}
```

**Response:** `201 OK`

```json
{
    "id": "cm6kht41l000000j7143oc7hw",
    "name": "Plumbing",
    "nameNp": null,
    "description": "bla bla bla",
    "descriptionNp": null,
    "icon": null,
    "image": "uploads/categories/1738311539065-759035963.png",
    "parentId": null,
    "isActive": true,
    "displayOrder": 0,
    "metadata": null,
    "createdAt": "2025-01-31T08:18:59.385Z",
    "updatedAt": "2025-01-31T08:18:59.385Z"
}
```

### **3.2 Update category**

**Endpoint:** `PUT /api/categories/update/cm6kht41l000000j7143oc7hw`  
**Description:** updates category.  
**Request Body:**

```json
{
    "type": "categories",
    "name": "Plumbing edited",
    "description": "bla bla bla",
    "parentId": "null (optional)",
    "image": "image.png"
}
```

**Response:** `200 OK`

```json
{
    "id": "cm6kht41l000000j7143oc7hw",
    "name": "Plumbing edited",
    "nameNp": null,
    "description": "bla bla bla",
    "descriptionNp": null,
    "icon": null,
    "image": "uploads/categories/1738311539065-759035963.png",
    "parentId": null,
    "isActive": true,
    "displayOrder": 0,
    "metadata": null,
    "createdAt": "2025-01-31T08:18:59.385Z",
    "updatedAt": "2025-01-31T08:18:59.385Z"
}
```

### **3.3 Get all categories for frontend**

**Endpoint:** `GET /api/categories/get-all`  
**Description:** Gets all category.

**Response:** `200 OK`

```json
[
    {
        "id": "cm6kht41l000000j7143oc7hw",
        "name": "Plumbing",
        "nameNp": null,
        "description": "bla bla bla",
        "descriptionNp": null,
        "icon": null,
        "image": "uploads/categories/1738311539065-759035963.png",
        "parentId": null,
        "isActive": true,
        "displayOrder": 0,
        "metadata": null,
        "createdAt": "2025-01-31T08:18:59.385Z",
        "updatedAt": "2025-01-31T08:18:59.385Z"
    },
    {
        "id": "pjhggggggggggfd",
        "name": "Welder",
        "nameNp": null,
        "description": null,
        "descriptionNp": null,
        "icon": null,
        "image": null,
        "parentId": null,
        "isActive": true,
        "displayOrder": 1,
        "metadata": null,
        "createdAt": "2025-01-21T16:58:19.000Z",
        "updatedAt": "2025-01-21T16:58:14.000Z"
    }
]
```

### **3.4 Get all categories for admin**

**Endpoint:** `GET /api/categories/get-all-admin`  
**Description:** Gets all category.  
**Response:** `200 OK`

```json
[
    {
        "id": "cm6kht41l000000j7143oc7hw",
        "name": "Plumbing",
        "nameNp": null,
        "description": "bla bla bla",
        "descriptionNp": null,
        "icon": null,
        "image": "uploads/categories/1738311539065-759035963.png",
        "parentId": null,
        "isActive": true,
        "displayOrder": 0,
        "metadata": null,
        "createdAt": "2025-01-31T08:18:59.385Z",
        "updatedAt": "2025-01-31T08:18:59.385Z"
    },
    {
        "id": "pjhggggggggggfd",
        "name": "Welder",
        "nameNp": null,
        "description": null,
        "descriptionNp": null,
        "icon": null,
        "image": null,
        "parentId": null,
        "isActive": true,
        "displayOrder": 1,
        "metadata": null,
        "createdAt": "2025-01-21T16:58:19.000Z",
        "updatedAt": "2025-01-21T16:58:14.000Z"
    }
]
```

### **3.5 Get single category**

**Endpoint:** `GET /api/categories/get-single/cm6kht41l000000j7143oc7hw`  
**Description:** Gets single category.  
**Response:** `200 OK`

```json
{
    "id": "cm6kht41l000000j7143oc7hw",
    "name": "Plumbing",
    "nameNp": null,
    "description": "bla bla bla",
    "descriptionNp": null,
    "icon": null,
    "image": "uploads/categories/1738311539065-759035963.png",
    "parentId": null,
    "isActive": true,
    "displayOrder": 0,
    "metadata": null,
    "createdAt": "2025-01-31T08:18:59.385Z",
    "updatedAt": "2025-01-31T08:18:59.385Z"
}
```

---

## **4. Service Management**

### **4.1 Create a Service**

**Endpoint:** `POST /api/services/add` 
**Description:** Allows an Service Provider to create a service.

**Request Body:**

```json
{
    "type": "services",
    "name": "Face Treatments",
    "description": "bla bla bla bla",
    "price": 500,
    "duration": 60,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "images": "acvfd.jpg"
}
```

**Response:** `201 Created`

```json
{
    "id": "cm6klwtzh000400j7lbtp4hcf",
    "name": "Face Treatments",
    "description": "bla bla bla bla",
    "price": 500,
    "duration": 60,
    "images": ["uploads/services/1738318431089-804944350.png"],
    "isActive": true,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "createdAt": "2025-01-31T10:13:51.437Z",
    "updatedAt": "2025-01-31T10:13:51.437Z"
}
```

### **4.2 Update a Service**

**Endpoint:** `PUT /api/services/update/[service_id]` **Description:** Allows an Service Provider to update a service.

**Request Body:**

```json
{
    "type": "services",
    "name": "Face Treatments Edited",
    "description": "bla bla bla bla",
    "price": 500,
    "duration": 60,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "images": "acvfd.jpg"
}
```

**Response:** `201 Updated`

```json
{
    "id": "cm6klwtzh000400j7lbtp4hcf",
    "name": "Face Treatments Edited",
    "description": "bla bla bla bla",
    "price": 500,
    "duration": 60,
    "images": ["uploads/services/1738318431089-804944350.png"],
    "isActive": true,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "createdAt": "2025-01-31T10:13:51.437Z",
    "updatedAt": "2025-01-31T10:13:51.437Z"
}
```

### **4.3 Get All Services (Admin)**

**Endpoint:** `GET /api/services/get-all-admin` 
**Description:** Retrieves a list of all available services for admin. 
**Response:** `200 OK`

```json
[
    {
        "id": "cm6klwtzh000400j7lbtp4hcf",
        "name": "Face Treatments",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1738318431089-804944350.png"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-31T10:13:51.437Z",
        "updatedAt": "2025-01-31T10:13:51.437Z"
    },
    {
        "id": "cm6ddvz6t000100h0wszi5pd8",
        "name": "Face Treatments Edited ",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1737887383549-189922409.jpg"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-26T08:54:51.365Z",
        "updatedAt": "2025-01-26T10:30:23.832Z"
    }
]
```

### **4.4 Get All Services (Frontend)**

**Endpoint:** `GET /api/services/get-all` 
**Description:** Retrieves a list of all available services for frontend. 
**Response:** `200 OK`

```json
[
    {
        "id": "cm6klwtzh000400j7lbtp4hcf",
        "name": "Face Treatments",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1738318431089-804944350.png"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-31T10:13:51.437Z",
        "updatedAt": "2025-01-31T10:13:51.437Z"
    },
    {
        "id": "cm6ddvz6t000100h0wszi5pd8",
        "name": "Face Treatments Edited ",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1737887383549-189922409.jpg"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-26T08:54:51.365Z",
        "updatedAt": "2025-01-26T10:30:23.832Z"
    }
]
```

### **4.5 Get Single Service**

**Endpoint:** `GET /api/services/get-single/[service_id]` 
**Description:** Retrieves service by service id. 
**Response:** `200 OK`

```json
{
    "id": "cm6klwtzh000400j7lbtp4hcf",
    "name": "Face Treatments",
    "description": "bla bla bla bla",
    "price": 500,
    "duration": 60,
    "images": ["uploads/services/1738318431089-804944350.png"],
    "isActive": true,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "createdAt": "2025-01-31T10:13:51.437Z",
    "updatedAt": "2025-01-31T10:13:51.437Z",
    "provider": {
        "id": "cm66doe1e000300xidscjenhx",
        "userId": "cm66bj5zf000100zg2aufptgx",
        "bio": "i m a  rider a provider",
        "experience": 2,
        "businessName": "Electrician",
        "averageRating": null,
        "totalBookings": 0,
        "categoryId": "pjhggggggggggfd",
        "kycStatus": "PENDING",
        "kycVerifiedAt": null,
        "kycVerifiedBy": null
    },
    "category": {
        "id": "cm67livla000400a5kapcwkj0",
        "name": "Plumbings",
        "nameNp": null,
        "description": "bla bla bla edited without image",
        "descriptionNp": null,
        "icon": null,
        "image": "uploads/categories/1737532478074-702292067.png",
        "parentId": null,
        "isActive": true,
        "displayOrder": 0,
        "metadata": null,
        "createdAt": "2025-01-22T07:42:00.008Z",
        "updatedAt": "2025-01-22T07:56:23.157Z"
    },
    "bookings": []
}
```

### **4.6 Get Services By Category**

**Endpoint:** `GET /api/services//category/[category_id]` 
**Description:** Retrieves a list of all available services for frontend. 
**Response:** `200 OK`

```json
[
    {
        "id": "cm6klwtzh000400j7lbtp4hcf",
        "name": "Face Treatments",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1738318431089-804944350.png"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-31T10:13:51.437Z",
        "updatedAt": "2025-01-31T10:13:51.437Z"
    }
]
```

### **4.7 Get Services By Provider**

**Endpoint:** `GET /api/services/get-by-provider/[providerId]` 
**Description:** Retrieves a list of all available services for frontend. 
**Response:**`200 OK`

```json
[
    {
        "id": "cm6klwtzh000400j7lbtp4hcf",
        "name": "Face Treatments",
        "description": "bla bla bla bla",
        "price": 500,
        "duration": 60,
        "images": ["uploads/services/1738318431089-804944350.png"],
        "isActive": true,
        "providerId": "cm66doe1e000300xidscjenhx",
        "categoryId": "cm67livla000400a5kapcwkj0",
        "createdAt": "2025-01-31T10:13:51.437Z",
        "updatedAt": "2025-01-31T10:13:51.437Z"
    }
]
```

---

## **5. Cart Management**

### **5.1 Add to Cart**

**Endpoint:** `POST /api/carts/add` 
**Description:** Allows a user to add service to cart.

**Request Body:**

```json
{
    "serviceId": "cm6klwtzh000400j7lbtp4hcf",
    "quantity": "1"
}
```
**Response:** `200 Created`

```json
{
    "cartItem": {
        "id": "53623665-60c4-435e-9ee1-47e49e84b327",
        "userId": "cm6jm53xj0003008n47gnar55",
        "serviceId": "cm6klwtzh000400j7lbtp4hcf",
        "quantity": 1,
        "createdAt": "2025-02-02T07:03:30.917Z",
        "updatedAt": "2025-02-02T07:03:30.917Z"
    },
    "message": "Service added to cart"
}
```

### **5.2 View Carts**

**Endpoint:** `GET /api/carts/get` 
**Description:** Allows a user to view carts.

**Response:** `200 Created`

```json
[
    {
        "id": "53623665-60c4-435e-9ee1-47e49e84b327",
        "userId": "cm6jm53xj0003008n47gnar55",
        "serviceId": "cm6klwtzh000400j7lbtp4hcf",
        "quantity": 1,
        "createdAt": "2025-02-02T07:03:30.917Z",
        "updatedAt": "2025-02-02T07:03:30.917Z"
    }
]
```

### **5.3 Edit Cart quantity**

**Endpoint:** `PUT /api/carts/update/[cartId]` 
**Description:** Allows a user to update to cart quantity.

**Request Body:**

```json
{
    "quantity": "2"
}
```

**Response:** `200 Updated`

```json
{
    "message": "Cart item updated successfully",
    "cart": {
        "id": "53623665-60c4-435e-9ee1-47e49e84b327",
        "userId": "cm6jm53xj0003008n47gnar55",
        "serviceId": "cm6klwtzh000400j7lbtp4hcf",
        "quantity": 2,
        "createdAt": "2025-02-02T07:03:30.917Z",
        "updatedAt": "2025-02-02T07:10:31.566Z"
    }
}
```

### **5.4 Delete Cart**

**Endpoint:** `DELETE /api/carts/delete/[cartId]` 
**Description:** Allows a user to delete cart.

**Response:** `200 Deleted`

```json
{
    "message": "Cart item Deleted successfully",
}
```

---

## **6. Calendar Management**

### **6.1 Add Service Area**

**Endpoint:** `POST /api/calendar/add-service-area` 
**Description:** Allows a service provider to add service area.

**Request Body:**

```json
{
    "name": "khoik ho",
    "polygon": {
        "type": "Polygon",
        "coordinates": [
            [
                [0,0], [1,1], [1,0], [0,0]
            ]
        ]
    }
}
```

**Response:** `200 Created`

```json
{
    "serviceArea": {
        "id": "cm6nb5rwg000100vnd3xy2a76",
        "providerId": "cm6jmh8cu000e008nb9a6uuev",
        "name": "khoik ho",
        "polygon": {
            "type": "Polygon",
            "coordinates": [
                [
                    [0,0],[1,1],[1,0],[0,0]
                ]
            ]
        },
        "isActive": true,
        "createdAt": "2025-02-02T07:36:11.392Z",
        "updatedAt": "2025-02-02T07:36:11.392Z"
    },
    "message": "Service area created successfully"
}
```


### **6.2 Add Working hours**

**Endpoint:** `POST /api/calendar/add-working-hours` 
**Description:** Allows a service provider to add working hours.

**Request Body:**

```json
{
    "dayOfWeek": 0,
    "startTime": "05:30",
    "endTime": "16:30",
    "breakStart": "12:00",
    "breakEnd": "13:00"
}
```

**Response:** `200 Created`

```json
{
    "workingHours": {
        "id": "cm6nbgwkf000500vninlgisqb",
        "providerId": "cm6jmh8cu000e008nb9a6uuev",
        "dayOfWeek": 0,
        "startTime": "05:30",
        "endTime": "16:30",
        "breakStart": "12:00",
        "breakEnd": "13:00",
        "isAvailable": true
    },
    "message": "Working hours created successfully"
}
```
### **6.3 Add Date Exclusion**

**Endpoint:** `POST /api/calendar/add-date-exclusion` 
**Description:** Allows a service provider to add exclusion dates.

**Request Body:**

```json
{
  "startDate": "2025-01-30T08:00:00Z",
  "endDate": "2025-02-01T08:00:00Z",
  "reason": "Holiday break"
}
```

**Response:** `200 Created`

```json
{
    "dateExclusion": {
        "id": "cm6nbktsk000900vnmqukzgte",
        "providerId": "cm6jmh8cu000e008nb9a6uuev",
        "startDate": "2025-01-30T08:00:00.000Z",
        "endDate": "2025-02-01T08:00:00.000Z",
        "reason": "Holiday break",
        "createdAt": "2025-02-02T07:47:53.685Z"
    },
    "message": "Date exclusion created successfully"
}
```

### **6.4 Add Schedule**

**Endpoint:** `POST /api/calendar/add-schedule` 
**Description:** Allows a service provider to add schedule.

**Request Body:**

```json
{
      "date": "2025-02-01T08:00:00Z"
}
```

**Response:** `200 Created`

```json
{
    "schedule": {
        "id": "cm6nbnz1o000d00vn685trgk3",
        "providerId": "cm6jmh8cu000e008nb9a6uuev",
        "date": "2025-02-01T08:00:00.000Z",
        "createdAt": "2025-02-02T07:50:20.461Z",
        "updatedAt": "2025-02-02T07:50:20.461Z"
    },
    "message": "Schedule created successfully"
}
```

### **6.5 Add Time Slot**

**Endpoint:** `POST /api/calendar/add-time-slot` 
**Description:** Allows a service provider to add schedule.

**Request Body:**

```json
{
    "scheduleId": "cm6nbnz1o000d00vn685trgk3",
    "startTime": "2025-01-30T08:00:00Z",
    "endTime": "2025-02-01T08:00:00Z"
}
```

**Response:** `200 Created`

```json
{
    "timeSlot": {
        "id": "cm6nbrswo000h00vnf1fb47qn",
        "scheduleId": "cm67r1qua0001006hks8pi3fu",
        "startTime": "2025-01-30T08:00:00.000Z",
        "endTime": "2025-02-01T08:00:00.000Z",
        "isAvailable": true
    },
    "message": "Time slot created successfully"
}
```

---

## **7. Booking Management**

### **7.1 Book a Service**

**Endpoint:** `POST /api/bookings` 
**Description:** Allows a user to book a service.
**Request Body:**

```json
{
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "providerId": "cm66doe1e000300xidscjenhx",
    "timeSlotId": "cm6nbrswo000h00vnf1fb47qn",
    "scheduledDate": "2025-01-30T10:00:00Z",
    "totalAmount": 199.99,
    "notes": "Please arrive 10 minutes early.",
    "location": {
        "type": "Point",
        "coordinates": [103.8198,1.3521]
    }
}
```

**Response:** `200 Created`

```json
{
    "id": "cm6ncjbk4000100v394eccfj2",
    "customerId": "cm6jm776q0007008nykgaiol5",
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "providerId": "cm66doe1e000300xidscjenhx",
    "timeSlotId": "cm6nbrswo000h00vnf1fb47qn",
    "status": "PENDING",
    "scheduledDate": "2025-01-30T10:00:00.000Z",
    "completedDate": null,
    "totalAmount": 199.99,
    "notes": "Please arrive 10 minutes early.",
    "location": {
        "type": "Point",
        "coordinates": [103.8198,1.3521]
    },
    "createdAt": "2025-02-02T08:14:43.012Z",
    "updatedAt": "2025-02-02T08:14:43.012Z"
}
```

### **7.2 Get Bookings (Admin Only)**

**Endpoint:** `GET /bookings/get-all` 
**Description:** Retrieves the all user's bookings.

**Response:** `200 OK`

```json
[
    {
        "id": "cm6f1a4pq0001001pxyaueqq6",
        "customerId": "cm66d7wig000100xir6pufe1g",
        "serviceId": "cm6ddvz6t000100h0wszi5pd8",
        "providerId": "cm66doe1e000300xidscjenhx",
        "timeSlotId": "cm67r7afl0003006hmel7rsrz",
        "status": "PENDING",
        "scheduledDate": "2025-01-30T10:00:00.000Z",
        "completedDate": null,
        "totalAmount": 199.99,
        "notes": "Please arrive 10 minutes early.",
        "location": {
            "type": "Point",
            "coordinates": [
                103.8198,
                1.3521
            ]
        },
        "createdAt": "2025-01-27T12:37:29.054Z",
        "updatedAt": "2025-01-27T12:37:29.054Z",
        "customer": {
            "id": "cm66d7wig000100xir6pufe1g",
            "userId": "cm66bj4mz000000zgoq5fq6xc",
            "emergencyContact": "9823121212"
        },
        "service": {
            "id": "cm6ddvz6t000100h0wszi5pd8",
            "name": "Face Treatments Edited ",
            "description": "bla bla bla bla",
            "price": 500,
            "duration": 60,
            "images": [
                "uploads/services/1737887383549-189922409.jpg"
            ],
            "isActive": true,
            "providerId": "cm66doe1e000300xidscjenhx",
            "categoryId": "cm67livla000400a5kapcwkj0",
            "createdAt": "2025-01-26T08:54:51.365Z",
            "updatedAt": "2025-01-26T10:30:23.832Z"
        },
        "provider": {
            "id": "cm66doe1e000300xidscjenhx",
            "userId": "cm66bj5zf000100zg2aufptgx",
            "bio": "i m a  rider a provider",
            "experience": 2,
            "businessName": "Electrician",
            "averageRating": null,
            "totalBookings": 0,
            "categoryId": "pjhggggggggggfd",
            "kycStatus": "PENDING",
            "kycVerifiedAt": null,
            "kycVerifiedBy": null
        },
        "timeSlot": {
            "id": "cm67r7afl0003006hmel7rsrz",
            "scheduleId": "cm67r1qua0001006hks8pi3fu",
            "startTime": "2025-01-30T08:00:00.000Z",
            "endTime": "2025-02-01T08:00:00.000Z",
            "isAvailable": true
        }
    },
    {
        "id": "cm6ncjbk4000100v394eccfj2",
        "customerId": "cm6jm776q0007008nykgaiol5",
        "serviceId": "cm6ddvz6t000100h0wszi5pd8",
        "providerId": "cm66doe1e000300xidscjenhx",
        "timeSlotId": "cm6nbrswo000h00vnf1fb47qn",
        "status": "PENDING",
        "scheduledDate": "2025-01-30T10:00:00.000Z",
        "completedDate": null,
        "totalAmount": 199.99,
        "notes": "Please arrive 10 minutes early.",
        "location": {
            "type": "Point",
            "coordinates": [
                103.8198,
                1.3521
            ]
        },
        "createdAt": "2025-02-02T08:14:43.012Z",
        "updatedAt": "2025-02-02T08:14:43.012Z",
        "customer": {
            "id": "cm6jm776q0007008nykgaiol5",
            "userId": "cm6jm53xj0003008n47gnar55",
            "emergencyContact": "9823121212"
        },
        "service": {
            "id": "cm6ddvz6t000100h0wszi5pd8",
            "name": "Face Treatments Edited ",
            "description": "bla bla bla bla",
            "price": 500,
            "duration": 60,
            "images": [
                "uploads/services/1737887383549-189922409.jpg"
            ],
            "isActive": true,
            "providerId": "cm66doe1e000300xidscjenhx",
            "categoryId": "cm67livla000400a5kapcwkj0",
            "createdAt": "2025-01-26T08:54:51.365Z",
            "updatedAt": "2025-01-26T10:30:23.832Z"
        },
        "provider": {
            "id": "cm66doe1e000300xidscjenhx",
            "userId": "cm66bj5zf000100zg2aufptgx",
            "bio": "i m a  rider a provider",
            "experience": 2,
            "businessName": "Electrician",
            "averageRating": null,
            "totalBookings": 0,
            "categoryId": "pjhggggggggggfd",
            "kycStatus": "PENDING",
            "kycVerifiedAt": null,
            "kycVerifiedBy": null
        },
        "timeSlot": {
            "id": "cm6nbrswo000h00vnf1fb47qn",
            "scheduleId": "cm67r1qua0001006hks8pi3fu",
            "startTime": "2025-01-30T08:00:00.000Z",
            "endTime": "2025-02-01T08:00:00.000Z",
            "isAvailable": true
        }
    }
]
```
### **7.3 Get Bookings by Customer ID**

**Endpoint:** `GET /bookings/customer/[customer_id]` 
**Description:** Retrieves the current user's bookings.

**Response:** `200 OK`

```json
[]
```
### **7.4 Get Bookings by Service ID**

**Endpoint:** `GET /bookings/service/[service_id]` 
**Description:** Retrieves the current service bookings.

**Response:** `200 OK`

```json
[]
```
### **7.5 Get Bookings by Service Provider ID**

**Endpoint:** `GET /bookings/provider/[service_provider_id]` 
**Description:** Retrieves the current service provider bookings.

**Response:** `200 OK`

```json
[]
```
### **7.6 Get single Booking by booking ID**

**Endpoint:** `GET /bookings/[booking_id]` 
**Description:** Retrieves the current booking.

**Response:** `200 OK`

```json
[]
```
---

## **8. Payment Management**

### **8.1 Khalti (Initiate Payment)**

**Endpoint:** `POST /api/payment/khalti/initiate` 
**Description:** Initiates Khalti payment Method.

**Request Body:**

```json
{
    "bookingId":"cm6f1a4pq0001001pxyaueqq6",
    "totalAmount":10,
    "serviceName":"Beauty Treatment"
}
```

**Response:** `200 OK`

```json
{
    "pidx": "2mCPohCFGWCuKHoaECTw8a",
    "payment_url": "https://pay.khalti.com/?pidx=2mCPohCFGWCuKHoaECTw8a",
    "expires_at": "2025-02-02T15:59:39.098052+05:45",
    "expires_in": 3600
}
```

### **8.2 Cash On Delivery**

**Endpoint:** `POST /payment/cod` 
**Description:** Initiates booking with COD.
**Request Body:**

```json
{
    "bookingId":"cm6f1a4pq0001001pxyaueqq6",
    "totalAmount":10,
    "serviceName":"Beauty Treatment"
}
```
**Response:** `200 OK`

```json
{

}
```

---

## **9. Reviews**

### **9.1 Add Reviews**

**Endpoint:** `POST /api/reviews` 
**Description:** Adds reviews to the service or service provider.
**Response:** `200 OK`

**Request Body (Form Data):**

```json
{
    "type":"reviews",
    "serviceId":"cm6ddvz6t000100h0wszi5pd8",
    "rating":5,
    "comment":"Service was good",
    "images":"abvff.jpg"
}
```
```json
{
    "id": "cm6njpuh5000100wssu1521l4",
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "authorId": "cm66bj4mz000000zgoq5fq6xc",
    "rating": 5,
    "comment": "Service was good.",
    "reply": null,
    "images": [
        "uploads/reviews/1738496144045-263997492.png"
    ],
    "helpfulCount": 0,
    "reportCount": 0,
    "isVerified": false,
    "isHidden": false,
    "hiddenReason": null,
    "createdAt": "2025-02-02T11:35:44.777Z",
    "updatedAt": "2025-02-02T11:35:44.777Z"
}
```

### **9.2 Reply to Reviews**

**Endpoint:** `PUT /api/reviews/reply/[reviewID]` 
**Description:** Adds reply to review.
**Response:** `200 OK`

**Request Body:**

```json
{
    "reply":"This didn't worked out for me."
}
```
```json
{
    "id": "cm6g3aei0000100jm9mkk3xj6",
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "authorId": "cm66bj4mz000000zgoq5fq6xc",
    "rating": 5,
    "comment": "Service was good.",
    "reply": "This didn't worked out for me.",
    "images": [
        "uploads/reviews/1738045285452-838648691.jpg",
        "uploads/reviews/1738045285466-680024579.jpg"
    ],
    "helpfulCount": 0,
    "reportCount": 0,
    "isVerified": true,
    "isHidden": true,
    "hiddenReason": "Inappropriate words.",
    "createdAt": "2025-01-28T06:21:27.145Z",
    "updatedAt": "2025-02-02T11:41:50.636Z"
}
```

### **9.3 Delete Reviews (Only Service Provider or Admin)**

**Endpoint:** `DELETE /api/reviews/delete/[reviewID]` 
**Description:**  Deletes the review.
**Response:** `200 OK`

```json
{
"message":"Review Deleted"
}
```

### **9.4 Verify Reviews (Only Service Provider or Admin)**

**Endpoint:** `PUT /api/reviews/verify/[reviewID]` 
**Description:**  verifies the review.
**Response:** `200 OK`

```json
{
    "id": "cm6g3aei0000100jm9mkk3xj6",
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "authorId": "cm66bj4mz000000zgoq5fq6xc",
    "rating": 5,
    "comment": "Service was good.",
    "reply": "This didn't worked out for me.",
    "images": [
        "uploads/reviews/1738045285452-838648691.jpg",
        "uploads/reviews/1738045285466-680024579.jpg"
    ],
    "helpfulCount": 0,
    "reportCount": 0,
    "isVerified": true,
    "isHidden": true,
    "hiddenReason": "Inappropriate words.",
    "createdAt": "2025-01-28T06:21:27.145Z",
    "updatedAt": "2025-02-02T11:53:05.110Z"
}
```

### **9. Hide/show Reviews (Only Service Provider or Admin)**

**Endpoint:** `PUT /api/hide/verify/[reviewID]` 
**Description:**  hide/show the review.
**Response:** `200 OK`

```json
{
    "id": "cm6g3aei0000100jm9mkk3xj6",
    "serviceId": "cm6ddvz6t000100h0wszi5pd8",
    "authorId": "cm66bj4mz000000zgoq5fq6xc",
    "rating": 5,
    "comment": "Service was good.",
    "reply": "This didn't worked out for me.",
    "images": [
        "uploads/reviews/1738045285452-838648691.jpg",
        "uploads/reviews/1738045285466-680024579.jpg"
    ],
    "helpfulCount": 0,
    "reportCount": 0,
    "isVerified": true,
    "isHidden": false,
    "hiddenReason": "Inappropriate words.",
    "createdAt": "2025-01-28T06:21:27.145Z",
    "updatedAt": "2025-02-02T11:53:05.110Z"
}
```
---

## **10. Activity Log**

### **10.1 Get Activity Log**

**Endpoint:** `GET /api/activities/activity-log` 
**Description:** Shows the current user's activity log.
**Response:** `200 OK`

```json
[
    {
        "id": "cm6dhauls0007006stk0ch8dk",
        "userId": "cm66bj5zf000100zg2aufptgx",
        "action": "Service Updated.",
        "entity": "Service",
        "entityId": "cm6ddvz6t000100h0wszi5pd8",
        "details": {
            "updatedService": {
                "id": "cm6ddvz6t000100h0wszi5pd8",
                "name": "Face Treatments Edited ",
                "price": 500,
                "images": [
                    "uploads/services/1737887383549-189922409.jpg"
                ],
                "duration": 60,
                "isActive": true,
                "createdAt": "2025-01-26T08:54:51.365Z",
                "updatedAt": "2025-01-26T10:30:23.832Z",
                "categoryId": "cm67livla000400a5kapcwkj0",
                "providerId": "cm66doe1e000300xidscjenhx",
                "description": "bla bla bla bla"
            }
        },
        "ipAddress": "::1",
        "userAgent": "PostmanRuntime/7.43.0",
        "createdAt": "2025-01-26T10:30:24.073Z"
    },
    {
        "id": "cm6ddvzml000300h05mla9wvj",
        "userId": "cm66bj5zf000100zg2aufptgx",
        "action": "Service Added.",
        "entity": "Service",
        "entityId": "cm6ddvz6t000100h0wszi5pd8",
        "details": {
            "name": "Face Treatments"
        },
        "ipAddress": "::1",
        "userAgent": "PostmanRuntime/7.43.0",
        "createdAt": "2025-01-26T08:54:51.933Z"
    }
]
```

### **10.2 Get Activity Log detail**

**Endpoint:** `GET /api/activities/activity-log/[activity_id]` 
**Description:** Shows the current user's activity log detail.
**Response:** `200 OK`

```json
{
    "id": "cm6dhauls0007006stk0ch8dk",
    "userId": "cm66bj5zf000100zg2aufptgx",
    "action": "Service Updated.",
    "entity": "Service",
    "entityId": "cm6ddvz6t000100h0wszi5pd8",
    "details": {
        "updatedService": {
            "id": "cm6ddvz6t000100h0wszi5pd8",
            "name": "Face Treatments Edited ",
            "price": 500,
            "images": [
                "uploads/services/1737887383549-189922409.jpg"
            ],
            "duration": 60,
            "isActive": true,
            "createdAt": "2025-01-26T08:54:51.365Z",
            "updatedAt": "2025-01-26T10:30:23.832Z",
            "categoryId": "cm67livla000400a5kapcwkj0",
            "providerId": "cm66doe1e000300xidscjenhx",
            "description": "bla bla bla bla"
        }
    },
    "ipAddress": "::1",
    "userAgent": "PostmanRuntime/7.43.0",
    "createdAt": "2025-01-26T10:30:24.073Z"
}
```
---
