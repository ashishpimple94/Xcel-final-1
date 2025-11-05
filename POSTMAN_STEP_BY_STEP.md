# 📬 Postman Step-by-Step Guide - WhatsApp API Testing

## 🎯 Prerequisites

1. **Postman** installed hai (download from postman.com if needed)
2. **API Key** mil gaya hai (Xtend Online dashboard se)
3. **Internet connection** hai

---

## 📋 STEP 1: Postman Open Karo

1. **Postman app** open karo
2. Agar first time hai, to **"Skip signing in"** ya **"Create account"** kar sakte ho
3. Postman window open hoga

---

## 📋 STEP 2: Environment Setup (Important!)

### **Step 2.1: Environment Create Karo**

1. **Top right corner** me **"Environments"** button dikhega (eye icon)
2. **"+"** button click karo (Create Environment)
3. **"Add"** button click karo
4. **Environment name:** `WhatsApp API` type karo

### **Step 2.2: Variables Add Karo**

**Variable 1: API Key**
- **Variable:** `apikey`
- **Initial Value:** `YOUR_ACTUAL_API_KEY_HERE` (apna API key paste karo)
- **Current Value:** Same value paste karo

**Variable 2: Base URL**
- **Variable:** `base_url`
- **Initial Value:** `https://waba.xtendonline.com/v3`
- **Current Value:** Same

**Variable 3: Phone Number ID** (pehle test karke mil jayega)
- **Variable:** `phone_number_id`
- **Initial Value:** `111266881902966` (placeholder)
- **Current Value:** Same

### **Step 2.3: Environment Save Karo**

1. **"Save"** button click karo
2. **Top right dropdown** me **"WhatsApp API"** select karo (environment active hoga)

---

## 📋 STEP 3: Collection Create Karo

1. **Left sidebar** me **"Collections"** tab pe click karo
2. **"+"** button click karo (New Collection)
3. **Collection name:** `WhatsApp Business API` type karo
4. **"Create"** button click karo

---

## 📋 STEP 4: First Request - Get User Details

### **Step 4.1: Request Create Karo**

1. **Collection** pe **right-click** karo
2. **"Add Request"** select karo
3. **Request name:** `Get User Details` type karo
4. **"Save to WhatsApp Business API"** button click karo

### **Step 4.2: Request Configure Karo**

1. **Method dropdown** (left side) me **"GET"** select karo
2. **URL field** me type karo:
   ```
   {{base_url}}/getuserdetails
   ```
   Ya directly:
   ```
   https://waba.xtendonline.com/v3/getuserdetails
   ```

3. **Headers tab** click karo (URL ke neeche)
4. **Add header:**
   - **Key:** `apikey`
   - **Value:** `{{apikey}}` (double curly braces - environment variable)

### **Step 4.3: Request Send Karo**

1. **"Send"** button (blue, right side) click karo
2. **Response** neeche dikhega

### **Step 4.4: Response Check Karo**

**Success Response:**
```json
{
  "code": 200,
  "status": "SUCCESS",
  "data": [
    {
      "whatsapp_business_account_id": "100249586351323",
      "wanumber": "+919921447944",
      "phone_number_id": "111266881902966"
    }
  ]
}
```

**Important:** 
- `phone_number_id` copy karo (e.g., `111266881902966`)
- `whatsapp_business_account_id` copy karo (e.g., `100249586351323`)

### **Step 4.5: Environment Variables Update Karo**

1. **Top right** me **"Environments"** icon click karo
2. **"WhatsApp API"** environment select karo
3. **New variables add karo:**

   **Variable:** `phone_number_id`
   - **Initial Value:** `111266881902966` (apna value paste karo)
   - **Current Value:** Same

   **Variable:** `wabaid`
   - **Initial Value:** `100249586351323` (apna value paste karo)
   - **Current Value:** Same

4. **"Save"** button click karo

---

## 📋 STEP 5: Send Text Message

### **Step 5.1: Request Create Karo**

1. **Collection** pe **right-click** → **"Add Request"**
2. **Request name:** `Send Text Message`
3. **"Save"** click karo

### **Step 5.2: Request Configure Karo**

