# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**DealBaron** is an economy simulation mobile game where players build trading empires through dynamic supply-demand mechanics and strategic pricing. The game features an elasticity-based economy model where player decisions directly impact market conditions.

**Architecture:**
- **Backend:** Node.js/Express REST API on Linux VDS (Ubuntu 22.04)
- **Database:** PostgreSQL 16 + Redis 7 (caching)
- **Mobile App:** Flutter (Android) with Clean Architecture
- **Admin Panel:** React.js web app for game management
- **Deployment:** PM2 process manager, Nginx reverse proxy, Let's Encrypt SSL

---

## Core Economic System

The game's foundation is an elasticity-based pricing model. All economic calculations must preserve these formulas:

### Critical Formulas (DO NOT MODIFY)

**Demand Calculation:**
```
Q = a - bP
```
- `Q`: Demand quantity
- `P`: Price
- `a`: Base demand coefficient (product-specific)
- `b`: Price sensitivity coefficient (product-specific)

**Price Calculation:**
```
FinalPrice = BasePrice × (1 + Markup%) × (1 ± ElasticityFactor × MarketPressure)
```

**Market Pressure:**
```
MarketPressure = (Supply - AvgDemand) / AvgDemand
```

**Warehouse Volume:**
```
TotalVolume = Σ(ProductVolume × Quantity)
FreeSpace = WarehouseCapacity - TotalVolume
```

### Economy Constraints

- **DealBaron Price Rule:** Player prices MUST be 80-90% of DealBaron's average price
- **Market Fee:** 5% on all transactions
- **Update Interval:** Economy state updates every 5 minutes (cron job)
- **Inflation Target:** <5% daily, monitored via simulations

---

## Backend Architecture

### Tech Stack
- Node.js 20 LTS + Express.js
- PostgreSQL 16 (primary data)
- Redis 7 (cache + sessions)
- PM2 (cluster mode, auto-restart)
- Nginx (reverse proxy, rate limiting)

### Project Structure (Backend)
```
backend/
├── src/
│   ├── models/          # Sequelize ORM models
│   ├── routes/          # API endpoints
│   ├── services/
│   │   ├── economy/     # Economy engine (demand, price, pressure)
│   │   ├── warehouse/   # Inventory management
│   │   └── dealbaron/   # DealBaron automated agent
│   ├── middleware/      # Auth, validation, error handling
│   └── utils/           # Helpers, validators
├── migrations/          # Database migrations
├── tests/               # Unit + integration tests
└── ecosystem.config.js  # PM2 configuration
```

### Key Backend Commands

**Development:**
```bash
npm run dev              # Hot reload dev server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed test data
```

**Testing:**
```bash
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report (target: 80%+)
npm run test:economy-sim # 30-day economy simulation
```

**Production Deployment:**
```bash
pm2 start ecosystem.config.js
pm2 logs dealbaron-api
pm2 monit
pm2 restart dealbaron-api
```

**Database Operations:**
```bash
# Backup
pg_dump -U dealbaron dealbaron_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c backup_20240115.sql.gz | psql -U dealbaron dealbaron_prod
```

---

## Flutter Architecture

### Clean Architecture Layers

