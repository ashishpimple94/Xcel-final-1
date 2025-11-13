import XLSX from 'xlsx';
import Voter from '../models/Voter.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { transliterate } from 'transliteration';

// Helper function to extract simple value from nested objects or complex structures
const extractSimpleValue = (value) => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's an object, try to extract the actual value
  if (typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    
    // Handle empty key objects like { "": "value" } or { "": null }
    if (keys.length === 1 && keys[0] === '') {
      const val = value[''];
      // If the value is null/undefined, return empty string
      if (val === null || val === undefined) {
        return '';
      }
      // If nested value is also an object, recursively extract
      if (typeof val === 'object' && !Array.isArray(val)) {
        return extractSimpleValue(val);
      }
      // Return the actual value as string
      return String(val).trim();
    }
    
    // Handle multiple keys - get the first meaningful value
    for (const key in value) {
      const val = value[key];
      // Skip null/undefined/empty strings
      if (val !== null && val !== undefined && val !== '') {
        // If nested value is also an object, recursively extract
        if (typeof val === 'object' && !Array.isArray(val)) {
          const extracted = extractSimpleValue(val);
          if (extracted !== '') {
            return extracted;
          }
        } else {
          return String(val).trim();
        }
      }
    }
    
    // If all values are null/undefined/empty, return empty string
    return '';
  }
  
  // For arrays, get first meaningful value
  if (Array.isArray(value) && value.length > 0) {
    const firstVal = value[0];
    if (firstVal !== null && firstVal !== undefined && firstVal !== '') {
      return extractSimpleValue(firstVal);
    }
  }
  
  // Convert to string and trim
  const strValue = String(value).trim();
  // Don't treat "null" or "undefined" as strings
  return strValue === 'null' || strValue === 'undefined' ? '' : strValue;
};

// Helper to normalize header names (remove trailing spaces, handle variations)
const normalizeHeader = (header) => {
  if (!header) return '';
  return String(header).trim();
};

