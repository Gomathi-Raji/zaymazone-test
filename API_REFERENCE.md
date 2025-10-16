# API Reference - Artisan Onboarding & Approvals

## Authentication

All endpoints except public routes require:
```
Header: Authorization: Bearer {jwt_token}
```

Admin endpoints additionally verify:
```
User.role === 'admin'
```

## Request/Response Format

All requests should have:
```
Content-Type: application/json
```

Responses follow this format:
```json
{
  "success": true/false,
  "message": "descriptive message",
  "data": {...}
}
```

---

## Onboarding Endpoints

### POST /api/onboarding/artisan

**Purpose**: Submit artisan onboarding form

**Auth**: Required (JWT token)

**Request Body**:
```json
{
  "businessName": "string (required)",
  "ownerName": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "address": {
    "village": "string",
    "district": "string",
    "state": "string",
    "pincode": "string"
  },
  "yearsOfExperience": "number",
  "sellerType": "gst|non-gst",
  "gstNumber": "string",
  "aadhaarNumber": "string",
  "panNumber": "string",
  "categories": ["string"],
  "productDescription": "string",
  "materials": "string",
  "priceRange": {
    "min": "number",
    "max": "number"
  },
  "stockQuantity": "number",
  "pickupAddress": {
    "sameAsMain": "boolean",
    "address": "string"
  },
  "dispatchTime": "string",
  "packagingType": "string",
  "bankName": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "upiId": "string",
  "paymentFrequency": "string",
  "story": "string",
  "profilePhoto": "base64_encoded_file",
  "productPhotos": ["base64_encoded_file"],
  "gstCertificate": "base64_encoded_file",
  "aadhaarProof": "base64_encoded_file",
  "craftVideo": "base64_encoded_file"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Onboarding form submitted successfully. Your application is pending admin approval.",
  "artisan": {
    "_id": "ObjectId",
    "name": "string",
    "businessName": "string",
    "approvalStatus": "pending"
  }
}
```

**Response Error** (400, 500):
```json
{
  "success": false,
  "message": "Failed to submit onboarding form",
  "error": "error details"
}
```

**Status Codes**:
- 200: Success
- 400: Missing required fields
- 401: Unauthorized
- 500: Server error

---

### GET /api/onboarding/artisan/status

**Purpose**: Check current user's artisan application status

**Auth**: Required (JWT token)

**Response Success** (200):
```json
{
  "success": true,
  "artisan": {
    "_id": "ObjectId",
    "name": "string",
    "businessName": "string",
    "approvalStatus": "pending|approved|rejected",
    "approvedAt": "ISO 8601 timestamp or null",
    "rejectionReason": "string or null",
    "avatar": "string or null"
  }
}
```

**Response Error** (404):
```json
{
  "success": false,
  "message": "Artisan profile not found"
}
```

---

## Admin Approval Endpoints

### GET /api/admin-approvals/pending-artisans

**Purpose**: List artisan applications

**Auth**: Required (Admin only)

**Query Parameters**:
```
?status=pending|approved|rejected|all&page=1&limit=10&sortBy=createdAt&order=desc|asc
```

**Response Success** (200):
```json
{
  "success": true,
  "total": 25,
  "page": 1,
  "pages": 3,
  "artisans": [
    {
      "_id": "ObjectId",
      "name": "string",
      "businessInfo": {
        "businessName": "string",
        "contact": {
          "email": "string",
          "phone": "string",
          "address": "string"
        }
      },
      "specialties": ["string"],
      "experience": "number",
      "bio": "string",
      "approvalStatus": "pending|approved|rejected",
      "createdAt": "ISO 8601 timestamp",
      "userId": {
        "email": "string",
        "firebaseUID": "string"
      }
    }
  ]
}
```

**Parameters Details**:
- `status`: Filter by approval status (default: 'pending')
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: 'createdAt')
- `order`: Sort order - 'asc' or 'desc' (default: 'desc')

---

### GET /api/admin-approvals/artisan-details/:artisanId

**Purpose**: Get detailed artisan information for review

**Auth**: Required (Admin only)