**data/** → API models, repositories, data sources (remote + local)
**domain/** → Business entities, use cases, repository interfaces
**presentation/** → Riverpod providers, screens, widgets

### Key Flutter Commands

**Development:**
```bash
flutter run                      # Debug mode
flutter run --release            # Release mode
flutter pub get                  # Install dependencies
flutter pub run build_runner build --delete-conflicting-outputs  # Generate code
```

**Code Generation (Freezed + JSON Serializable):**
```bash
flutter pub run build_runner watch  # Auto-generate on file changes
```

**Testing:**
```bash
flutter test                     # All tests
flutter test test/unit/          # Unit tests
flutter test test/widget/        # Widget tests
flutter test integration_test/   # Integration tests
```

**Build:**
```bash
# Development APK
flutter build apk --debug --flavor dev

# Production release (App Bundle for Play Store)
flutter build appbundle --release --flavor production
```

### State Management (Riverpod)

All state is managed through Riverpod providers. Follow this pattern:

```dart
@riverpod
class ExampleNotifier extends _$ExampleNotifier {
  @override
  Future<Data> build() async {
    return await _repository.getData();
  }

  Future<void> updateData() async {
    state = await AsyncValue.guard(() => _repository.update());
  }
}
```

### Offline-First Strategy

- **Cache Layer:** Hive for local storage
- **TTL:** Market listings cached for 5 minutes
- **Fallback:** Always check cache before API, return cached data on network failure
- **Sync:** Background sync when connection restored

---

## Critical Business Rules

### DealBaron Automated Agent
- Calculates average price from last 100 transactions (weighted by quantity)
- Always available for instant buy/sell at average price
- Acts as price reference and liquidity provider
- Players CANNOT sell above 90% of DealBaron price

### Market Access Control
Unlock requirements:
- Level ≥ 5
- Total transactions ≥ 10
- Total revenue ≥ 10,000
- Days active ≥ 3

### Production System
- **Farm:** Basic products (wheat, corn)
- **Industry:** Processed goods (steel, electronics)
- **Workers:** Boost production speed (1.2x - 2.0x multiplier)
- **Time calculation:** `actualTime = baseTime / boostMultiplier`

### Warehouse Constraints
- Every product has a `volume` property
- Total volume cannot exceed `warehouseCapacity`
- Prevent all operations that would cause overflow

---

## API Integration

**Base URL:** `https://api.dealbaron.com/api/v1`

**Authentication:** JWT Bearer token in header:
```
Authorization: Bearer {token}
```

**Rate Limits:**
- General: 100 req/min per user
- Login: 5 req/min per IP
- Market listing: 10 req/min per user

**Key Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - Login
- `GET /market/listings` - Browse market
- `POST /market/buy` - Purchase from market
- `POST /market/dealbaron/buy` - Buy from DealBaron
- `GET /products/:id/price-history` - 7-day price chart data
- `POST /business/production/start` - Start production
- `POST /business/production/:id/collect` - Collect finished goods

See `API_SPECIFICATION.md` for complete endpoint documentation.

---

## Testing Strategy

### Backend Testing Priorities
1. **Economy formulas (100% coverage required):** All calculations in `services/economy/`
2. **DealBaron agent logic:** Price validation, transaction processing
3. **Warehouse system:** Volume calculations, overflow prevention
4. **API endpoints:** Response formats, error handling

### Flutter Testing Priorities
1. **Service layer:** Economy calculations, repository logic
2. **Providers:** State management flows
3. **Critical widgets:** DealBaron bar, price chart, market listing card
4. **User flows:** Login → Market browse → Purchase → Inventory check

### Economy Simulation Tests
Run 30-day simulations to verify:
- Inflation rate < 5%/week
- Gini coefficient < 0.6 (wealth inequality)
- Price volatility < 30%/day
- Market liquidity > 70%

```bash
npm run test:economy-sim
```

---

## Security Requirements

### Backend
- JWT tokens expire in 7 days (refresh token: 30 days)
- All monetary calculations use `DECIMAL(15,2)` (never `FLOAT`)
- Pessimistic locking for inventory transactions
- Rate limiting via Nginx + Redis
- Environment variables NEVER committed (`.env` in `.gitignore`)

### Flutter
- Tokens stored in `flutter_secure_storage`
- API keys in environment-specific configs (dev/staging/production)
- Certificate pinning for production (optional but recommended)

---

## Deployment Workflow

### Backend Deployment (Linux VDS)
1. SSH into server: `ssh dealbaron@YOUR_SERVER_IP`
2. Navigate to app: `cd /var/www/dealbaron`
3. Pull latest code: `git pull origin main`
4. Install dependencies: `npm ci --production`
5. Run migrations: `npm run db:migrate`
6. Reload PM2: `pm2 reload dealbaron-api`
7. Check status: `pm2 status && pm2 logs --lines 50`

### Flutter Release
1. Update version in `pubspec.yaml`
2. Build: `flutter build appbundle --release --flavor production`
3. Test: Install APK on physical device
4. Upload to Play Store Console

---

## Performance Targets

**Backend:**
- API response time: p95 < 500ms
- Database queries: < 100ms
- Redis cache hit rate: > 80%

**Flutter:**
- App launch: < 3 seconds
- Screen transitions: 60fps
- Image loading: Use `CachedNetworkImage` with 300x300 memory cache

---

## Important Files Reference

- `dealbaron_game_design(1).md` - Core game mechanics and formulas
- `DealBaron_AI_System_Prompt.md` - Economic system rules
- `API_SPECIFICATION.md` - Complete API documentation (67 endpoints)
- `ADMIN_PANEL_SPECIFICATION.md` - Admin panel features and endpoints
- `FLUTTER_DEVELOPMENT_PLAN.md` - Flutter architecture details
- `LINUX_VDS_DEPLOYMENT.md` - Production deployment guide
- `TEST_STRATEGY.md` - Testing approach and test cases

---

## Development Phases

**Phase 1 (Weeks 1-2):** Backend foundation (DB schema, auth, basic API)
**Phase 2 (Weeks 3-4):** Economy engine + DealBaron agent
**Phase 3 (Weeks 5-6):** Flutter app structure + API integration
**Phase 4 (Weeks 7-8):** UI/UX implementation
**Phase 5 (Weeks 9-10):** Advanced features (notifications, charts)
**Phase 6 (Weeks 11-12):** Testing + deployment

---

## Common Issues & Solutions

**"Database connection error"**
```bash
systemctl status postgresql
psql -U dealbaron -d dealbaron_prod -h localhost
```

**"Port 3000 already in use"**
```bash
lsof -i :3000
kill -9 <PID>
```

**"Flutter build_runner conflicts"**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**"PM2 out of memory"**
```bash
# Check ecosystem.config.js: max_memory_restart: '1G'
pm2 restart dealbaron-api
```

---

## Key Constraints to Remember

1. **Economy Balance is Critical:** Never modify formulas without running simulations
2. **DealBaron Price Rule:** Enforced at API level, Flutter UI should guide users
3. **Warehouse Overflow:** Prevent at both API and Flutter layers
4. **Offline Support:** Cache aggressively, sync intelligently
5. **Test Coverage:** Backend economy code requires 100% coverage
6. **Admin Panel Required:** All game parameters, tick times, products, and images must be manageable via admin panel
7. **NO Emojis:** Use icons only (Material Icons/Font Awesome), never use emojis in game or admin UI
8. **Asset Management:** Product images and store visuals must be uploaded via admin panel, not hardcoded

---

*Last Updated: 2025-10-29*