export const uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Send file field as "file" using multipart/form-data.' });
  }

  // Handle both memory storage (Vercel) and disk storage (regular servers)
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL;
  const workbook = isVercel 
    ? XLSX.read(req.file.buffer, { type: 'buffer' }) // Vercel: read from memory buffer
    : XLSX.readFile(req.file.path); // Regular server: read from file path
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Mapping of Hindi/English column names (normalized) to English equivalents
  const hindiToEnglishMap = {
    // Serial Number variations
    'अनु क्र.': 'serialNumber',
    'अनु क्र': 'serialNumber',
    'sr no': 'serialNumber',
    'sr no.': 'serialNumber',
    'sr no': 'serialNumber',
    'serial number': 'serialNumber',
    // House Number variations
    'घर क्र.': 'houseNumber',
    'घर क्र': 'houseNumber',
    'घर क्र .': 'houseNumber',
    'house number': 'houseNumber',
    'house no': 'houseNumber',
    // Name variations
    'नाव': 'name',
    'name': 'name',
    'नाम': 'name',
    'Name': 'name',
    // Gender variations
    'लिंग': 'gender',
    'gender': 'gender',
    'Gender': 'gender',
    'लिंग ': 'gender',
    // Age variations
    'वय': 'age',
    'age': 'age',
    'उम्र': 'age',
    // Voter ID Card variations (with trailing spaces)
    'मतदान कार्ड क्र.': 'voterIdCard',
    'मतदान कार्ड क्र': 'voterIdCard',
    'मतदान कार्ड क्र .': 'voterIdCard',
    'voter id': 'voterIdCard',
    'voter id card': 'voterIdCard',
    'voterid': 'voterIdCard',
    // Mobile Number variations (with trailing spaces)
    'मोबाईल नं.': 'mobileNumber',
    'मोबाईल नं': 'mobileNumber',
    'मोबाईल नं .': 'mobileNumber',
    'मोबाइल नं.': 'mobileNumber',
    'mobile': 'mobileNumber',
    'mobile number': 'mobileNumber',
    'mobile no': 'mobileNumber',
    'phone': 'mobileNumber',
    'phone number': 'mobileNumber',
  };
  
  // Reverse mapping - if English column exists, we also check for Hindi equivalent
  const englishToHindiMap = {
    'name': 'नाव',
    'gender': 'लिंग',
    'age': 'वय',
    'serialNumber': 'अनु क्र.',
    'houseNumber': 'घर क्र.',
    'voterIdCard': 'मतदान कार्ड क्र.',
    'mobileNumber': 'मोबाईल नं.',
  };
  
  // Get the range of the sheet to know all columns
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  
  // Read first row as headers with array format - ensure we get ALL columns
  const headerArray = XLSX.utils.sheet_to_json(sheet, { 
    header: 1, 
    defval: '', 
    range: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } })
  })[0] || [];
  
  // Normalize and get valid headers - create a map of original to normalized
  const headerMap = {}; // Maps normalized header to original header
  const headers = headerArray
    .map((h) => {
      const normalized = normalizeHeader(h);
      if (normalized && normalized !== '') {
        headerMap[normalized] = normalized; // Store normalized version
        return normalized;
      }
      return null;
    })
    .filter(h => h !== null && h !== '');
  
  // Check if English columns already exist in Excel
  const hasEnglishColumns = headers.some(h => {
    const lower = h.toLowerCase();
    return lower === 'name' || lower === 'gender' || lower === 'age' || 
           lower === 'serialnumber' || lower === 'housenumber' || 
           lower === 'voteridcard' || lower === 'mobilenumber';
  });
  
  console.log('Headers found in Excel:', headers);
  console.log('Has English columns:', hasEnglishColumns);
  
  // If no valid headers found, return error
  if (headers.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Excel file has no valid headers in the first row.' 
    });
  }
  
  // Convert entire sheet to array format first to preserve ALL columns and positions
  const allRowsArray = XLSX.utils.sheet_to_json(sheet, { 
    header: 1, 
    defval: '', 
    blankrows: false 
  });
  
  // Now convert to object format ensuring ALL headers are present in EVERY row
  // AND add English column equivalents
  const normalizedRows = allRowsArray.slice(1).map((rowArray) => {
    const rowObj = {};
    
    // Map each header to its corresponding column value
    headerArray.forEach((header, colIndex) => {
      const normalizedHeader = normalizeHeader(header);
      if (normalizedHeader && normalizedHeader !== '') {
        // Get value from array position
        const cellValue = rowArray[colIndex];
        
        // Extract simple value (flatten nested objects)
        let finalValue = extractSimpleValue(cellValue);
        
        // Handle age field - try to convert to number
        if (normalizedHeader === 'वय' || normalizedHeader.toLowerCase() === 'age') {
          const numValue = Number(finalValue);
          if (!isNaN(numValue) && finalValue !== '') {
            finalValue = numValue;
          }
        }
        
        // Store with normalized header name (could be Hindi or English)
        rowObj[normalizedHeader] = finalValue;
        
        // Check if this is an English column that needs Hindi mapping
        const lowerHeader = normalizedHeader.toLowerCase().replace(/\s+/g, '');
        let hindiName = null;
        
        if (lowerHeader === 'name') {
          hindiName = 'नाव';
        } else if (lowerHeader === 'gender') {
          hindiName = 'लिंग';
        } else if (lowerHeader === 'age') {
          hindiName = 'वय';
        } else if (lowerHeader === 'serialnumber' || lowerHeader === 'srno') {
          hindiName = 'अनु क्र.';
        } else if (lowerHeader === 'housenumber' || lowerHeader === 'houseno') {
          hindiName = 'घर क्र.';
        } else if (lowerHeader === 'voteridcard' || lowerHeader === 'voterid') {
          hindiName = 'मतदान कार्ड क्र.';
        } else if (lowerHeader === 'mobilenumber' || lowerHeader === 'mobileno' || lowerHeader === 'mobile' || lowerHeader === 'phone') {
          hindiName = 'मोबाईल नं.';
        }
        
        if (hindiName && !(hindiName in rowObj)) {
          rowObj[hindiName] = finalValue;
        }
        
        // Also add English equivalent if mapping exists (for Hindi headers)
        // Try multiple methods to find the mapping
        let englishKey = hindiToEnglishMap[normalizedHeader];
        
        // If not found, try with trimmed version
        if (!englishKey) {
          const trimmed = normalizedHeader.trim();
          englishKey = hindiToEnglishMap[trimmed];
        }
        
        // Direct mapping for common Hindi/English fields (guaranteed fallback)
        // Handle exact field names as provided by user: SR NO, घर क्र., लिंग, वय, मतदान कार्ड क्र., मोबाईल नं ., Name, Gender
        if (!englishKey) {
          const trimmed = normalizedHeader.trim();
          const lowerTrimmed = trimmed.toLowerCase();
          
          // SR NO variations (user field: SR NO)
          if (lowerTrimmed === 'sr no' || lowerTrimmed === 'sr no.' || 
              trimmed === 'SR NO' || trimmed.startsWith('SR NO') || 
              trimmed === 'अनु क्र.' || trimmed.startsWith('अनु क्र')) {
            englishKey = 'serialNumber';
          }
          // घर क्र. variations (user field: घर क्र.)
          else if (trimmed === 'घर क्र.' || trimmed === 'घर क्र' || 
                   trimmed === 'घर क्र .' || trimmed.startsWith('घर क्र')) {
            englishKey = 'houseNumber';
          }
          // लिंग variations (user field: लिंग)
          else if (trimmed === 'लिंग' || trimmed === 'लिंग ' || 
                   lowerTrimmed === 'gender' || trimmed === 'Gender') {
            englishKey = 'gender';
          }
          // वय variations (user field: वय)
          else if (trimmed === 'वय' || lowerTrimmed === 'age' || trimmed === 'Age') {
            englishKey = 'age';
          }
          // मतदान कार्ड क्र. variations (user field: मतदान कार्ड क्र.)
          else if (trimmed === 'मतदान कार्ड क्र.' || trimmed === 'मतदान कार्ड क्र' || 
                   trimmed === 'मतदान कार्ड क्र .' || trimmed === 'मतदान कार्ड क्र ' ||
                   trimmed.startsWith('मतदान कार्ड')) {
            englishKey = 'voterIdCard';
          }
          // मोबाईल नं . variations (user field: मोबाईल नं .)
          else if (trimmed === 'मोबाईल नं.' || trimmed === 'मोबाईल नं' || 
                   trimmed === 'मोबाईल नं .' || trimmed === 'मोबाईल नं ' ||
                   trimmed.startsWith('मोबाईल नं')) {
            englishKey = 'mobileNumber';
          }
          // Name variations (user field: Name)
          else if (trimmed === 'नाव' || lowerTrimmed === 'name' || 
                   trimmed === 'Name' || trimmed === 'NAME') {
            englishKey = 'name';
          }
        }
        
        // Always add English equivalent if we found one
        if (englishKey) {
          // For age field, store as number in English version
          if (englishKey === 'age' && typeof finalValue === 'string' && finalValue !== '') {
            const numValue = Number(finalValue);
            rowObj[englishKey] = !isNaN(numValue) ? numValue : finalValue;
          } 
          // For gender field, translate to English (Male/Female)
          else if (englishKey === 'gender') {
            const genderStr = String(finalValue).trim();
            if (genderStr === 'पुरुष' || genderStr.toLowerCase().includes('purush') || genderStr.toLowerCase().includes('male')) {
              rowObj[englishKey] = 'Male';
            } else if (genderStr === 'स्त्री' || genderStr.toLowerCase().includes('stri') || genderStr.toLowerCase().includes('female')) {
              rowObj[englishKey] = 'Female';
            } else {
              rowObj[englishKey] = finalValue;
            }
          }
          // For name field, transliterate from Hindi to English
          else if (englishKey === 'name') {
            const nameValue = String(finalValue).trim();
            if (nameValue) {
              // Check if it's Hindi text
              const isHindi = /[\u0900-\u097F]/.test(nameValue);
              if (isHindi) {
                try {
                  const transliterated = transliterate(nameValue);
                  // Format: Capitalize first letter of each word and fix double vowels
                  const formatted = transliterated.split(' ').map(word => {
                    if (word.length === 0) return word;
                    const fixed = word.toLowerCase()
                      .replace(/ii/g, 'i')
                      .replace(/aa/g, 'a')
                      .replace(/uu/g, 'u')
                      .replace(/ee/g, 'e')
                      .replace(/oo/g, 'o');
                    return fixed.charAt(0).toUpperCase() + fixed.slice(1);
                  }).join(' ');
                  rowObj[englishKey] = formatted;
                } catch (e) {
                  console.error('Transliteration error during upload:', e);
                  rowObj[englishKey] = nameValue;
                }
              } else {
                // Already in English, format properly
                rowObj[englishKey] = nameValue.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
              }
            } else {
              rowObj[englishKey] = finalValue;
            }
          }
          else {
            rowObj[englishKey] = finalValue;
          }
        }
      }
    });
    
    // CRITICAL: Ensure EVERY header field exists in this row (both Hindi and English)
    headers.forEach(header => {
      // Ensure normalized header exists (could be Hindi or English)
      if (!(header in rowObj)) {
        rowObj[header] = '';
      }
      
      // If this is a Hindi header, ensure English equivalent exists
      let englishKey = hindiToEnglishMap[header];
      
      // Try with trimmed version
      if (!englishKey) {
        const trimmed = header.trim();
        englishKey = hindiToEnglishMap[trimmed];
      }
      
      // Direct fallback mapping for common Hindi/English fields
      // Handle exact field names as provided: SR NO, घर क्र., लिंग, वय, मतदान कार्ड क्र., मोबाईल नं ., Name, Gender
      if (!englishKey) {
        const trimmed = header.trim();
        const lowerTrimmed = trimmed.toLowerCase();
        
        // SR NO (user specified field)
        if (lowerTrimmed === 'sr no' || lowerTrimmed === 'sr no.' || 
            trimmed === 'SR NO' || trimmed.startsWith('SR NO') || 
            trimmed === 'अनु क्र.' || trimmed.startsWith('अनु क्र')) {
          englishKey = 'serialNumber';
        }
        // घर क्र. (user specified field - with/without period)
        else if (trimmed === 'घर क्र.' || trimmed === 'घर क्र' || 
                 trimmed === 'घर क्र .' || trimmed.startsWith('घर क्र')) {
          englishKey = 'houseNumber';
        }
        // लिंग / Gender (user specified field)
        else if (trimmed === 'लिंग' || trimmed === 'लिंग ' || 
                 lowerTrimmed === 'gender' || trimmed === 'Gender') {
          englishKey = 'gender';
        }
        // वय / Age (user specified field)
        else if (trimmed === 'वय' || lowerTrimmed === 'age' || trimmed === 'Age') {
          englishKey = 'age';
        }
        // मतदान कार्ड क्र. (user specified field - with trailing space variations)
        else if (trimmed === 'मतदान कार्ड क्र.' || trimmed === 'मतदान कार्ड क्र' || 
                 trimmed === 'मतदान कार्ड क्र .' || trimmed === 'मतदान कार्ड क्र ' ||
                 trimmed.startsWith('मतदान कार्ड')) {
          englishKey = 'voterIdCard';
        }
        // मोबाईल नं . (user specified field - with trailing space)
        else if (trimmed === 'मोबाईल नं.' || trimmed === 'मोबाईल नं' || 
                 trimmed === 'मोबाईल नं .' || trimmed === 'मोबाईल नं ' ||
                 trimmed.startsWith('मोबाईल नं')) {
          englishKey = 'mobileNumber';
        }
        // Name / नाव (user specified field: Name)
        else if (trimmed === 'नाव' || lowerTrimmed === 'name' || 
                 trimmed === 'Name' || trimmed === 'NAME') {
          englishKey = 'name';
        }
      }
      
      // Ensure English column exists (force add if missing)
      if (englishKey) {
        if (!(englishKey in rowObj)) {
          const sourceValue = rowObj[header] || '';
          // Handle age conversion
          if (englishKey === 'age' && typeof sourceValue === 'string' && sourceValue !== '') {
            const numValue = Number(sourceValue);
            rowObj[englishKey] = !isNaN(numValue) ? numValue : sourceValue;
          } 
          // Handle gender translation
          else if (englishKey === 'gender') {
            const genderStr = String(sourceValue).trim();
            if (genderStr === 'पुरुष' || genderStr.toLowerCase().includes('purush') || genderStr.toLowerCase().includes('male')) {
              rowObj[englishKey] = 'Male';
            } else if (genderStr === 'स्त्री' || genderStr.toLowerCase().includes('stri') || genderStr.toLowerCase().includes('female')) {
              rowObj[englishKey] = 'Female';
            } else {
              rowObj[englishKey] = sourceValue;
            }
          }
          else {
            rowObj[englishKey] = sourceValue;
          }
        } else if (englishKey === 'gender') {
          // If gender already exists, ensure it's translated
          const currentGender = String(rowObj[englishKey]).trim();
          if (currentGender === 'पुरुष' || currentGender.toLowerCase().includes('purush')) {
            rowObj[englishKey] = 'Male';
          } else if (currentGender === 'स्त्री' || currentGender.toLowerCase().includes('stri')) {
            rowObj[englishKey] = 'Female';
          }
        }
      }
      
      // If this is an English header, ensure Hindi equivalent exists
      const lowerHeader = header.toLowerCase().replace(/\s+/g, '');
      let hindiName = null;
      
      if (lowerHeader === 'name') {
        hindiName = 'नाव';
      } else if (lowerHeader === 'gender') {
        hindiName = 'लिंग';
      } else if (lowerHeader === 'age') {
        hindiName = 'वय';
      } else if (lowerHeader === 'serialnumber' || lowerHeader === 'srno') {
        hindiName = 'अनु क्र.';
      } else if (lowerHeader === 'housenumber' || lowerHeader === 'houseno') {
        hindiName = 'घर क्र.';
      } else if (lowerHeader === 'voteridcard' || lowerHeader === 'voterid') {
        hindiName = 'मतदान कार्ड क्र.';
      } else if (lowerHeader === 'mobilenumber' || lowerHeader === 'mobileno' || lowerHeader === 'mobile' || lowerHeader === 'phone') {
        hindiName = 'मोबाईल नं.';
      }
      
      if (hindiName && !(hindiName in rowObj)) {
        rowObj[hindiName] = rowObj[header] || '';
      }
    });
    
    // CRITICAL: Flatten any nested objects FIRST (before any other operations)
    Object.keys(rowObj).forEach(key => {
      const value = rowObj[key];
      
      // Flatten nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const flattened = extractSimpleValue(value);
        rowObj[key] = flattened;
      } 
      // Convert null/undefined to empty string
      else if (value === null || value === undefined) {
        rowObj[key] = '';
      }
      // Ensure strings are trimmed
      else if (typeof value === 'string') {
        rowObj[key] = value.trim();
      }
    });
    
    // AGGRESSIVE cleanup: Remove ALL unwanted keys
    const keysToDelete = [];
    Object.keys(rowObj).forEach(key => {
      const trimmedKey = String(key).trim();
      
      // Remove __EMPTY variations (case insensitive)
      if (trimmedKey.toLowerCase().startsWith('__empty') || 
          trimmedKey.toLowerCase().startsWith('empty') ||
          trimmedKey === '' || 
          key === null || 
          key === undefined ||
          /^\d+$/.test(trimmedKey)) { // Remove numeric keys (column indices)
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => delete rowObj[key]);
    
    // SECOND PASS: Final cleanup - remove any remaining nested structures or null values
    Object.keys(rowObj).forEach(key => {
      const value = rowObj[key];
      
      // Flatten any remaining nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const flattened = extractSimpleValue(value);
        rowObj[key] = flattened === '' ? '' : flattened;
      }
      // Replace null/undefined with empty string
      else if (value === null || value === undefined) {
        rowObj[key] = '';
      }
      // Clean up string values
      else if (typeof value === 'string' && (value === 'null' || value === 'undefined')) {
        rowObj[key] = '';
      }
    });
    
    // FINAL PASS: Force add English columns for all Hindi fields (after cleanup)
    // This MUST work for all variations including trailing spaces
    const hindiToEnglishFinalMap = {
      // Serial Number
      'sr no': 'serialNumber',
      'sr no.': 'serialNumber',
      'अनु क्र.': 'serialNumber',
      'अनु क्र': 'serialNumber',
      // House Number (all variations)
      'घर क्र.': 'houseNumber',
      'घर क्र': 'houseNumber',
      'घर क्र .': 'houseNumber',
      // Name
      'नाव': 'name',
      'Name': 'name',
      // Gender (all variations with trailing spaces)
      'लिंग': 'gender',
      'लिंग ': 'gender',
      'Gender': 'gender',
      // Age
      'वय': 'age',
      'Age': 'age',
      // Voter ID Card
      'मतदान कार्ड क्र.': 'voterIdCard',
      'मतदान कार्ड क्र': 'voterIdCard',
      'मतदान कार्ड क्र .': 'voterIdCard',
      'मतदान कार्ड क्र ': 'voterIdCard',
      // Mobile Number
      'मोबाईल नं.': 'mobileNumber',
      'मोबाईल नं': 'mobileNumber',
      'मोबाईल नं .': 'mobileNumber',
      'मोबाईल नं ': 'mobileNumber'
    };
    
    // FORCE ADD English columns - check every key in rowObj
    Object.keys(rowObj).forEach(key => {
      const trimmedKey = key.trim();
      
      // Direct match
      if (key in hindiToEnglishFinalMap) {
        const englishKey = hindiToEnglishFinalMap[key];
        const sourceValue = rowObj[key];
        if (!(englishKey in rowObj)) {
          if (englishKey === 'age' && typeof sourceValue === 'string' && sourceValue !== '') {
            const numValue = Number(sourceValue);
            rowObj[englishKey] = !isNaN(numValue) ? numValue : sourceValue;
          } else {
            rowObj[englishKey] = sourceValue;
          }
        }
      }
      // Trimmed match
      else if (trimmedKey in hindiToEnglishFinalMap) {
        const englishKey = hindiToEnglishFinalMap[trimmedKey];
        const sourceValue = rowObj[key];
        if (!(englishKey in rowObj)) {
          if (englishKey === 'age' && typeof sourceValue === 'string' && sourceValue !== '') {
            const numValue = Number(sourceValue);
            rowObj[englishKey] = !isNaN(numValue) ? numValue : sourceValue;
          } else {
            rowObj[englishKey] = sourceValue;
          }
        }
      }
      // Check for Hindi fields by content (fallback)
      else if (trimmedKey === 'नाव' || key.includes('नाव')) {
        if (!('name' in rowObj)) {
          rowObj['name'] = rowObj[key] || '';
        }
      }
      else if (trimmedKey === 'लिंग' || trimmedKey.startsWith('लिंग')) {
        if (!('gender' in rowObj)) {
          rowObj['gender'] = rowObj[key] || '';
        }
      }
      else if (trimmedKey === 'वय') {
        if (!('age' in rowObj)) {
          const val = rowObj[key] || '';
          const numValue = Number(val);
          rowObj['age'] = !isNaN(numValue) && val !== '' ? numValue : val;
        }
      }
    });
    
    // CRITICAL FINAL CHECK: Force ensure name and gender exist if Hindi fields exist
    // This is the LAST resort - check all possible variations
    const allKeys = Object.keys(rowObj);
    
    // Helper function to transliterate name
    const transliterateNameForUpload = (nameValue) => {
      if (!nameValue || nameValue === '') return '';
      const nameStr = String(nameValue).trim();
      const isHindi = /[\u0900-\u097F]/.test(nameStr);
      if (isHindi) {
        try {
          const transliterated = transliterate(nameStr);
          return transliterated.split(' ').map(word => {
            if (word.length === 0) return word;
            const fixed = word.toLowerCase()
              .replace(/ii/g, 'i')
              .replace(/aa/g, 'a')
              .replace(/uu/g, 'u')
              .replace(/ee/g, 'e')
              .replace(/oo/g, 'o');
            return fixed.charAt(0).toUpperCase() + fixed.slice(1);
          }).join(' ');
        } catch (e) {
          console.error('Transliteration error:', e);
          return nameStr;
        }
      }
      return nameStr.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };
    
    // Find नाव field (any variation)
    const navKey = allKeys.find(k => k.trim() === 'नाव' || k.includes('नाव'));
    if (navKey && !('name' in rowObj)) {
      const nameValue = rowObj[navKey] || '';
      rowObj['name'] = transliterateNameForUpload(nameValue);
    }
    // Also check for Name field directly (user field: Name)
    if ('Name' in rowObj && !('name' in rowObj)) {
      const nameValue = rowObj['Name'];
      rowObj['name'] = transliterateNameForUpload(nameValue);
    }
    // If name already exists, transliterate it
    if ('name' in rowObj && rowObj['name']) {
      rowObj['name'] = transliterateNameForUpload(rowObj['name']);
    }
    
    // Find लिंग field (any variation including trailing spaces) - user field: लिंग
    const lingKey = allKeys.find(k => {
      const trimmed = k.trim();
      return trimmed === 'लिंग' || trimmed.startsWith('लिंग');
    });
    if (lingKey && !('gender' in rowObj)) {
      // Translate gender value to English
      const genderValue = rowObj[lingKey] || '';
      const genderStr = String(genderValue).trim();
      if (genderStr === 'पुरुष' || genderStr.toLowerCase().includes('purush') || genderStr.toLowerCase().includes('male')) {
        rowObj['gender'] = 'Male';
      } else if (genderStr === 'स्त्री' || genderStr.toLowerCase().includes('stri') || genderStr.toLowerCase().includes('female')) {
        rowObj['gender'] = 'Female';
      } else {
        rowObj['gender'] = genderValue;
      }
    }
    // Also check for Gender field directly (user field: Gender) and translate
    if ('Gender' in rowObj) {
      const genderValue = rowObj['Gender'];
      const genderStr = String(genderValue).trim();
      if (!('gender' in rowObj)) {
        if (genderStr === 'पुरुष' || genderStr.toLowerCase().includes('purush') || genderStr.toLowerCase().includes('male')) {
          rowObj['gender'] = 'Male';
        } else if (genderStr === 'स्त्री' || genderStr.toLowerCase().includes('stri') || genderStr.toLowerCase().includes('female')) {
          rowObj['gender'] = 'Female';
        } else {
          rowObj['gender'] = genderValue;
        }
      } else {
        // Translate existing gender if needed
        const currentGender = String(rowObj['gender']).trim();
        if (currentGender === 'पुरुष' || currentGender.toLowerCase().includes('purush')) {
          rowObj['gender'] = 'Male';
        } else if (currentGender === 'स्त्री' || currentGender.toLowerCase().includes('stri')) {
          rowObj['gender'] = 'Female';
        }
      }
    }
    
    // Find वय field
    const vayKey = allKeys.find(k => k.trim() === 'वय');
    if (vayKey && !('age' in rowObj)) {
      const val = rowObj[vayKey];
      if (val !== null && val !== undefined && val !== '') {
        const numValue = Number(val);
        rowObj['age'] = !isNaN(numValue) ? numValue : val;
      }
    }
    
    // Find घर क्र field
    const gharKey = allKeys.find(k => {
      const trimmed = k.trim();
      return trimmed === 'घर क्र' || trimmed === 'घर क्र.' || trimmed.startsWith('घर क्र');
    });
    if (gharKey && !('houseNumber' in rowObj)) {
      rowObj['houseNumber'] = rowObj[gharKey] || '';
    }
    
    // Find मतदान कार्ड क्र field
    const voterKey = allKeys.find(k => {
      const trimmed = k.trim();
      return trimmed.includes('मतदान') || trimmed.includes('कार्ड');
    });
    if (voterKey && !('voterIdCard' in rowObj)) {
      rowObj['voterIdCard'] = rowObj[voterKey] || '';
    }
    
    // Find मोबाईल नं field
    const mobileKey = allKeys.find(k => {
      const trimmed = k.trim();
      return trimmed.includes('मोबाईल') || trimmed.includes('मोबाइल');
    });
    if (mobileKey && !('mobileNumber' in rowObj)) {
      rowObj['mobileNumber'] = rowObj[mobileKey] || '';
    }
    
    // Find SR NO field
    const srNoKey = allKeys.find(k => {
      const lower = k.toLowerCase();
      return lower === 'sr no' || lower === 'sr no.' || lower.startsWith('sr no');
    });
    if (srNoKey && !('serialNumber' in rowObj)) {
      rowObj['serialNumber'] = rowObj[srNoKey] || '';
    }
    
    return rowObj;
  }).filter(row => {
    // Remove completely empty rows (all values are empty strings)
    return Object.values(row).some(val => {
      return val !== '' && val !== null && val !== undefined && 
             !(typeof val === 'object' && Object.keys(val).length === 0);
    });
  });

  if (!normalizedRows.length) {
    return res.status(400).json({ success: false, message: 'Uploaded Excel is empty.' });
  }

  // Get all English field names that will be added
  const englishFields = [...new Set(headers.map(h => hindiToEnglishMap[h]).filter(Boolean))];

  console.log(`Processing ${normalizedRows.length} rows with ${headers.length} Hindi fields`);
  console.log('Hindi headers detected:', headers);
  console.log('English fields added:', englishFields);
  
  // Verify English columns in first row
  const firstRow = normalizedRows[0];
  const hasName = 'name' in firstRow;
  const hasGender = 'gender' in firstRow;
  console.log('\n=== ENGLISH COLUMNS VERIFICATION ===');
  console.log('Has "name" column:', hasName, hasName ? `(${firstRow.name})` : '');
  console.log('Has "gender" column:', hasGender, hasGender ? `(${firstRow.gender})` : '');
  console.log('All English columns in first row:', Object.keys(firstRow).filter(k => 
    ['name', 'gender', 'age', 'serialNumber', 'houseNumber', 'voterIdCard', 'mobileNumber'].includes(k)
  ));
  
  console.log('\nSample row (first row):', JSON.stringify(normalizedRows[0], null, 2));
  console.log('Sample row field count:', Object.keys(normalizedRows[0]).length);
  console.log('Sample row all keys:', Object.keys(normalizedRows[0]));

  // Ensure MongoDB connection is ready before insert
  console.log('\n📊 Preparing to insert data into MongoDB...');
  console.log('   Rows to insert:', normalizedRows.length);
  
  const mongoose = await import('mongoose');
  console.log('   Current connection state:', mongoose.default.connection.readyState);
  console.log('   Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
  
  if (mongoose.default.connection.readyState !== 1) {
    console.log('   Connection not ready, establishing connection...');
    const connectDB = (await import('../config/db.js')).default;
    try {
      await connectDB();
    } catch (connError) {
      console.error('❌ Connection error:', connError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to connect to MongoDB',
        error: connError.message,
        details: 'Please check MONGODB_URI environment variable'
      });
    }
    
    // Wait for connection to be ready (max 10 seconds)
    let attempts = 0;
    const maxAttempts = 200;
    while (mongoose.default.connection.readyState !== 1 && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (mongoose.default.connection.readyState !== 1) {
      console.error('❌ Connection timeout after', maxAttempts * 50, 'ms');
      return res.status(500).json({ 
        success: false, 
        message: 'MongoDB connection timeout',
        details: 'Connection not ready after 10 seconds. Check MONGODB_URI and network access.'
      });
    }
    console.log('✅ Connection established successfully!');
  } else {
    console.log('✅ Using existing connection');
  }
  
  console.log('   Final connection state:', mongoose.default.connection.readyState);
  console.log('   Database name:', mongoose.default.connection.name);
  console.log('   Host:', mongoose.default.connection.host);
  
  // Attempt to insert data
  try {
    console.log('   Starting insert operation...');
    const inserted = await Voter.insertMany(normalizedRows, { 
      ordered: false,
      maxTimeMS: 60000 // 60 seconds for large inserts
    });
    console.log('✅ Successfully inserted', inserted.length, 'records');
    
    return res.status(201).json({
      success: true,
      message: 'Data uploaded successfully.',
      insertedCount: inserted.length,
      fieldsDetected: headers.length,
      hindiFields: headers,
      englishFields: englishFields,
      fieldNames: [...headers, ...englishFields],
      sampleRow: normalizedRows[0],
      note: 'Use GET /api/voters?page=1&limit=100 to fetch data with pagination'
    });
  } catch (insertError) {
    console.error('❌ Insert error:', insertError.message);
    console.error('   Error code:', insertError.code);
    console.error('   Error name:', insertError.name);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to insert data into MongoDB';
    if (insertError.message.includes('authentication')) {
      errorMessage = 'MongoDB authentication failed. Check username and password in MONGODB_URI';
    } else if (insertError.message.includes('network') || insertError.message.includes('timeout')) {
      errorMessage = 'MongoDB network error. Check network access and connection string';
    } else if (insertError.message.includes('E11000')) {
      errorMessage = 'Duplicate key error. Some records already exist in database';
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: insertError.message,
      details: 'Check MongoDB connection string and network access'
    });
  }

});

