# 📚 Spring Filter Query Guide

## 🔍 Tổng quan

Backend đang sử dụng thư viện [Spring Filter](https://github.com/turkraft/springfilter) để xử lý query filtering.

**Repository:** https://github.com/turkraft/springfilter

---

## ⚠️ VẤN ĐỀ HIỆN TẠI

### 1. **Lỗi trong ApartmentService**

**File:** `src/services/api/ApartmentService.ts` (dòng 153)

**❌ SAI:**
```typescript
filter: `projectId = '${projectId}'`
```

**Lỗi backend:**
```json
{
  "error": {
    "message": "Could not resolve attribute 'projectId' of 'xjanua.backend.model.Apartment'"
  }
}
```

**Nguyên nhân:**
1. ❌ Sử dụng `=` thay vì `:`
2. ❌ Field name sai: `projectId` không tồn tại trong model
3. ✅ Backend model có field `project` (object) với property `id`

**✅ ĐÚNG:**
```typescript
filter: `project.id : '${projectId}'`
```

---

## 📖 CÚ PHÁP SPRING FILTER

### 1. **Comparison Operators**

| Operator | Ý nghĩa | Ví dụ |
|----------|---------|-------|
| `:` | Equal (bằng) | `name : 'John'` |
| `!:` | Not equal (khác) | `status !: 'inactive'` |
| `>` | Greater than | `price > 1000000` |
| `>=` | Greater than or equal | `price >= 1000000` |
| `<` | Less than | `price < 5000000` |
| `<=` | Less than or equal | `price <= 5000000` |
| `~` | Like (contains) | `name ~ '*John*'` |
| `!~` | Not like | `name !~ '*test*'` |

### 2. **Logical Operators**

| Operator | Ý nghĩa | Ví dụ |
|----------|---------|-------|
| `and` | AND logic | `name : 'John' and age > 18` |
| `or` | OR logic | `status : 'active' or status : 'pending'` |
| `( )` | Grouping | `(status : 'active' or status : 'pending') and age > 18` |

### 3. **Nested Properties**

Sử dụng dấu `.` để truy cập nested properties:

```typescript
// ✅ ĐÚNG - Truy cập nested property
filter: `project.id : '123'`
filter: `user.email : 'test@example.com'`
filter: `address.city : 'Hanoi'`

// ❌ SAI - Không có dấu .
filter: `projectId : '123'`  // Chỉ đúng nếu có flat field projectId
```

### 4. **String Values**

**LUÔN LUÔN** sử dụng single quotes `'` cho string values:

```typescript
// ✅ ĐÚNG
filter: `name : 'John Doe'`
filter: `project.id : '796b1ecf-d23e-419b-a24e-95ee47579af7'`

// ❌ SAI - Thiếu quotes
filter: `name : John`
filter: `project.id : 796b1ecf-d23e-419b-a24e-95ee47579af7`

// ❌ SAI - Dùng double quotes
filter: `name : "John"`
```

### 5. **Wildcard Search**

Sử dụng `*` cho wildcard search với operator `~`:

```typescript
// Tìm kiếm chứa "John" ở bất kỳ đâu
filter: `name ~ '*John*'`

// Bắt đầu bằng "John"
filter: `name ~ 'John*'`

// Kết thúc bằng "Doe"
filter: `name ~ '*Doe'`
```

### 6. **Multiple Conditions**

```typescript
// AND condition
filter: `name : 'John' and age > 18`

// OR condition
filter: `status : 'active' or status : 'pending'`

// Complex conditions
filter: `(name ~ '*John*' or email ~ '*john*') and status : 'active'`

// Nested properties với multiple conditions
filter: `project.id : '123' and status : 'available' and price > 1000000`
```

---

## 🔧 CÁC LỖI CẦN SỬA TRONG PROJECT

### 1. **ApartmentService.ts**

#### Lỗi 1: `getByProjectId` method

**Dòng 153:**
```typescript
// ❌ SAI
filter: `projectId = '${projectId}'`

// ✅ ĐÚNG
filter: `project.id : '${projectId}'`
```

#### Lỗi 2: `search` method

**Dòng 172:**
```typescript
// ❌ SAI - Sử dụng ~~
filter: `name ~~ '${searchTerm}'`

// ✅ ĐÚNG - Sử dụng ~ với wildcard
filter: `name ~ '*${searchTerm}*'`
```

### 2. **CustomerService.ts**

**Dòng 170:**
```typescript
// ❌ SAI - Sử dụng ~~
filter: `fullName ~~ '${searchTerm}' OR phoneNumber ~~ '${searchTerm}'`

// ✅ ĐÚNG
filter: `fullName ~ '*${searchTerm}*' or phoneNumber ~ '*${searchTerm}*'`
```

**Lưu ý:** `OR` phải viết thường thành `or`

---

## ✅ EXAMPLES ĐÚNG

### 1. **Filter by nested property**
```typescript
// Apartments by project
const params = {
  filter: `project.id : '796b1ecf-d23e-419b-a24e-95ee47579af7'`
};
```

### 2. **Search with wildcard**
```typescript
// Search apartments by name
const params = {
  filter: `name ~ '*Penthouse*'`
};
```

### 3. **Multiple conditions**
```typescript
// Apartments by project and status
const params = {
  filter: `project.id : '123' and status : 'available'`
};
```

### 4. **Complex search**
```typescript
// Search customers by name or phone
const params = {
  filter: `(fullName ~ '*John*' or phoneNumber ~ '*0123*') and status : 'active'`
};
```

### 5. **Price range**
```typescript
// Apartments in price range
const params = {
  filter: `price >= 1000000 and price <= 5000000`
};
```

---

## 🎯 CHECKLIST SỬA LỖI

- [ ] **ApartmentService.ts**
  - [ ] Sửa `getByProjectId`: `projectId =` → `project.id :`
  - [ ] Sửa `search`: `name ~~` → `name ~` với wildcard

- [ ] **CustomerService.ts**
  - [ ] Sửa `search`: `~~` → `~` với wildcard
  - [ ] Sửa `OR` → `or`

- [ ] **Kiểm tra các service khác**
  - [ ] BlogService.ts
  - [ ] UserService.ts
  - [ ] ProjectService.ts

---

## 📝 QUY TẮC CHUNG

### ✅ DO (Nên làm)

1. **Luôn dùng `:` cho equal comparison**
   ```typescript
   filter: `status : 'active'`
   ```

2. **Luôn dùng single quotes cho string**
   ```typescript
   filter: `name : 'John Doe'`
   ```

3. **Dùng `.` cho nested properties**
   ```typescript
   filter: `project.id : '123'`
   ```

4. **Dùng `~` với `*` cho wildcard search**
   ```typescript
   filter: `name ~ '*John*'`
   ```

5. **Dùng lowercase cho logical operators**
   ```typescript
   filter: `a : 'x' and b : 'y'`  // ✅
   filter: `a : 'x' or b : 'y'`   // ✅
   ```

### ❌ DON'T (Không nên làm)

1. **Không dùng `=` cho comparison**
   ```typescript
   filter: `status = 'active'`  // ❌
   ```

2. **Không dùng double quotes**
   ```typescript
   filter: `name : "John"`  // ❌
   ```

3. **Không dùng flat field name cho nested properties**
   ```typescript
   filter: `projectId : '123'`  // ❌ (trừ khi có flat field)
   ```

4. **Không dùng `~~` operator**
   ```typescript
   filter: `name ~~ 'John'`  // ❌
   ```

5. **Không dùng uppercase cho logical operators**
   ```typescript
   filter: `a : 'x' AND b : 'y'`  // ❌
   filter: `a : 'x' OR b : 'y'`   // ❌
   ```

---

## 🧪 TESTING

### Test trong browser console:

```javascript
// Test apartment filter
const testFilter = async () => {
  const response = await fetch(
    'https://kimanhome.duckdns.org/spring-api/apartments?page=0&size=10&filter=project.id : \'796b1ecf-d23e-419b-a24e-95ee47579af7\''
  );
  const data = await response.json();
  console.log(data);
};

testFilter();
```

### Expected response:
```json
{
  "content": {
    "response": [
      {
        "id": "...",
        "name": "...",
        "project": {
          "id": "796b1ecf-d23e-419b-a24e-95ee47579af7",
          "name": "..."
        }
      }
    ]
  }
}
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **Spring Filter GitHub:** https://github.com/turkraft/springfilter
- **Documentation:** https://github.com/turkraft/springfilter#usage
- **Examples:** https://github.com/turkraft/springfilter#examples

---

**Ngày tạo:** 2025-10-06  
**Người tạo:** Augment Agent  
**Mục đích:** Hướng dẫn sử dụng Spring Filter đúng cách và sửa lỗi query trong project

