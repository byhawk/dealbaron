# DealBaron API Specification v1.0

## 📋 Genel Bilgiler

**Base URL:** `https://api.dealbaron.com/api/v1`

**Authentication:** JWT Bearer Token

**Content-Type:** `application/json`

**Rate Limiting:** 100 requests/minute per user

---

## 🔐 Authentication

### POST /auth/register
Yeni kullanıcı kaydı

**Request:**
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "deviceId": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "player": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "balance": 1000.00,
      "level": 1,
      "xp": 0,
      "trustScore": 100,
      "marketUnlocked": false,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 604800
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username already exists",
    "details": [
      {
        "field": "username",
        "message": "Username 'ali123' is already taken"
      }
    ]
  }
}
```

---

### POST /auth/login
Kullanıcı girişi

**Request:**
```json
{
  "username": "string",  // veya email
  "password": "string",
  "deviceId": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "player": { /* Player object */ },
    "tokens": { /* Tokens */ }
  }
}
```

---

### POST /auth/refresh
Token yenileme

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 604800
  }
}
```

---

### POST /auth/logout
Çıkış yapma

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 Player

### GET /player/me
Mevcut oyuncu bilgilerini getir

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "balance": 15250.75,
    "level": 8,
    "xp": 450,
    "xpRequired": 738,
    "trustScore": 125,
    "marketUnlocked": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /player/stats
Oyuncu istatistikleri

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 156,
    "totalRevenue": 125000.50,
    "totalProfit": 45000.25,
    "successfulSales": 89,
    "successfulPurchases": 67,
    "averageProfit": 15.5,
    "mostSoldProduct": {
      "id": "uuid",
      "name": "Buğday",
      "totalSold": 5000
    },
    "daysActive": 45
  }
}
```

---

### POST /player/add-xp
XP ekle (Internal - sadece server-side)

**Request:**
```json
{
  "playerId": "uuid",
  "amount": 10,
  "reason": "sale_completed"
}
```

---

## 📦 Products

### GET /products
Tüm ürünleri listele

**Query Parameters:**
- `category` (optional): string - "agriculture", "industry", "luxury"
- `rarity` (optional): string - "common", "uncommon", "rare", "epic", "legendary"
- `page` (optional): number - default: 1
- `limit` (optional): number - default: 50

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Buğday",
        "nameEn": "Wheat",
        "description": "Temel tarım ürünü",
        "basePrice": 10.50,
        "volume": 5,
        "category": "agriculture",
        "rarity": "common",
        "elasticityFactor": 0.15,
        "demandCoeffA": 1000,
        "demandCoeffB": 2.5,
        "imageUrl": "https://cdn.dealbaron.com/products/wheat.png",
        "icon": "🌾"
      }
      // ... more products
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

---

### GET /products/:id
Ürün detayı

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Buğday",
    "basePrice": 10.50,
    "volume": 5,
    "category": "agriculture",
    "rarity": "common",
    "elasticityFactor": 0.15,
    "demandCoeffA": 1000,
    "demandCoeffB": 2.5,
    "imageUrl": "https://cdn.dealbaron.com/products/wheat.png",
    "currentMarketState": {
      "supply": 15000,
      "demand": 12500,
      "avgPrice": 12.75,
      "pressure": 0.2,
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    "dealBaronPrice": 12.50,
    "priceRange": {
      "min": 10.00,
      "max": 11.25
    }
  }
}
```

---

### GET /products/:id/price-history
Ürün fiyat geçmişi

**Query Parameters:**
- `days` (optional): number - default: 7, max: 30