// Helper function to add English columns to voter records
const addEnglishColumns = (voter) => {
  const voterObj = { ...voter };
  
  // Convert MongoDB ObjectId to string format
  if (voterObj._id) {
    voterObj._id = voterObj._id.toString ? voterObj._id.toString() : String(voterObj._id);
  }
  
  // Helper to get value from nested objects and handle null
  const getValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object' && !Array.isArray(val)) {
      // Handle nested objects like { "": null } or { "": "value" }
      if ('' in val) {
        const innerVal = val[''];
        return innerVal === null || innerVal === undefined ? '' : String(innerVal).trim();
      }
      // Get first meaningful value
      const values = Object.values(val);
      for (const v of values) {
        if (v !== null && v !== undefined && v !== '') {
          return String(v).trim();
        }
      }
      return '';
    }
    // Convert to string and trim, handle null
    const strVal = String(val).trim();
    return strVal === 'null' || strVal === 'undefined' ? '' : strVal;
  };
  
  // FIRST: Flatten ALL nested objects and remove null values
  const keysToDelete = [];
  const keysToProcess = Object.keys(voterObj);
  
  keysToProcess.forEach(key => {
    // Skip MongoDB internal fields (but we'll delete __EMPTY)
    if (key === '_id' || key === 'createdAt' || key === 'updatedAt') {
      return;
    }
    
    // Delete __EMPTY fields and __v
    if (key.startsWith('__EMPTY') || key === '__v') {
      keysToDelete.push(key);
      return;
    }
    
    const value = voterObj[key];
    
    // Flatten nested objects - CRITICAL: Do this for ALL object types
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const flattened = getValue(value);
      voterObj[key] = flattened; // Always set to flattened value (even if empty string)
    }
    // Convert null/undefined to empty string
    else if (value === null || value === undefined) {
      voterObj[key] = '';
    }
    // Ensure strings are trimmed
    else if (typeof value === 'string') {
      voterObj[key] = value.trim();
    }
  });
  
  // Delete unwanted keys
  keysToDelete.forEach(key => delete voterObj[key]);
  
  // NOW add English columns from flattened data
  
  // Helper function to check if text contains Devanagari/Hindi characters
  const isHindiText = (text) => {
    if (!text) return false;
    // Devanagari Unicode range: U+0900 to U+097F
    return /[\u0900-\u097F]/.test(String(text));
  };
  
  // Helper function to transliterate Hindi to English and format it
  const transliterateName = (hindiName) => {
    if (!hindiName || hindiName === '') return '';
    const nameStr = String(hindiName).trim();
    if (!isHindiText(nameStr)) {
      // Already in English, just return with proper capitalization
      return nameStr.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    // Transliterate from Hindi to English
    try {
      const transliterated = transliterate(nameStr);
      // Format: Capitalize first letter of each word
      return transliterated.split(' ').map(word => {
        if (word.length === 0) return word;
        // Handle double vowels (ii -> i, aa -> a) for better English formatting
        const formatted = word.toLowerCase()
          .replace(/ii/g, 'i')
          .replace(/aa/g, 'a')
          .replace(/uu/g, 'u')
          .replace(/ee/g, 'e')
          .replace(/oo/g, 'o');
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }).join(' ');
    } catch (e) {
      console.error('Transliteration error:', e);
      return nameStr; // Fallback to original if transliteration fails
    }
  };
  
  // Add name from नाव or Name (Priority: Name field first, then नाव)
  let nameValue = '';
  if (!voterObj.name || voterObj.name === '') {
    // First check for "Name" field (English column from Excel)
    if (voterObj['Name'] && voterObj['Name'] !== '' && voterObj['Name'] !== null) {
      nameValue = String(voterObj['Name']).trim();
    }
    // Then check for नाव (Hindi column)
    else if (voterObj['नाव'] && voterObj['नाव'] !== '' && voterObj['नाव'] !== null) {
      nameValue = String(voterObj['नाव']).trim();
    } else {
      // Try to find any field with नाव
      const navKey = Object.keys(voterObj).find(k => {
        const trimmed = k.trim();
        return trimmed === 'नाव' || (trimmed !== 'Name' && trimmed.includes('नाव'));
      });
      if (navKey && voterObj[navKey] && voterObj[navKey] !== '' && voterObj[navKey] !== null) {
        nameValue = String(voterObj[navKey]).trim();
      }
    }
  } else {
    nameValue = String(voterObj.name).trim();
  }
  
  // Also check if Name field exists separately
  if (voterObj['Name'] && voterObj['Name'] !== '' && voterObj['Name'] !== null) {
    const nameFieldValue = String(voterObj['Name']).trim();
    // If Name field is English (not Hindi), use it; otherwise use transliterated version
    if (!isHindiText(nameFieldValue)) {
      nameValue = nameFieldValue;
    } else if (!nameValue || nameValue === '') {
      nameValue = nameFieldValue;
    }
  }
  
  // Transliterate name if it's in Hindi, otherwise keep as is
  if (nameValue) {
    voterObj.name = transliterateName(nameValue);
  }
  
  // Gender translation map (Hindi to English) - CRITICAL function
  const genderTranslate = (genderValue) => {
    if (!genderValue || genderValue === '') return '';
    const val = String(genderValue).trim();
    const lowerVal = val.toLowerCase();
    
    // Check for exact Hindi matches first
    if (val === 'पुरुष' || lowerVal === 'purush' || lowerVal.includes('male') || lowerVal === 'male') {
      return 'Male';
    } else if (val === 'स्त्री' || lowerVal === 'stri' || lowerVal.includes('female') || lowerVal === 'female') {
      return 'Female';
    }
    // If already in English, keep it
    else if (val === 'Male' || val === 'Female') {
      return val;
    }
    // Return empty string for unknown values
    return '';
  };
  
  // Add gender from लिंग or Gender
  let genderValue = '';
  const lingKeys = Object.keys(voterObj).filter(k => {
    const trimmed = k.trim();
    return trimmed === 'लिंग' || trimmed.startsWith('लिंग');
  });
  if (lingKeys.length > 0 && voterObj[lingKeys[0]] && voterObj[lingKeys[0]] !== '') {
    genderValue = String(voterObj[lingKeys[0]]).trim();
  } else if (voterObj['Gender'] && voterObj['Gender'] !== '' && voterObj['Gender'] !== null) {
    genderValue = String(voterObj['Gender']).trim();
  } else if (voterObj['gender'] && voterObj['gender'] !== '' && voterObj['gender'] !== null) {
    genderValue = String(voterObj['gender']).trim();
  }
  
  // ALWAYS translate gender to English (Male/Female)
  if (genderValue) {
    voterObj.gender = genderTranslate(genderValue);
  } else if (voterObj.gender) {
    // If gender exists but we didn't get value, still translate it
    voterObj.gender = genderTranslate(voterObj.gender);
  }
  
  // Add age from वय
  if (!voterObj.age && voterObj['वय']) {
    const val = String(voterObj['वय']).trim();
    if (val !== '') {
      const numValue = Number(val);
      voterObj.age = !isNaN(numValue) ? numValue : val;
    }
  }
  
  // Add houseNumber from घर क्र (flatten if needed)
  if (!voterObj.houseNumber || voterObj.houseNumber === '') {
    const gharKeys = Object.keys(voterObj).filter(k => {
      const trimmed = k.trim();
      return trimmed === 'घर क्र' || trimmed === 'घर क्र.' || trimmed.startsWith('घर क्र');
    });
    if (gharKeys.length > 0) {
      const val = voterObj[gharKeys[0]];
      if (val && val !== '' && val !== null) {
        voterObj.houseNumber = String(val).trim();
      }
    }
  }
  
  // Add voterIdCard from मतदान कार्ड क्र
  if (!voterObj.voterIdCard || voterObj.voterIdCard === '') {
    const voterKeys = Object.keys(voterObj).filter(k => {
      const trimmed = k.trim();
      return trimmed.includes('मतदान') || trimmed.includes('कार्ड');
    });
    if (voterKeys.length > 0) {
      const val = voterObj[voterKeys[0]];
      if (val && val !== '' && val !== null) {
        voterObj.voterIdCard = String(val).trim();
      }
    }
  }
  
  // Add mobileNumber from मोबाईल नं
  if (!voterObj.mobileNumber || voterObj.mobileNumber === '') {
    const mobileKeys = Object.keys(voterObj).filter(k => {
      const trimmed = k.trim();
      return trimmed.includes('मोबाईल') || trimmed.includes('मोबाइल');
    });
    if (mobileKeys.length > 0) {
      const val = voterObj[mobileKeys[0]];
      if (val && val !== '' && val !== null) {
        voterObj.mobileNumber = String(val).trim();
      }
    }
  }
  
  // FINAL cleanup: Remove any remaining null values, empty objects, and unwanted keys
  const finalKeysToDelete = [];
  Object.keys(voterObj).forEach(key => {
    // Remove null/undefined values
    if (voterObj[key] === null || voterObj[key] === undefined) {
      voterObj[key] = '';
    }
    // Remove __EMPTY keys
    if (key.startsWith('__EMPTY')) {
      finalKeysToDelete.push(key);
    }
    // Remove any remaining nested objects
    if (typeof voterObj[key] === 'object' && voterObj[key] !== null && !Array.isArray(voterObj[key])) {
      const flattened = getValue(voterObj[key]);
      voterObj[key] = flattened;
    }
    // Clean up empty strings that are actually null
    if (voterObj[key] === 'null' || voterObj[key] === 'undefined') {
      voterObj[key] = '';
    }
  });
  
  // Delete unwanted keys
  finalKeysToDelete.forEach(key => delete voterObj[key]);
  
  // Ensure English columns are set even if they're empty strings (but not null)
  if (!('name' in voterObj)) voterObj.name = '';
  if (!('gender' in voterObj)) voterObj.gender = '';
  if (!('age' in voterObj)) voterObj.age = '';
  if (!('houseNumber' in voterObj)) voterObj.houseNumber = '';
  if (!('voterIdCard' in voterObj)) voterObj.voterIdCard = '';
  if (!('mobileNumber' in voterObj)) voterObj.mobileNumber = '';
  
  // Delete serialNumber field from output (user requested removal)
  if ('serialNumber' in voterObj) {
    delete voterObj.serialNumber;
  }
  
  // Ensure _id is properly converted to string (MongoDB ObjectId)
  if (voterObj._id && typeof voterObj._id !== 'string') {
    voterObj._id = voterObj._id.toString ? voterObj._id.toString() : String(voterObj._id);
  }
  
  // Ensure createdAt and updatedAt are properly formatted
  if (voterObj.createdAt) {
    voterObj.createdAt = voterObj.createdAt instanceof Date ? voterObj.createdAt.toISOString() : String(voterObj.createdAt);
  }
  if (voterObj.updatedAt) {
    voterObj.updatedAt = voterObj.updatedAt instanceof Date ? voterObj.updatedAt.toISOString() : String(voterObj.updatedAt);
  }
  
  return voterObj;
};