1. **Method:** `POST` select karo
2. **URL:**
   ```
   {{base_url}}/{{phone_number_id}}/messages
   ```
   Ya:
   ```
   https://waba.xtendonline.com/v3/111266881902966/messages
   ```

3. **Headers tab:**
   - **Key:** `Content-Type`
   - **Value:** `application/json`
   - **Key:** `apikey`
   - **Value:** `{{apikey}}`

4. **Body tab** click karo
5. **"raw"** radio button select karo
6. **Dropdown** me **"JSON"** select karo
7. **Body field** me ye paste karo:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "text",
  "text": {
    "body": "Hello! This is a test message from WhatsApp Business API."
  }
}
```

**Important:** `91XXXXXXXXXX` ko apne recipient phone number se replace karo (country code + number, without + sign)

### **Step 5.3: Request Send Karo**

1. **"Send"** button click karo
2. **Response** check karo

### **Step 5.4: Success Response**

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "9175XXXXXXXX",
      "wa_id": "9175XXXXXXXX"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMOTE3OTcyODkyNzEyFQIAERgSQzAwRDEzNkQ1NDFFNkM3NkEzAA=="
    }
  ]
}
```

**Success!** Message bhej diya gaya!

---

## 📋 STEP 6: Upload Media (Image)

### **Step 6.1: Request Create Karo**

1. **Collection** pe **right-click** → **"Add Request"**
2. **Request name:** `Upload Media`
3. **"Save"** click karo

### **Step 6.2: Request Configure Karo**

1. **Method:** `POST`
2. **URL:**
   ```
   {{base_url}}/{{phone_number_id}}/media
   ```

3. **Headers tab:**
   - **Key:** `apikey`
   - **Value:** `{{apikey}}`
   - **Note:** `Content-Type` header mat add karo (Postman automatically set karega)

4. **Body tab:**
   - **"form-data"** radio button select karo
   - **Key:** `sheet` type karo
   - **Dropdown** (Key ke right side) me **"File"** select karo
   - **Value column** me **"Select Files"** button click karo
   - **Image file** select karo (jpg, png, etc.)
   - File select ho jayega

### **Step 6.3: Request Send Karo**

1. **"Send"** button click karo
2. **Response** check karo

### **Step 6.4: Success Response**

```json
{
  "response": {
    "id": "1537845180339361"
  }
}
```

**Important:** Ye `id` copy karo - isko messages me use karega

---

## 📋 STEP 7: Send Image Message

### **Step 7.1: Request Create Karo**

1. **Collection** pe **right-click** → **"Add Request"**
2. **Request name:** `Send Image Message`
3. **"Save"** click karo

### **Step 7.2: Request Configure Karo**

1. **Method:** `POST`
2. **URL:**
   ```
   {{base_url}}/{{phone_number_id}}/messages
   ```

3. **Headers:**
   - **Key:** `Content-Type`
   - **Value:** `application/json`
   - **Key:** `apikey`
   - **Value:** `{{apikey}}`

4. **Body tab:**
   - **"raw"** → **"JSON"**
   - **Body:**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "image",
  "image": {
    "id": "1537845180339361"
  }
}
```

**Important:** 
- `91XXXXXXXXXX` ko recipient phone se replace karo
- `1537845180339361` ko Step 6 me mili media `id` se replace karo

### **Step 7.3: Request Send Karo**

1. **"Send"** button click karo
2. **Response** check karo

---

## 📋 STEP 8: Send Template Message

### **Step 8.1: Request Create Karo**

1. **Collection** pe **right-click** → **"Add Request"**
2. **Request name:** `Send Template Message`
3. **"Save"** click karo

### **Step 8.2: Request Configure Karo**

1. **Method:** `POST`
2. **URL:**
   ```
   {{base_url}}/{{phone_number_id}}/messages
   ```

3. **Headers:**
   - **Key:** `Content-Type`
   - **Value:** `application/json`
   - **Key:** `apikey`
   - **Value:** `{{apikey}}`

4. **Body tab:**
   - **"raw"** → **"JSON"**
   - **Body:**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "template",
  "template": {
    "name": "welcome_template",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John"
          }
        ]
      }
    ]
  }
}
```