**URL Parameters**:
- `artisanId`: Artisan MongoDB ObjectId

**Response Success** (200):
```json
{
  "success": true,
  "artisan": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "name": "string",
    "businessInfo": {
      "businessName": "string",
      "sellerType": "gst|non-gst",
      "gstNumber": "string",
      "panNumber": "string",
      "contact": {
        "email": "string",
        "phone": "string",
        "address": "string"
      }
    },
    "specialties": ["string"],
    "experience": "number",
    "bio": "string",
    "avatar": "string",
    "productInfo": {
      "description": "string",
      "materials": "string",
      "priceRange": { "min": "number", "max": "number" },
      "stockQuantity": "number",
      "photos": ["string"]
    },
    "logistics": {
      "pickupAddress": { "sameAsMain": "boolean", "address": "string" },
      "dispatchTime": "string",
      "packagingType": "string"
    },
    "payment": {
      "upiId": "string",
      "paymentFrequency": "string"
    },
    "documents": {
      "gstCertificate": "string",
      "aadhaarProof": "string",
      "craftVideo": "string"
    },
    "verification": {
      "isVerified": "boolean",
      "documentNumber": "string",
      "bankDetails": {
        "accountNumber": "string",
        "ifscCode": "string",
        "bankName": "string"
      }
    },
    "approvalStatus": "pending|approved|rejected",
    "approvalNotes": "string or null",
    "rejectionReason": "string or null",
    "approvedBy": "ObjectId or null",
    "approvedAt": "ISO 8601 timestamp or null",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Response Error** (404):
```json
{
  "success": false,
  "message": "Artisan not found"
}
```

---

### PATCH /api/admin-approvals/approve-artisan/:artisanId

**Purpose**: Approve artisan application

**Auth**: Required (Admin only)

**URL Parameters**:
- `artisanId`: Artisan MongoDB ObjectId

**Request Body**:
```json
{
  "approvalNotes": "string (optional)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Artisan {name} has been approved successfully",
  "artisan": {
    "_id": "ObjectId",
    "name": "string",
    "businessName": "string",
    "approvalStatus": "approved",
    "approvedAt": "ISO 8601 timestamp"
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Artisan not found"
}
```

---

### PATCH /api/admin-approvals/reject-artisan/:artisanId

**Purpose**: Reject artisan application

**Auth**: Required (Admin only)

**URL Parameters**:
- `artisanId`: Artisan MongoDB ObjectId

**Request Body**:
```json
{
  "rejectionReason": "string (required)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Artisan {name} has been rejected",
  "artisan": {
    "_id": "ObjectId",
    "name": "string",
    "businessName": "string",
    "approvalStatus": "rejected",
    "rejectionReason": "string"
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Rejection reason is required"
}
```

---

## Product Approval Endpoints

### GET /api/admin-approvals/pending-products

**Purpose**: List pending products

**Auth**: Required (Admin only)

**Query Parameters**:
```
?status=pending|approved|rejected|all&page=1&limit=10&sortBy=createdAt&order=desc|asc
```

**Response Success** (200):
```json
{
  "success": true,
  "total": 15,
  "page": 1,
  "pages": 2,
  "products": [
    {
      "_id": "ObjectId",
      "name": "string",
      "description": "string",
      "price": "number",
      "approvalStatus": "pending|approved|rejected",
      "createdAt": "ISO 8601 timestamp",
      "artisanId": {
        "name": "string",
        "businessInfo": {
          "businessName": "string"
        }
      },
      "categoryId": {
        "name": "string"
      }
    }
  ]
}
```

---

### PATCH /api/admin-approvals/approve-product/:productId

**Purpose**: Approve product for sale

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "approvalNotes": "string (optional)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Product \"{name}\" has been approved",
  "product": {
    "_id": "ObjectId",
    "name": "string",
    "approvalStatus": "approved",
    "approvedAt": "ISO 8601 timestamp"
  }
}
```

---

### PATCH /api/admin-approvals/reject-product/:productId

**Purpose**: Reject product

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "rejectionReason": "string (required)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Product \"{name}\" has been rejected",
  "product": {
    "_id": "ObjectId",
    "name": "string",
    "approvalStatus": "rejected",
    "rejectionReason": "string"
  }
}
```

---

## Blog Approval Endpoints

### GET /api/admin-approvals/pending-blogs

**Purpose**: List pending blog posts

**Auth**: Required (Admin only)

**Query Parameters**:
```
?status=pending|approved|rejected|all&page=1&limit=10&sortBy=createdAt&order=desc|asc
```

**Response Success** (200):
```json
{
  "success": true,
  "total": 8,
  "page": 1,
  "pages": 1,
  "blogs": [
    {
      "_id": "ObjectId",
      "title": "string",
      "slug": "string",
      "category": "string",
      "approvalStatus": "pending|approved|rejected",
      "status": "draft|published",
      "createdAt": "ISO 8601 timestamp",
      "artisanId": {
        "name": "string",
        "businessInfo": {
          "businessName": "string"
        }
      }
    }
  ]
}
```

---

### PATCH /api/admin-approvals/approve-blog/:blogId

**Purpose**: Approve and publish blog post

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "approvalNotes": "string (optional)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Blog \"{title}\" has been approved and published",
  "blog": {
    "_id": "ObjectId",
    "title": "string",
    "slug": "string",
    "approvalStatus": "approved",
    "approvedAt": "ISO 8601 timestamp"
  }
}
```

**Side Effects**:
- Sets `status` to 'published'
- Makes blog visible to all users

---

### PATCH /api/admin-approvals/reject-blog/:blogId

**Purpose**: Reject blog post

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "rejectionReason": "string (required)"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Blog \"{title}\" has been rejected",
  "blog": {
    "_id": "ObjectId",
    "title": "string",
    "slug": "string",
    "approvalStatus": "rejected",
    "rejectionReason": "string"
  }
}
```

**Side Effects**:
- Sets `status` to 'draft'
- Blog remains unpublished

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: ...",
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process request",
  "error": "Error details (development only)"
}
```