**Response (200):**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "priceHistory": [
      {
        "date": "2024-01-15",
        "avgPrice": 12.50,
        "minPrice": 11.00,
        "maxPrice": 14.00,
        "volume": 5000
      },
      {
        "date": "2024-01-14",
        "avgPrice": 12.00,
        "minPrice": 10.50,
        "maxPrice": 13.50,
        "volume": 4800
      }
      // ... 7 days
    ]
  }
}
```

---

### POST /products/calculate-demand
Talep hesaplama (Oyuncu fiyat belirlerken kullanır)

**Request:**
```json
{
  "productId": "uuid",
  "price": 12.50
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "price": 12.50,
    "demand": 968,
    "expectedRevenue": 12100.00,
    "marketPressure": 0.15,
    "recommendation": "good_price"  // "too_high", "good_price", "too_low"
  }
}
```

---

## 🏪 Market

### GET /market/listings
Pazar ilanlarını listele

**Query Parameters:**
- `productId` (optional): uuid
- `category` (optional): string
- `sortBy` (optional): "price_asc", "price_desc", "newest", "quantity"
- `page` (optional): number
- `limit` (optional): number

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "seller": {
          "id": "uuid",
          "username": "ali123",
          "trustScore": 125,
          "level": 8
        },
        "product": {
          "id": "uuid",
          "name": "Buğday",
          "imageUrl": "...",
          "category": "agriculture"
        },
        "quantity": 500,
        "price": 11.25,
        "totalValue": 5625.00,
        "dealBaronPrice": 12.50,
        "discount": 10,  // %
        "listedAt": "2024-01-15T08:00:00Z",
        "expiresAt": "2024-01-16T08:00:00Z",
        "status": "active"
      }
      // ... more listings
    ],
    "dealBaronPrices": {
      "productId": 12.50,
      // ... diğer ürünler
    },
    "pagination": { /* ... */ }
  }
}
```

---

### GET /market/listings/:id
İlan detayı

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "seller": {
      "id": "uuid",
      "username": "ali123",
      "trustScore": 125,
      "level": 8,
      "totalSales": 156,
      "avgResponseTime": "2 hours"
    },
    "product": { /* Full product object */ },
    "quantity": 500,
    "price": 11.25,
    "totalValue": 5625.00,
    "dealBaronPrice": 12.50,
    "discount": 10,
    "listedAt": "2024-01-15T08:00:00Z",
    "expiresAt": "2024-01-16T08:00:00Z",
    "status": "active",
    "views": 45
  }
}
```

---

### POST /market/listings
Yeni ilan oluştur

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 500,
  "price": 11.25,
  "duration": 24  // hours (24, 48, 72)
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "listing": { /* Listing object */ },
    "fee": 28.13  // %5 listing fee
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "PRICE_TOO_HIGH",
    "message": "Price exceeds maximum allowed",
    "details": {
      "yourPrice": 13.00,
      "dealBaronPrice": 12.50,
      "maxAllowedPrice": 11.25,
      "maxAllowedPercentage": 90
    }
  }
}
```

---

### PUT /market/listings/:id
İlanı güncelle (sadece fiyat)

**Request:**
```json
{
  "price": 10.50
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listing": { /* Updated listing */ },
    "updateFee": 11.25  // %2 update fee
  }
}
```

---

### DELETE /market/listings/:id
İlanı iptal et

**Response (200):**
```json
{
  "success": true,
  "message": "Listing cancelled successfully",
  "data": {
    "refundedQuantity": 500
  }
}
```

---

### POST /market/buy
Ürün satın al

**Request:**
```json
{
  "listingId": "uuid",
  "quantity": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "buyer": { /* Player object */ },
      "seller": { /* Player object */ },
      "product": { /* Product object */ },
      "quantity": 100,
      "price": 11.25,
      "totalCost": 1125.00,
      "fee": 56.25,  // %5 market fee
      "netRevenue": 1068.75,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "updatedBalance": 13875.00,
    "xpGained": 10
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient balance",
    "details": {
      "required": 1125.00,
      "available": 500.00,
      "deficit": 625.00
    }
  }
}
```

---