export const getAllVoters = asyncHandler(async (req, res) => {
  // Ensure MongoDB connection is ready before operations
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState !== 1) {
    // Connection not ready, ensure connection
    const connectDB = (await import('../config/db.js')).default;
    await connectDB();
    // Wait for connection to be ready (max 10 seconds)
    let attempts = 0;
    const maxAttempts = 200; // 200 * 50ms = 10 seconds
    while (mongoose.default.connection.readyState !== 1 && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (mongoose.default.connection.readyState !== 1) {
      throw new Error('MongoDB connection timeout - connection not ready after 10 seconds');
    }
  }
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100; // Default 100 records per page
  const skip = (page - 1) * limit;
  
  // Maximum limit to prevent huge responses
  const maxLimit = 1000;
  const actualLimit = Math.min(limit, maxLimit);
  
  // Get total count (with connection check)
  const totalCount = await Voter.countDocuments({}).maxTimeMS(30000);
  
  // Get paginated data
  const voters = await Voter.find({})
    .skip(skip)
    .limit(actualLimit)
    .maxTimeMS(30000)
    .lean();
  
  // Transform each voter to add English columns and clean data
  const transformedVoters = voters.map(voter => addEnglishColumns(voter));
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / actualLimit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  res.json({ 
    success: true, 
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalCount,
      recordsPerPage: actualLimit,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage
    },
    count: transformedVoters.length,
    data: transformedVoters 
  });
});

