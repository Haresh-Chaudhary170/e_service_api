# **Service Booking System API Documentation**

**Base URL:** `https://api.example.com/v1`

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
"providerId":"cm66doe1e000300xidscjenhx",
"type":"ID_PROOF",
"name":"document",
"metadata":{abc:abc},
"image":"download.jpg"
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
**Description:** Verifies phone number. 
**Request Body:**

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

**Endpoint:** `GET /api/categories/add`  
**Description:** Adds category.  
**Request Body:**

```json
{
"type":"categories",
"name":"Plumbing",
"description":"bla bla bla",
"parentId":"null (optional)",
"image":"image.png"
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
### **3.1 Add category**

**Endpoint:** `POST /api/categories/add`  
**Description:** Adds category.  
**Request Body:**

```json
{
"type":"categories",
"name":"Plumbing",
"description":"bla bla bla",
"parentId":"null (optional)",
"image":"image.png"
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

**Endpoint:** `POST /api/categories/update/cm6kht41l000000j7143oc7hw`  
**Description:** updates category.  
**Request Body:**

```json
{
"type":"categories",
"name":"Plumbing edited",
"description":"bla bla bla",
"parentId":"null (optional)",
"image":"image.png"
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

**Endpoint:** `POST /api/categories/get-all`  
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

**Endpoint:** `POST /api/categories/get-all-admin`  
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

**Endpoint:** `POST /api/categories/get-single/cm6kht41l000000j7143oc7hw`  
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
"type":"services",
"name":"Face Treatments",
"description":"bla bla bla bla",
"price":500,
"duration":60,
"providerId":"cm66doe1e000300xidscjenhx",
"categoryId":"cm67livla000400a5kapcwkj0",
"images":"acvfd.jpg"
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
    "images": [
        "uploads/services/1738318431089-804944350.png"
    ],
    "isActive": true,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "createdAt": "2025-01-31T10:13:51.437Z",
    "updatedAt": "2025-01-31T10:13:51.437Z"
}
```


### **4.2 Update a Service**

**Endpoint:** `PUT /api/services/update/[service_id]`
**Description:** Allows an Service Provider to update a service. 

**Request Body:**

```json
{
"type":"services",
"name":"Face Treatments Edited",
"description":"bla bla bla bla",
"price":500,
"duration":60,
"providerId":"cm66doe1e000300xidscjenhx",
"categoryId":"cm67livla000400a5kapcwkj0",
"images":"acvfd.jpg"
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
    "images": [
        "uploads/services/1738318431089-804944350.png"
    ],
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
        "images": [
            "uploads/services/1738318431089-804944350.png"
        ],
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
        "images": [
            "uploads/services/1737887383549-189922409.jpg"
        ],
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
        "images": [
            "uploads/services/1738318431089-804944350.png"
        ],
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
        "images": [
            "uploads/services/1737887383549-189922409.jpg"
        ],
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
    "images": [
        "uploads/services/1738318431089-804944350.png"
    ],
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
    "images": [
        "uploads/services/1738318431089-804944350.png"
    ],
    "isActive": true,
    "providerId": "cm66doe1e000300xidscjenhx",
    "categoryId": "cm67livla000400a5kapcwkj0",
    "createdAt": "2025-01-31T10:13:51.437Z",
    "updatedAt": "2025-01-31T10:13:51.437Z"
}
]
```

---

## **4. Booking Management**

### **4.1 Book a Service**

**Endpoint:** `POST /bookings` **Description:** Allows a user to book a service. **Headers:**

```yaml
Authorization: Bearer jwt-token-here
```

**Request Body:**

```json
{
    "serviceId": "service-uuid",
    "slotId": "slot-uuid"
}
```

**Response:** `201 Created`

```json
{
    "id": "booking-uuid",
    "serviceId": "service-uuid",
    "userId": "user-uuid",
    "status": "PENDING",
    "createdAt": "2025-01-30T12:00:00Z"
}
```

### **4.2 Get User Bookings**

**Endpoint:** `GET /bookings` **Description:** Retrieves the current user's bookings. **Headers:**

```yaml
Authorization: Bearer jwt-token-here
```

**Response:** `200 OK`

```json
[
    {
        "id": "booking-uuid",
        "serviceId": "service-uuid",
        "status": "PENDING",
        "createdAt": "2025-01-30T12:00:00Z"
    }
]
```

---

## **5. Cart Management**

### **5.1 Add Service to Cart**

**Endpoint:** `POST /cart` **Description:** Adds a service to the user's cart. **Headers:**

```yaml
Authorization: Bearer jwt-token-here
```

**Request Body:**

```json
{
    "serviceId": "service-uuid",
    "quantity": 1
}
```

**Response:** `200 OK`

```json
{
    "message": "Service added to cart."
}
```

### **5.2 View Cart**

**Endpoint:** `GET /cart` **Description:** Retrieves the user's cart details. **Headers:**

```yaml
Authorization: Bearer jwt-token-here
```

**Response:** `200 OK`

```json
{
    "items": [
        {
            "serviceId": "service-uuid",
            "name": "Haircut",
            "price": 25.5,
            "quantity": 1
        }
    ],
    "total": 25.5
}
```

---

## **6. Notifications**

### **6.1 Get Notifications**

**Endpoint:** `GET /notifications` **Description:** Retrieves notifications for the logged-in user. **Headers:**

```yaml
Authorization: Bearer jwt-token-here
```

**Response:** `200 OK`

```json
[
    {
        "id": "notif-uuid",
        "message": "Your booking has been confirmed!",
        "createdAt": "2025-01-30T12:00:00Z"
    }
]
```

---

This API documentation covers essential endpoints. Let me know if you need modifications!