### POST /market/dealbaron/buy
DealBaron'dan anlık alım

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "dealbaron_purchase",
      "product": { /* ... */ },
      "quantity": 100,
      "price": 12.50,  // DealBaron average price
      "totalCost": 1250.00,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "updatedBalance": 12750.00
  }
}
```

---

### POST /market/dealbaron/sell
DealBaron'a anlık satış

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "dealbaron_sale",
      "product": { /* ... */ },
      "quantity": 100,
      "price": 12.50,
      "totalRevenue": 1250.00,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "updatedBalance": 15250.00
  }
}
```

---

## 🏭 Business

### GET /business/my
Oyuncunun işletmelerini getir

**Response (200):**
```json
{
  "success": true,
  "data": {
    "businesses": [
      {
        "id": "uuid",
        "type": "farm",  // or "industry"
        "name": "Ali'nin Çiftliği",
        "level": 5,
        "warehouseCapacity": 5000,
        "warehouseUsed": 3250,
        "warehouseFree": 1750,
        "utilizationRate": 65,
        "workers": [
          {
            "id": "uuid",
            "type": "basic",
            "boostMultiplier": 1.2,
            "isPremium": false
          }
        ],
        "activeProductions": [
          {
            "id": "uuid",
            "product": { /* Product object */ },
            "quantity": 100,
            "startTime": "2024-01-15T09:00:00Z",
            "endTime": "2024-01-15T12:00:00Z",
            "progress": 75,  // %
            "status": "in_progress"
          }
        ],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /business/production/start
Üretim başlat

**Request:**
```json
{
  "businessId": "uuid",
  "productId": "uuid",
  "quantity": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "production": {
      "id": "uuid",
      "product": { /* ... */ },
      "quantity": 100,
      "baseTime": 3600,  // seconds
      "actualTime": 3000,  // with worker boost
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:50:00Z",
      "status": "in_progress"
    }
  }
}
```

---

### POST /business/production/:id/collect
Üretimi topla

**Response (200):**
```json
{
  "success": true,
  "data": {
    "collected": {
      "product": { /* ... */ },
      "quantity": 100
    },
    "warehouseStatus": {
      "used": 3750,
      "free": 1250,
      "utilizationRate": 75
    },
    "xpGained": 5
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCTION_NOT_READY",
    "message": "Production not completed yet",
    "details": {
      "remainingTime": 600,  // seconds
      "completionTime": "2024-01-15T10:50:00Z"
    }
  }
}
```

---

### GET /business/:id/warehouse
Depo durumu

**Response (200):**
```json
{
  "success": true,
  "data": {
    "businessId": "uuid",
    "capacity": 5000,
    "used": 3250,
    "free": 1750,
    "utilizationRate": 65,
    "inventory": [
      {
        "product": { /* Product object */ },
        "quantity": 500,
        "volume": 2500,
        "averageCost": 10.25
      },
      {
        "product": { /* ... */ },
        "quantity": 150,
        "volume": 750,
        "averageCost": 50.00
      }
    ]
  }
}
```

---

### POST /business/workers/hire
İşçi işe al

**Request:**
```json
{
  "businessId": "uuid",
  "workerType": "basic"  // or "advanced", "premium"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "worker": {
      "id": "uuid",
      "type": "basic",
      "boostMultiplier": 1.2,
      "cost": 1000,
      "isPremium": false
    },
    "updatedBalance": 14250.00
  }
}
```

---

## 📊 Economy (Internal/Public)

### GET /economy/market-state
Genel piyasa durumu (Public)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:00:00Z",
    "products": [
      {
        "productId": "uuid",
        "productName": "Buğday",
        "supply": 15000,
        "demand": 12500,
        "avgPrice": 12.50,
        "pressure": 0.2,
        "trend": "stable",  // "rising", "falling", "stable"
        "priceChange24h": 2.5  // %
      }
      // ... other products
    ],
    "topMovers": {
      "gainers": [/* Top 5 fiyat artışı */],
      "losers": [/* Top 5 fiyat düşüşü */]
    }
  }
}
```

---

### POST /economy/update
Ekonomi güncellemesi (Internal - Cron job)

