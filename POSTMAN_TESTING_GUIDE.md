# 📬 Postman Testing Guide - Voter List API

## 🎯 Local Server (localhost:8000)

### Setup:
1. **Postman** open karo
2. **New Collection** banao: "Voter List API"
3. Base URL: `http://localhost:8000`

---

## 📋 API Endpoints

### 1️⃣ **Root Endpoint (API Info)**

**Request:**
```
GET http://localhost:8000/
```

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:8000/`
- Headers: None needed

**Expected Response:**
```json
{
  "message": "Excel Upload API",
  "endpoints": {
    "uploadExcel": "POST /api/voters/upload",
    "getAllVoters": "GET /api/voters",
    "getVoterById": "GET /api/voters/:id",
    "deleteAllVoters": "DELETE /api/voters"
  }
}
```

---

### 2️⃣ **Upload Excel File** ⭐

**Request:**
```
POST http://localhost:8000/api/voters/upload
```

**Postman Setup:**

1. **Method:** `POST`
2. **URL:** `http://localhost:8000/api/voters/upload`
3. **Body Tab:**
   - Select: **`form-data`** (NOT raw/json)
   - Key: `file` (dropdown se **"File"** select karo, NOT "Text")
   - Value: **"Select Files"** button click karo → Excel file select karo
   - Important: Key ka name exactly `file` hona chahiye

**Screenshot Instructions:**
```
Body Tab:
┌─────────────────────────────────────┐
│ [x] form-data  [ ] x-www-form-urlencoded│
│                                         │
│ Key       │ Value     │ Type            │
│ file      │ [Select]  │ [File ▼]        │
│           │ Files...  │                 │
└─────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Excel file processed successfully",
  "totalRows": 100,
  "insertedCount": 100,
  "fieldsDetected": ["SR NO", "नाव", "लिंग", "वय", ...],
  "hindiFields": ["नाव", "लिंग", "वय"],
  "englishFields": ["Name", "Gender", "Age"],
  "sampleRow": {
    "SR NO": "1 / 1",
    "नाव": "कुदळे योगेश्री अभिजीत",
    "लिंग": "पुरुष",
    "वय": 28,
    "name": "Kudle Yogeshri Abhijit",
    "gender": "Male",
    "age": 28
  }
}
```

**Error Cases:**
- ❌ Key name `file` nahi hai → `"File field is required"`
- ❌ File Excel format me nahi → `"Only Excel files are allowed"`
- ❌ File size > 10MB → `"File size exceeds 10MB limit"`

---

### 3️⃣ **Get All Voters (with Pagination)**

**Request:**
```
GET http://localhost:8000/api/voters?page=1&limit=10
```

**Postman Setup:**

1. **Method:** `GET`
2. **URL:** `http://localhost:8000/api/voters`
3. **Params Tab** (optional):
   - `page` = `1` (default: 1)
   - `limit` = `10` (default: 100, max: 1000)

**Example URLs:**
```
# Page 1, 10 records
GET http://localhost:8000/api/voters?page=1&limit=10

# Page 2, 50 records
GET http://localhost:8000/api/voters?page=2&limit=50

# All records (first 100)
GET http://localhost:8000/api/voters
```