export const getVoterById = asyncHandler(async (req, res) => {
  // Ensure MongoDB connection is ready
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState !== 1) {
    const connectDB = (await import('../config/db.js')).default;
    await connectDB();
    // Wait for connection to be ready (max 10 seconds)
    let attempts = 0;
    const maxAttempts = 200;
    while (mongoose.default.connection.readyState !== 1 && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (mongoose.default.connection.readyState !== 1) {
      throw new Error('MongoDB connection timeout');
    }
  }
  
  const voter = await Voter.findById(req.params.id).maxTimeMS(30000).lean();
  if (!voter) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  // Transform to add English columns and clean data
  const transformedVoter = addEnglishColumns(voter);
  res.json({ success: true, data: transformedVoter });
});

export const deleteAllVoters = asyncHandler(async (req, res) => {
  // Ensure MongoDB connection is ready
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState !== 1) {
    const connectDB = (await import('../config/db.js')).default;
    await connectDB();
    // Wait for connection to be ready (max 10 seconds)
    let attempts = 0;
    const maxAttempts = 200;
    while (mongoose.default.connection.readyState !== 1 && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (mongoose.default.connection.readyState !== 1) {
      throw new Error('MongoDB connection timeout');
    }
  }
  
  const result = await Voter.deleteMany({}).maxTimeMS(30000);
  res.json({ success: true, deletedCount: result.deletedCount || 0 });
});