---

## Status Codes Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Missing required fields, validation error |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required permissions (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, unexpected exception |

---

## Pagination

All list endpoints support pagination:

**Parameters**:
- `page`: Page number (1-indexed, default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Structure**:
```json
{
  "success": true,
  "total": 50,          // Total items in database
  "page": 1,           // Current page
  "pages": 5,          // Total pages
  "data": [...]        // Items for current page
}
```

**Example**: Get page 2 with 20 items per page
```
GET /api/admin-approvals/pending-artisans?page=2&limit=20
```

---

## Filtering

Use `status` query parameter to filter by approval status:

**Values**:
- `pending` - Not yet reviewed
- `approved` - Approved and active
- `rejected` - Rejected by admin
- `all` - All statuses

**Example**:
```
GET /api/admin-approvals/pending-artisans?status=approved
```

---

## Sorting

Use `sortBy` and `order` parameters:

**Parameters**:
- `sortBy`: Field name (e.g., 'createdAt', 'name')
- `order`: 'asc' or 'desc'

**Example**:
```
GET /api/admin-approvals/pending-artisans?sortBy=name&order=asc
```

---

## Authentication Example

```bash
# JavaScript/Fetch
const token = localStorage.getItem('token');
const response = await fetch('/api/onboarding/artisan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(formData)
});
```

```bash
# cURL
curl -X POST http://localhost:4000/api/onboarding/artisan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"businessName": "...", ...}'
```

---

## Rate Limiting

All endpoints are subject to:
- 120 requests per minute (global)
- May vary by endpoint

**Rate Limit Headers**:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1640000000
```

---

## Changelog

### Version 1.0 (Initial Release)
- Artisan onboarding submission
- Admin artisan approvals
- Product approvals
- Blog approvals
- Pagination support
- Status filtering

---

## Support

For API issues:
1. Check the error response message
2. Verify request format matches documentation
3. Ensure all required fields are present
4. Check authentication token is valid
5. Review backend logs for details

---

**Last Updated**: 2024  
**Version**: 1.0  
**Base URL**: `/api`
