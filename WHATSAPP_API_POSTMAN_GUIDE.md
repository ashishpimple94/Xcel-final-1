# 📱 WhatsApp Business API - Postman Testing Guide

## 🎯 Base Configuration

**Base URL:** `https://waba.xtendonline.com/v3`

**Required Header:**
```
apikey: YOUR_WABA_API_KEY
Content-Type: application/json
```

---

## 📋 1. Send Text Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
  - Replace `111266881902966` with your `phone_number_id`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
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

**Expected Response:**
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

---

## 📋 2. Send Image Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg"
  }
}
```

**OR with Media ID (after upload):**
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

---

## 📋 3. Send Document Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "document",
  "document": {
    "link": "https://example.com/document.pdf",
    "filename": "document.pdf"
  }
}
```

---

## 📋 4. Send Video Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "video",
  "video": {
    "link": "https://example.com/video.mp4"
  }
}
```

---

## 📋 5. Send Audio Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "audio",
  "audio": {
    "link": "https://example.com/audio.mp3"
  }
}
```

---

## 📋 6. Send Location Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "location",
  "location": {
    "longitude": "72.8777",
    "latitude": "19.0760",
    "name": "Mumbai",
    "address": "Mumbai, Maharashtra"
  }
}
```

---

## 📋 7. Send Template Message (Text)

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
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

---

## 📋 8. Send Template Message (with Image Header)

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "template",
  "template": {
    "name": "image_template",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "id": "1537845180339361"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Hello"
          }
        ]
      }
    ]
  }
}
```

---

## 📋 9. Send Interactive Button Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "Choose an option:"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_yes",
            "title": "Yes"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_no",
            "title": "No"
          }
        }
      ]
    }
  }
}
```

---

## 📋 10. Send Interactive List Message

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": {
      "text": "Select an option:"
    },
    "action": {
      "button": "Menu",
      "sections": [
        {
          "title": "Options",
          "rows": [
            {
              "id": "opt_1",
              "title": "Option 1",
              "description": "First option"
            },
            {
              "id": "opt_2",
              "title": "Option 2",
              "description": "Second option"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 📋 11. Upload Media

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/media
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/media`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (form-data):**
  - Key: `sheet` (Type: **File**)
  - Value: Select image/video/document file

**Expected Response:**
```json
{
  "response": {
    "id": "1537845180339361"
  }
}
```

**Note:** Use this `id` in image/video/document messages.

---

## 📋 12. Download Media

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/downloadMedia/{{mediaid}}?phone_number_id={{phone_number_id}}
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/downloadMedia/1537845180339361?phone_number_id=111266881902966`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body:** Not needed

**Response:** Media file download hoga.

---

## 📋 13. Get Media URL

**Endpoint:**
```
GET https://waba.xtendonline.com/v3/{{mediaid}}?phone_number_id={{phone_number_id}}
```

**Postman Setup:**
- **Method:** `GET`
- **URL:** `https://waba.xtendonline.com/v3/1537845180339361?phone_number_id=111266881902966`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```

**Expected Response:**
```json
{
  "url": "https://waba.xtendonline.com/v3/whatsapp_business/attachments/?mid=7609700182448254&ext=1716536800&hash=...",
  "mime_type": "image/png",
  "sha256": "ee490eac2a7b038413ab2fb0bfc6db02d9a68e015d92e917fbcee9e324a96810",
  "file_size": 436484,
  "id": "7609700182448254",
  "messaging_product": "whatsapp"
}
```

---

## 📋 14. Delete Media

**Endpoint:**
```
DELETE https://waba.xtendonline.com/v3/{{mediaid}}?phone_number_id={{phone_number_id}}
```

**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `https://waba.xtendonline.com/v3/1537845180339361?phone_number_id=111266881902966`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```

**Expected Response:**
```json
{
  "success": true
}
```

---

## 📋 15. Create Text Template

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{wabaid}}/message_templates
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/100249586351323/message_templates`
  - Replace `100249586351323` with your `wabaid`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "name": "welcome_template",
  "category": "MARKETING",
  "components": [
    {
      "type": "BODY",
      "text": "Hello {{1}}, welcome to our service!"
    },
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Welcome {{1}}"
    },
    {
      "type": "FOOTER",
      "text": "Thank you"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "Button 1"
        },
        {
          "type": "QUICK_REPLY",
          "text": "Button 2"
        }
      ]
    }
  ],
  "language": "en_US",
  "allow_category_change": true
}
```

**Expected Response:**
```json
{
  "id": "123412341234123",
  "status": "APPROVED",
  "category": "MARKETING"
}
```

---

## 📋 16. Get All Templates

**Endpoint:**
```
GET https://waba.xtendonline.com/v3/{{wabaid}}/message_templates
```

**Postman Setup:**
- **Method:** `GET`
- **URL:** `https://waba.xtendonline.com/v3/100249586351323/message_templates`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```