**Important:** 
- Template name (`welcome_template`) ko apne approved template name se replace karo
- Template approve hona chahiye (pending status me nahi chalega)

### **Step 8.3: Request Send Karo**

1. **"Send"** button click karo
2. **Response** check karo

---

## 📋 STEP 9: Get All Templates

### **Step 9.1: Request Create Karo**

1. **Collection** pe **right-click** → **"Add Request"**
2. **Request name:** `Get All Templates`
3. **"Save"** click karo

### **Step 9.2: Request Configure Karo**

1. **Method:** `GET`
2. **URL:**
   ```
   {{base_url}}/{{wabaid}}/message_templates
   ```

3. **Headers:**
   - **Key:** `apikey`
   - **Value:** `{{apikey}}`

### **Step 9.3: Request Send Karo**

1. **"Send"** button click karo
2. **Response** me sabhi templates dikhenge

---

## 🎯 Visual Postman Layout

```
┌─────────────────────────────────────────────────────────┐
│ Postman                                              [─][□][×]│
├─────────────────────────────────────────────────────────┤
│ Collections │  [GET] {{base_url}}/getuserdetails  [Send]│
│             │                                            │
│ WhatsApp    │  Params │ Headers │ Body │ Pre-request │
│ Business    │         │         │      │ Tests        │
│ API         │         │ Key    │ Value               │
│             │         │────────│─────────────────────│
│ ├─ Get User│         │ apikey │ {{apikey}}          │
│ ├─ Send Text│         │ Content│ application/json    │
│ ├─ Upload   │         │        │                     │
│ └─ Send Img │         │        │                     │
│             │                                            │
│             │  [Body] raw ▼ JSON ▼                    │
│             │  {                                        │
│             │    "messaging_product": "whatsapp",      │
│             │    ...                                    │
│             │  }                                        │
│             │                                            │
│             │  ┌──────────────────────────────────────┐ │
│             │  │ Response                            │ │
│             │  │ Status: 200 OK                      │ │
│             │  │ Time: 234ms                         │ │
│             │  │ Size: 234B                         │ │
│             │  │                                     │ │
│             │  │ {                                    │ │
│             │  │   "code": 200,                      │ │
│             │  │   "status": "SUCCESS"               │ │
│             │  │ }                                    │ │
│             │  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Common Issues & Fixes

### **Issue 1: "Invalid API key" Error**

**Fix:**
1. Environment variable check karo
2. `{{apikey}}` me correct value hai ya nahi
3. API key expire to nahi ho gaya

### **Issue 2: "Template not found" Error**

**Fix:**
1. Template name exact hai ya nahi
2. Template approve ho gaya hai ya nahi
3. Language code correct hai (`en_US`)

### **Issue 3: "Phone number not registered" Error**

**Fix:**
1. Phone number format: `91XXXXXXXXXX` (country code + number)
2. Number WhatsApp pe registered hai ya nahi
3. Number correct hai ya nahi

### **Issue 4: Environment Variable Not Working**

**Fix:**
1. Top right dropdown me correct environment select karo
2. Variable name exact hai (`{{apikey}}` - double curly braces)
3. Variable value set hai ya nahi

---

## 📋 Quick Checklist

**Setup:**
- [ ] Postman installed hai
- [ ] Environment create ho gaya
- [ ] API key environment me set ho gaya
- [ ] Collection create ho gaya

**Testing:**
- [ ] Get User Details - Success
- [ ] Send Text Message - Success
- [ ] Upload Media - Success
- [ ] Send Image Message - Success
- [ ] Send Template Message - Success

---

## 🎉 Success Indicators

**✅ Sab kuch sahi hai agar:**
- Response status: `200 OK`
- Response me `"messaging_product": "whatsapp"` hai
- Messages me `"id"` mil raha hai
- No error messages

**❌ Problem hai agar:**
- Response status: `400`, `401`, `403`, `500`
- Response me `"error"` object hai
- Error message dikh raha hai

---

**Ab Postman me step-by-step follow karo! 🚀**