**Expected Response:**
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 100,
    "recordsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "count": 10,
  "data": [
    {
      "_id": "6905a14830557f20151fe233",
      "SR NO": "1 / 1",
      "नाव": "कुदळे योगेश्री अभिजीत",
      "लिंग": "पुरुष",
      "वय": 28,
      "मतदान कार्ड क्र": "WZS8461956",
      "name": "Kudle Yogeshri Abhijit",
      "gender": "Male",
      "age": 28,
      "voterIdCard": "WZS8461956",
      "houseNumber": "",
      "mobileNumber": "",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

**Note:** `serialNumber` field **automatically remove** hota hai response se.

---

### 4️⃣ **Get Voter by ID**

**Request:**
```
GET http://localhost:8000/api/voters/{voter_id}
```

**Postman Setup:**

1. **Method:** `GET`
2. **URL:** `http://localhost:8000/api/voters/6905a14830557f20151fe233`
   - Replace `6905a14830557f20151fe233` with actual `_id` from previous response

**Example:**
```
GET http://localhost:8000/api/voters/6905a14830557f20151fe233
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6905a14830557f20151fe233",
    "SR NO": "1 / 1",
    "नाव": "कुदळे योगेश्री अभिजीत",
    "लिंग": "पुरुष",
    "वय": 28,
    "name": "Kudle Yogeshri Abhijit",
    "gender": "Male",
    "age": 28,
    "voterIdCard": "WZS8461956",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Record not found"
}
```
(Status: 404)

---

### 5️⃣ **Delete All Voters**

**Request:**
```
DELETE http://localhost:8000/api/voters
```

**Postman Setup:**

1. **Method:** `DELETE`
2. **URL:** `http://localhost:8000/api/voters`
3. **Body:** Not needed

**Expected Response:**
```json
{
  "success": true,
  "deletedCount": 100
}
```

**⚠️ Warning:** Ye sabhi records delete kar dega! Use carefully.

---

## 🌐 Render Production Server

Agar Render pe deploy hai, to:

**Base URL:** `https://voter-list-node-7.onrender.com`

**Examples:**
```
GET  https://voter-list-node-7.onrender.com/
POST https://voter-list-node-7.onrender.com/api/voters/upload
GET  https://voter-list-node-7.onrender.com/api/voters?page=1&limit=10
GET  https://voter-list-node-7.onrender.com/api/voters/{id}
DELETE https://voter-list-node-7.onrender.com/api/voters
```

---

## 📸 Postman Step-by-Step (Visual Guide)

### **Step 1: Postman Open Karo**
1. Postman app open karo
2. New Collection banao: "Voter List API"

### **Step 2: Upload Excel Request**

1. **New Request** banao
2. Name: "Upload Excel File"
3. Method: **POST**
4. URL: `http://localhost:8000/api/voters/upload`
5. **Body tab** click karo:
   - **form-data** select karo
   - Key: `file` (type: **File**)
   - Value: **Select Files** → Excel file choose karo
6. **Send** button click karo

### **Step 3: Get All Voters Request**

1. **New Request** banao
2. Name: "Get All Voters"
3. Method: **GET**
4. URL: `http://localhost:8000/api/voters`
5. **Params tab** (optional):
   - `page` = `1`
   - `limit` = `10`
6. **Send** button click karo

### **Step 4: Get Voter by ID**

1. **New Request** banao
2. Name: "Get Voter by ID"
3. Method: **GET**
4. URL: `http://localhost:8000/api/voters/{id}`
   - `{id}` ko actual MongoDB `_id` se replace karo
5. **Send** button click karo

---

## 🧪 Testing Checklist

- [ ] Root endpoint (`GET /`) works
- [ ] Upload Excel file (`POST /api/voters/upload`) works
- [ ] Get all voters with pagination (`GET /api/voters?page=1&limit=10`)
- [ ] Get voter by ID (`GET /api/voters/:id`)
- [ ] Delete all voters (`DELETE /api/voters`)
- [ ] Error handling (invalid file, missing file, etc.)
- [ ] Hindi to English translation working (`name`, `gender`)
- [ ] `serialNumber` field removed from response

---

## 🔍 Common Issues & Fixes

### ❌ Issue 1: "File field is required"
**Fix:** 
- Body tab me `form-data` select karo
- Key name exactly `file` hona chahiye
- Type dropdown se **"File"** select karo (NOT "Text")

### ❌ Issue 2: "Only Excel files are allowed"
**Fix:**
- File extension `.xlsx` ya `.xls` hona chahiye
- Correct Excel file select karo

### ❌ Issue 3: "Maximum response size reached"
**Fix:**
- Pagination use karo: `?page=1&limit=10`
- Limit ko chhota karo (10, 20, 50)

### ❌ Issue 4: "502 Bad Gateway" (Render)
**Fix:**
- Render logs check karo
- `MONGODB_URI` environment variable set karo
- Server redeploy karo

---

## 📝 Postman Collection Export

Postman me **Collection** banao aur export karo:
1. Collection → **Export**
2. Format: **Collection v2.1**
3. Save karo: `Voter-List-API.postman_collection.json`

---

## 🚀 Quick Test Commands

**cURL Alternative (Terminal):**

```bash
# Root endpoint
curl http://localhost:8000/

# Upload Excel
curl -X POST http://localhost:8000/api/voters/upload \
  -F "file=@/path/to/excel/file.xlsx"

# Get all voters
curl "http://localhost:8000/api/voters?page=1&limit=10"

# Get voter by ID
curl http://localhost:8000/api/voters/6905a14830557f20151fe233

# Delete all
curl -X DELETE http://localhost:8000/api/voters
```

---

**Happy Testing! 🎉**