**Expected Response:**
```json
{
  "data": [
    {
      "name": "welcome_template",
      "status": "APPROVED",
      "id": "123412341234123"
    }
  ]
}
```

---

## 📋 17. Get Template by ID

**Endpoint:**
```
GET https://waba.xtendonline.com/v3/{{msgtemplateid}}
```

**Postman Setup:**
- **Method:** `GET`
- **URL:** `https://waba.xtendonline.com/v3/123412341234123`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```

---

## 📋 18. Delete Template

**Endpoint:**
```
DELETE https://waba.xtendonline.com/v3/{{wabaid}}/message_templates?name={{templatename}}
```

**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `https://waba.xtendonline.com/v3/100249586351323/message_templates?name=welcome_template`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```

**Expected Response:**
```json
{
  "success": true
}
```

---

## 📋 19. Get User Details

**Endpoint:**
```
GET https://waba.xtendonline.com/v3/getuserdetails
```

**Postman Setup:**
- **Method:** `GET`
- **URL:** `https://waba.xtendonline.com/v3/getuserdetails`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```

**Expected Response:**
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

---

## 📋 20. Set Webhook

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/setwebhook
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/setwebhook`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "webhook_url": "https://your-webhook-url.com/webhook",
  "headers": {
    "header1": "value1",
    "header2": "value2"
  }
}
```

**Expected Response:**
```json
{
  "code": "200",
  "status": "Success",
  "message": "Your webhook has been configured successfully"
}
```

---

## 📋 21. Get Webhook

**Endpoint:**
```
GET https://waba.xtendonline.com/v3/{{phone_number_id}}/getwebhook
```

**Postman Setup:**
- **Method:** `GET`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/getwebhook`
- **Headers:**
  ```
  apikey: YOUR_WABA_API_KEY
  ```

---

## 📋 22. Mark Message as Read

**Endpoint:**
```
POST https://waba.xtendonline.com/v3/{{phone_number_id}}/messages
```

**Postman Setup:**
- **Method:** `POST`
- **URL:** `https://waba.xtendonline.com/v3/111266881902966/messages`
- **Headers:**
  ```
  Content-Type: application/json
  apikey: YOUR_WABA_API_KEY
  ```
- **Body (raw JSON):**
```json
{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "wamid.HBgMOTE5OTc4NTcyMTIwFQIAEhggQkNGQjk3OTg3NDI1MEVBNDQyRDExNzc1N0Q2ODc3MEMA"
}
```

---

## 🔑 Required Variables

Postman me **Environment Variables** set karo:

1. **New Environment** banao: "WhatsApp API"
2. Variables add karo:
   - `base_url` = `https://waba.xtendonline.com/v3`
   - `apikey` = `YOUR_WABA_API_KEY`
   - `phone_number_id` = `111266881902966`
   - `wabaid` = `100249586351323`
   - `recipient_phone` = `91XXXXXXXXXX`

3. Request me use karo:
   ```
   {{base_url}}/{{phone_number_id}}/messages
   ```
   Headers me:
   ```
   apikey: {{apikey}}
   ```

---

## ⚠️ Important Notes

1. **API Key:** Har request me `apikey` header required hai
2. **Phone Number Format:** `91XXXXXXXXXX` (country code + number)
3. **Template Name:** Template create karke approve hone ka wait karo
4. **Media Upload:** Pehle media upload karo, phir `id` use karo messages me
5. **Error Codes:** PDF me error codes table hai (page 220-221)

---

## 🧪 Testing Checklist

- [ ] Get User Details (to get `phone_number_id` aur `wabaid`)
- [ ] Send Text Message
- [ ] Upload Media
- [ ] Send Image Message
- [ ] Create Template
- [ ] Send Template Message
- [ ] Set Webhook
- [ ] Get All Templates

---

## 📝 Postman Collection Structure

```
WhatsApp Business API
├── Messages
│   ├── Send Text
│   ├── Send Image
│   ├── Send Video
│   ├── Send Document
│   ├── Send Location
│   ├── Send Template
│   └── Send Interactive
├── Media
│   ├── Upload Media
│   ├── Download Media
│   ├── Get Media URL
│   └── Delete Media
├── Templates
│   ├── Create Template
│   ├── Get All Templates
│   ├── Get Template by ID
│   └── Delete Template
└── Webhooks
    ├── Set Webhook
    └── Get Webhook
```

---

**Happy Testing! 📱**