**Request:**
```json
{
  "secretKey": "internal_secret"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updatedProducts": 150,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

---

## 🔔 Notifications

### GET /notifications
Bildirimleri getir

**Query Parameters:**
- `unreadOnly` (optional): boolean - default: false
- `page` (optional): number
- `limit` (optional): number

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "sale_completed",
        "title": "Satış Tamamlandı",
        "message": "Buğday satışınız gerçekleşti",
        "data": {
          "transactionId": "uuid",
          "productName": "Buğday",
          "quantity": 100,
          "revenue": 1125.00
        },
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
      // ... more
    ],
    "unreadCount": 5,
    "pagination": { /* ... */ }
  }
}
```

---

### PUT /notifications/:id/read
Bildirimi okundu olarak işaretle

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT /notifications/read-all
Tüm bildirimleri okundu yap

**Response (200):**
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  }
}
```

---

## 🔍 Search

### GET /search
Global arama

**Query Parameters:**
- `q`: string (min 2 chars)
- `type`: "products", "players", "all" (default: all)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Buğday",
        "category": "agriculture",
        "basePrice": 10.50
      }
    ],
    "players": [
      {
        "id": "uuid",
        "username": "ali123",
        "level": 8,
        "trustScore": 125
      }
    ]
  }
}
```

---

## ❌ Error Codes

### Authentication Errors
- `INVALID_CREDENTIALS` - Yanlış kullanıcı adı veya şifre
- `TOKEN_EXPIRED` - Token süresi dolmuş
- `TOKEN_INVALID` - Geçersiz token
- `UNAUTHORIZED` - Yetkilendirme gerekli

### Validation Errors
- `VALIDATION_ERROR` - Validasyon hatası
- `MISSING_FIELD` - Gerekli alan eksik
- `INVALID_FORMAT` - Geçersiz format

### Business Logic Errors
- `INSUFFICIENT_FUNDS` - Yetersiz bakiye
- `INSUFFICIENT_INVENTORY` - Yetersiz envanter
- `INSUFFICIENT_WAREHOUSE_SPACE` - Yetersiz depo alanı
- `PRICE_TOO_HIGH` - Fiyat çok yüksek
- `PRICE_TOO_LOW` - Fiyat çok düşük
- `PRODUCTION_NOT_READY` - Üretim henüz hazır değil
- `MARKET_NOT_UNLOCKED` - Pazar kilidi açılmamış

### Resource Errors
- `NOT_FOUND` - Kaynak bulunamadı
- `ALREADY_EXISTS` - Kaynak zaten mevcut
- `CONFLICT` - Çakışma

### Server Errors
- `INTERNAL_ERROR` - Sunucu hatası
- `DATABASE_ERROR` - Veritabanı hatası
- `SERVICE_UNAVAILABLE` - Servis kullanılamıyor

---

## 📊 Rate Limiting

**Limits:**
- **General:** 100 requests/minute per user
- **Login:** 5 requests/minute per IP
- **Market listing creation:** 10 requests/minute per user
- **Search:** 30 requests/minute per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

**Error Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 45  // seconds
  }
}
```

---

## 🧪 Testing

### Health Check
```bash
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

---

## 📱 Flutter Integration Example

```dart
// lib/data/datasources/remote/market_api.dart
@RestApi(baseUrl: "https://api.dealbaron.com/api/v1")
abstract class MarketApi {
  factory MarketApi(Dio dio) = _MarketApi;

  @GET("/market/listings")
  Future<ApiResponse<PaginatedListings>> getListings(
    @Query("page") int page,
    @Query("limit") int limit,
    @Query("productId") String? productId,
  );

  @POST("/market/buy")
  Future<ApiResponse<Transaction>> buyProduct(
    @Body() BuyProductRequest request,
  );

  @POST("/market/listings")
  Future<ApiResponse<Listing>> createListing(
    @Body() CreateListingRequest request,
  );
}
```

---

**API Version:** 1.0
**Last Updated:** 2025-10-29
**Contact:** dev@dealbaron.com
