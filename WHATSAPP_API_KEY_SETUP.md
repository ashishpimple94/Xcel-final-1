# 🔑 WhatsApp Business API Key Setup Guide

## 📋 API Key Kya Hai?

**API Key** ek authentication token hai jo Xtend Online WhatsApp Business API use karne ke liye required hai. Har request me ye header me bhejna padta hai.

---

## 🔍 API Key Kaise Milega?

### **Option 1: Xtend Online Dashboard Se**

1. **Xtend Online Dashboard** login karo:
   - URL: `https://dashboard.xtendonline.com` (ya jo bhi URL Xtend Online ne diya ho)
   - Username/Password se login karo

2. **API Settings** section me jao:
   - Dashboard → **Settings** → **API Keys**
   - Ya **Developer** → **API Configuration**

3. **API Key** copy karo:
   - Agar pehle se key hai to copy karo
   - Agar nahi hai to **"Generate New API Key"** button click karo

4. **API Key** save karo safely (ye dobara nahi dikhayega)

---

### **Option 2: Support Team Se Contact**

Agar dashboard me nahi mil raha, to:

1. **Xtend Online Support** ko email/phone karo
2. Request karo: "WhatsApp Business API key chahiye"
3. Unhe bataye:
   - Apna account details
   - WhatsApp Business Account ID (if available)
   - Use case (kyon chahiye)

4. Support team API key provide karega

---

### **Option 3: PDF Documentation Me Check**

PDF me kahi mention ho sakta hai:
- API key ka format
- Kaha se generate karein
- Support contact details

---

## 📝 API Key Format

**Typical API Key format:**
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Usually 32-64 characters long
- Alphanumeric (letters + numbers)
- Sometimes with dashes or underscores

**Example:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 🔧 Postman Me API Key Kaise Set Karein?

### **Method 1: Environment Variables (Recommended)**

1. **Postman** me **Environment** create karo:
   - Top right corner me **"Environments"** click karo
   - **"+"** button → **"Add"**

2. **Environment name:** `WhatsApp API`

3. **Variables add karo:**
   ```
   Variable Name: apikey
   Initial Value: YOUR_ACTUAL_API_KEY_HERE
   Current Value: YOUR_ACTUAL_API_KEY_HERE
   ```

4. **Environment select karo** (top right dropdown)

5. **Request me use karo:**
   - Headers tab
   - Key: `apikey`
   - Value: `{{apikey}}` (double curly braces)

---

### **Method 2: Direct Header Me**

1. **Request** open karo
2. **Headers** tab click karo
3. Add header:
   ```
   Key: apikey
   Value: YOUR_ACTUAL_API_KEY_HERE
   ```

**Note:** Har request me ye header manually add karna padega.

---

### **Method 3: Collection Level (Best Practice)**

1. **Collection** me jao (left sidebar)
2. **Collection** pe **right-click** → **"Edit"**
3. **"Authorization"** tab click karo
4. **Type:** `API Key`
5. **Key:** `apikey`
6. **Value:** `YOUR_ACTUAL_API_KEY_HERE`
7. **Add to:** `Header`

**Ab har request me automatically add ho jayega!**

---

## 🧪 API Key Test Karein

### **Step 1: Get User Details Test**

**Postman Setup:**
1. Method: `GET`
2. URL: `https://waba.xtendonline.com/v3/getuserdetails`
3. Headers:
   ```
   apikey: YOUR_ACTUAL_API_KEY_HERE
   ```
4. **Send** click karo

**Expected Success Response:**
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

**Error Response (Invalid API Key):**
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "OAuthException",
    "code": 190
  }
}
```

---

## ⚠️ API Key Security Best Practices

### ✅ **DO:**
- ✅ API key ko **environment variables** me store karo
- ✅ API key ko **never commit** karo Git me
- ✅ API key ko **share mat karo** publicly
- ✅ API key ko **rotate** karo periodically (if possible)
- ✅ `.env` file me store karo (local development)

### ❌ **DON'T:**
- ❌ API key ko **hardcode** mat karo code me
- ❌ API key ko **GitHub** pe push mat karo
- ❌ API key ko **screenshot** me share mat karo
- ❌ API key ko **public documentation** me mat dalo

---

## 🔐 Local Development Setup (.env)

**`.env` file create karo:**
```bash
# WhatsApp Business API Configuration
WHATSAPP_API_KEY=YOUR_ACTUAL_API_KEY_HERE
WHATSAPP_BASE_URL=https://waba.xtendonline.com/v3
WHATSAPP_PHONE_NUMBER_ID=111266881902966
WHATSAPP_WABA_ID=100249586351323
```

**Code me use karo:**
```javascript
const apiKey = process.env.WHATSAPP_API_KEY;
const baseUrl = process.env.WHATSAPP_BASE_URL;

// Headers me add karo
headers: {
  'apikey': apiKey,
  'Content-Type': 'application/json'
}
```

**`.gitignore` me add karo:**
```
.env
.env.local
```

---

## 📞 Support Contact

Agar API key nahi mil raha, to:

1. **Xtend Online Support:**
   - Email: (check PDF me)
   - Phone: (check PDF me)
   - Dashboard: Support section

2. **Request Format:**
   ```
   Subject: WhatsApp Business API Key Request
   
   Hi,
   
   I need API key for WhatsApp Business API integration.
   
   Account Details:
   - Account ID: [Your Account ID]
   - Business Name: [Your Business Name]
   - Use Case: [Testing/Production]
   
   Please provide the API key.
   
   Thanks!
   ```

---

## 🧪 Quick Test Script

**Terminal me test karo:**
```bash
# Replace YOUR_API_KEY with actual key
curl -X GET "https://waba.xtendonline.com/v3/getuserdetails" \
  -H "apikey: YOUR_API_KEY"
```

**Expected:** User details mil jayega agar API key valid hai.

---

## 📋 Checklist

- [ ] API key Xtend Online dashboard se mil gaya
- [ ] API key valid hai (Get User Details test pass)
- [ ] Postman me environment variable set ho gaya
- [ ] Collection level authorization configure ho gaya
- [ ] `.env` file create ho gaya (local dev)
- [ ] `.gitignore` me `.env` add ho gaya
- [ ] API key safely store ho gaya

---

## 🔄 API Key Regenerate

Agar API key compromise ho gaya, to:

1. **Dashboard** → **API Settings**
2. **"Revoke Current Key"** click karo
3. **"Generate New Key"** click karo
4. **New key** copy karo
5. **All applications** me update karo

---

**API Key mil jane ke baad, Postman me test karo!** 🚀


