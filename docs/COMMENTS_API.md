# Comments API Documentation

## Base URL
```
http://localhost:5000/api/comments
```

## Authentication
- `GET` endpoints: **Public** — no authentication required
- `POST` endpoint: **Protected** — requires JWT token in `Authorization: Bearer <token>`
- `PATCH` endpoint: **Admin only** — requires JWT token with `role: "ADMIN"`

---

## Endpoints

### 1. Get Comments for a Blog
Retrieves all comments for a specific blog post.

**Request**
```http
GET /api/comments/:blogId
```

**URL Parameters**
| Name | Type | Description |
|------|------|-------------|
| blogId | integer | The ID of the blog post |

**Response** (200 OK)
```json
{
  "comments": [
    {
      "id": 1,
      "content": "Great post!",
      "authorName": "John Doe",
      "authorEmail": "john@example.com",
      "blogId": 5,
      "isApproved": true,
      "createdAt": "2026-05-12T08:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Returns **all** comments regardless of approval status
- Frontend should filter by `isApproved` if needed

---

### 2. Add a Comment
Creates a new comment on a blog post. Comment requires admin approval before being publicly visible.

**Request**
```http
POST /api/comments
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body**
```json
{
  "blogId": 5,
  "content": "This is a comment on the blog.",
  "authorName": "Jane Smith",
  "authorEmail": "jane@example.com"
}
```

**Field Requirements**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| blogId | integer | ✅ Yes | Must reference an existing blog |
| content | string | ✅ Yes | Max length: unlimited (text field) |
| authorName | string | ✅ Yes | Display name of commenter |
| authorEmail | string | ✅ Yes | Email of commenter |

**Response** (201 Created)
```json
{
  "comment": {
    "id": 12,
    "blogId": 5,
    "content": "This is a comment on the blog.",
    "authorName": "Jane Smith",
    "authorEmail": "jane@example.com",
    "isApproved": false,
    "createdAt": "2026-05-12T10:30:00.000Z"
  }
}
```

**Notes:**
- `isApproved` defaults to `false` — comment is pending admin approval
- Authenticated users can comment; no admin privileges needed

---

### 3. Approve a Comment
Allows an admin to approve a pending comment. Only admins can access this endpoint.

**Request**
```http
PATCH /api/comments/:id/approve
Authorization: Bearer <jwt_token>
```

**URL Parameters**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Comment ID to approve |

**Response** (200 OK)
```json
{
  "message": "Comment approved"
}
```

**Errors**
- `403 Forbidden` — User is not an admin
- `404 Not Found` — Comment does not exist

---

## Example Usage (Frontend)

### Fetch comments for a blog
```javascript
const blogId = 5;

// Public fetch — no auth needed
const response = await fetch(`http://localhost:5000/api/comments/${blogId}`);
const data = await response.json();

// Show only approved comments
const approvedComments = data.comments.filter(c => c.isApproved);

// Or show pending comments to admin
if (userIsAdmin) {
  const pending = data.comments.filter(c => !c.isApproved);
}
```

### Submit a comment
```javascript
const token = localStorage.getItem('token'); // Your JWT

const response = await fetch('http://localhost:5000/api/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    blogId: 5,
    content: 'Thanks for sharing!',
    authorName: 'Alice',
    authorEmail: 'alice@example.com'
  })
});

const result = await response.json();
console.log('Comment ID:', result.comment.id);
```

### Approve a comment (Admin)
```javascript
const token = localStorage.getItem('token'); // Admin's JWT

const response = await fetch('http://localhost:5000/api/comments/12/approve', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log(result.message); // "Comment approved"
```

---

## Database Schema (Comments Table)

| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Unique comment ID |
| content | text | Comment body |
| authorName | varchar(100) | Commenter's display name |
| authorEmail | varchar(255) | Commenter's email |
| blogId | integer (FK) | References `blogs.id` (CASCADE delete) |
| isApproved | boolean | Approval status (default: `false`) |
| createdAt | timestamp | Created timestamp |

---

## Status Codes

| Code | Meaning | When it occurs |
|------|---------|----------------|
| 200 | OK | Comment approved successfully |
| 201 | Created | Comment submitted successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | No JWT token or invalid token (for protected routes) |
| 403 | Forbidden | User is not an admin (approve endpoint) |
| 404 | Not Found | Blog ID or comment ID does not exist |
| 500 | Internal Server Error | Database or server error |

---

## Notes for Frontend

1. **Comment Approval Flow**
   - Anyone can submit a comment (authenticated users only)
   - Comments are created with `isApproved: false`
   - Admins must manually approve via `PATCH /api/comments/:id/approve`
   - Public-facing views should only show `isApproved: true` comments

2. **Optional: Email Notifications**
   - Consider notifying admins when new comments arrive for approval
   - You can poll `GET /api/comments/:blogId` to check for new pending comments

3. **Spam Prevention (Future)**
   - Rate limiting could be added to `POST /api/comments`
   - CAPTCHA integration recommended for public comment forms

4. **Blog Deletion**
   - If a blog is deleted, all associated comments are automatically removed (CASCADE)

---

## Swagger UI
Interactive documentation available at:
```
http://localhost:5000/api-docs
```
Use the "Authorize" button to add JWT token and test admin endpoints.
