# DealBaron Flutter Mobil Uygulama Geliştirme Planı

## 📱 Genel Bakış

**Platform:** Android (Flutter)
**Backend:** Linux VDS (REST API)
**Minimum SDK:** Android 6.0 (API Level 23)
**Target SDK:** Android 14 (API Level 34)

---

## 🏗️ Teknik Stack

### Flutter & Dart
```yaml
# pubspec.yaml temel bağımlılıklar

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0  # veya provider / bloc

  # API & Networking
  dio: ^5.4.0
  retrofit: ^4.0.0
  pretty_dio_logger: ^1.3.1

  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2

  # Database
  sqflite: ^2.3.0
  drift: ^2.14.0  # Type-safe SQL

  # UI Components
  flutter_screenutil: ^5.9.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  pull_to_refresh: ^2.0.0
  fl_chart: ^0.65.0  # Grafikler için

  # Navigation
  go_router: ^12.1.3

  # Authentication
  flutter_secure_storage: ^9.0.0
  jwt_decoder: ^2.0.1

  # Utilities
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  intl: ^0.19.0  # Para birimi formatı

  # Push Notifications
  firebase_messaging: ^14.7.6
  flutter_local_notifications: ^16.3.0

dev_dependencies:
  build_runner: ^2.4.7
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.0
  hive_generator: ^2.0.1
```

---

## 📂 Proje Yapısı (Clean Architecture)

```
lib/
├── main.dart
├── app.dart
│
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_keys.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   └── text_styles.dart
│   ├── utils/
│   │   ├── currency_formatter.dart
│   │   ├── date_formatter.dart
│   │   └── validators.dart
│   ├── errors/
│   │   └── failures.dart
│   └── network/
│       ├── dio_client.dart
│       └── api_interceptor.dart
│
├── data/
│   ├── models/
│   │   ├── player_model.dart
│   │   ├── product_model.dart
│   │   ├── business_model.dart
│   │   ├── market_listing_model.dart
│   │   └── transaction_model.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   ├── player_repository.dart
│   │   ├── market_repository.dart
│   │   └── business_repository.dart
│   ├── datasources/
│   │   ├── remote/
│   │   │   ├── auth_api.dart
│   │   │   ├── market_api.dart
│   │   │   └── business_api.dart
│   │   └── local/
│   │       ├── player_local_storage.dart
│   │       └── cache_manager.dart
│   └── services/
│       ├── economy_service.dart
│       └── notification_service.dart
│
├── domain/
│   ├── entities/
│   │   ├── player.dart
│   │   ├── product.dart
│   │   ├── business.dart
│   │   └── market_listing.dart
│   ├── repositories/ (interfaces)
│   │   └── i_market_repository.dart
│   └── usecases/
│       ├── buy_product_usecase.dart
│       ├── sell_product_usecase.dart
│       └── calculate_price_usecase.dart
│
├── presentation/
│   ├── providers/ (Riverpod)
│   │   ├── auth_provider.dart
│   │   ├── player_provider.dart
│   │   ├── market_provider.dart
│   │   └── business_provider.dart
│   ├── screens/
│   │   ├── splash/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   └── widgets/
│   │   ├── market/
│   │   │   ├── market_screen.dart
│   │   │   ├── product_detail_screen.dart
│   │   │   └── widgets/
│   │   ├── business/
│   │   │   ├── business_screen.dart
│   │   │   ├── production_screen.dart
│   │   │   └── warehouse_screen.dart
│   │   ├── profile/
│   │   │   └── profile_screen.dart
│   │   └── tutorial/
│   │       └── tutorial_screen.dart
│   └── widgets/
│       ├── deal_baron_app_bar.dart
│       ├── product_card.dart
│       ├── price_chart.dart
│       └── loading_indicator.dart
│
└── routes/
    └── app_router.dart
```

---

## 🎨 UI/UX Tasarım Prensipleri

### 1. Renk Paleti
```dart
// lib/core/theme/colors.dart
class AppColors {
  // Primary - DealBaron teması
  static const primary = Color(0xFF1A237E);        // Koyu mavi
  static const primaryLight = Color(0xFF534BAE);
  static const primaryDark = Color(0xFF000051);

  // Accent
  static const accent = Color(0xFFFFB300);         // Altın sarısı
  static const accentLight = Color(0xFFFFE54C);
  static const accentDark = Color(0xFFC68400);

  // Status Colors
  static const success = Color(0xFF4CAF50);
  static const error = Color(0xFFF44336);
  static const warning = Color(0xFFFF9800);
  static const info = Color(0xFF2196F3);

  // Market
  static const priceUp = Color(0xFF4CAF50);
  static const priceDown = Color(0xFFF44336);
  static const priceStable = Color(0xFF9E9E9E);

  // Backgrounds
  static const background = Color(0xFFF5F5F5);
  static const surface = Color(0xFFFFFFFF);
  static const cardBackground = Color(0xFFFFFFFF);
}
```

### 2. DealBaron Üst Bar (Her Ekranda)
```dart
// lib/presentation/widgets/deal_baron_app_bar.dart
class DealBaronAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Widget build(BuildContext context) {
    final player = ref.watch(playerProvider);

    return AppBar(
      backgroundColor: AppColors.primary,
      elevation: 4,
      title: Row(
        children: [
          // Logo
          Image.asset('assets/images/logo.png', height: 32),
          SizedBox(width: 8),
          Text('DealBaron', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
      actions: [
        // Bakiye
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Icon(Icons.account_balance_wallet, size: 18),
              SizedBox(width: 4),
              Text(
                CurrencyFormatter.format(player.balance),
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        SizedBox(width: 8),

        // Seviye
        Container(
          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primaryDark,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text('Lv ${player.level}'),
        ),
        SizedBox(width: 8),

        // Bildirimler
        IconButton(
          icon: Badge(
            label: Text('3'),
            child: Icon(Icons.notifications),
          ),
          onPressed: () => context.push('/notifications'),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}
```

### 3. Alt Navigation Bar
```dart
// lib/presentation/widgets/bottom_nav_bar.dart
class DealBaronBottomNavBar extends StatelessWidget {
  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: Colors.grey,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Ana Sayfa',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.store),
          label: 'Pazar',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.factory),
          label: 'İşletme',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profil',
        ),
      ],
      onTap: (index) {
        switch (index) {
          case 0:
            context.go('/home');
            break;
          case 1:
            context.go('/market');
            break;
          case 2:
            context.go('/business');
            break;
          case 3:
            context.go('/profile');
            break;
        }
      },
    );
  }
}
```

---

## 🔌 API Entegrasyonu

### 1. Dio Client Setup
```dart
// lib/core/network/dio_client.dart
class DioClient {
  static const String baseUrl = 'https://api.dealbaron.com';

  late final Dio _dio;

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: Duration(seconds: 30),
        receiveTimeout: Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      ApiInterceptor(),
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
      ),
    ]);
  }

  Dio get dio => _dio;
}

// lib/core/network/api_interceptor.dart
class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Token ekle
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token refresh veya logout
      await _refreshToken();
    }
    super.onError(err, handler);
  }
}
```

### 2. Retrofit API Definitions
```dart
// lib/data/datasources/remote/market_api.dart
@RestApi(baseUrl: DioClient.baseUrl)
abstract class MarketApi {
  factory MarketApi(Dio dio) = _MarketApi;

  @GET('/api/v1/market/listings')
  Future<ApiResponse<List<MarketListingModel>>> getListings(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('category') String? category,
  );

  @GET('/api/v1/market/listings/{id}')
  Future<ApiResponse<MarketListingModel>> getListingById(
    @Path('id') String id,
  );

  @POST('/api/v1/market/buy')
  Future<ApiResponse<TransactionModel>> buyProduct(
    @Body() BuyProductRequest request,
  );

  @POST('/api/v1/market/sell')
  Future<ApiResponse<MarketListingModel>> createListing(
    @Body() CreateListingRequest request,
  );

  @GET('/api/v1/market/price-history/{productId}')
  Future<ApiResponse<List<PriceHistoryModel>>> getPriceHistory(
    @Path('productId') String productId,
    @Query('days') int days,
  );
}
```

### 3. Model Definitions (Freezed + JSON Serializable)
```dart
// lib/data/models/product_model.dart
@freezed
class ProductModel with _$ProductModel {
  const factory ProductModel({
    required String id,
    required String name,
    required double basePrice,
    required double volume,
    required String category,
    required String rarity,
    required double elasticityFactor,
    String? imageUrl,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
}

// lib/data/models/market_listing_model.dart
@freezed
class MarketListingModel with _$MarketListingModel {
  const factory MarketListingModel({
    required String id,
    required String sellerId,
    required String sellerName,
    required ProductModel product,
    required int quantity,
    required double price,
    required DateTime listedAt,
    required DateTime expiresAt,
    required String status,
  }) = _MarketListingModel;

  factory MarketListingModel.fromJson(Map<String, dynamic> json) =>
      _$MarketListingModelFromJson(json);
}
```

---

## 📊 State Management (Riverpod)

### 1. Player Provider
```dart
// lib/presentation/providers/player_provider.dart
@riverpod
class PlayerNotifier extends _$PlayerNotifier {
  @override
  Future<PlayerModel> build() async {
    return _playerRepository.getCurrentPlayer();
  }

  Future<void> refreshBalance() async {
    state = await AsyncValue.guard(() async {
      final player = await _playerRepository.getCurrentPlayer();
      return player;
    });
  }

  Future<void> addXP(int amount) async {
    state = await AsyncValue.guard(() async {
      return await _playerRepository.addXP(amount);
    });
  }
}

// Kullanım:
final playerProvider = PlayerNotifierProvider();

// Widget içinde:
final player = ref.watch(playerProvider);
player.when(
  data: (player) => Text(player.username),
  loading: () => CircularProgressIndicator(),
  error: (error, stack) => Text('Error: $error'),
);
```

### 2. Market Provider
```dart
// lib/presentation/providers/market_provider.dart
@riverpod
class MarketListings extends _$MarketListings {
  int _page = 1;
  static const _limit = 20;

  @override
  Future<List<MarketListingModel>> build() async {
    return _fetchListings();
  }

  Future<void> loadMore() async {
    final currentState = state.value ?? [];
    _page++;

    final newListings = await _fetchListings();
    state = AsyncValue.data([...currentState, ...newListings]);
  }

  Future<void> refresh() async {
    _page = 1;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchListings());
  }

  Future<List<MarketListingModel>> _fetchListings() async {
    return await _marketRepository.getListings(
      page: _page,
      limit: _limit,
    );
  }
}
```

---

## 📱 Önemli Ekranlar

### 1. Pazar Ekranı
```dart
// lib/presentation/screens/market/market_screen.dart
class MarketScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listings = ref.watch(marketListingsProvider);
    final dealBaronPrice = ref.watch(dealBaronPriceProvider);

    return Scaffold(
      appBar: DealBaronAppBar(),
      body: Column(
        children: [
          // DealBaron Referans Fiyat Kartı (Sabit En Üstte)
          DealBaronPriceCard(
            price: dealBaronPrice,
          ),

          // Filtreler
          MarketFilterBar(
            onFilterChanged: (filter) {
              ref.read(marketFilterProvider.notifier).state = filter;
            },
          ),

          // Ürün Listesi
          Expanded(
            child: listings.when(
              data: (items) => RefreshIndicator(
                onRefresh: () => ref.refresh(marketListingsProvider.future),
                child: ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final listing = items[index];
                    return MarketListingCard(
                      listing: listing,
                      dealBaronPrice: dealBaronPrice,
                      onTap: () {
                        context.push('/market/${listing.id}');
                      },
                    );
                  },
                ),
              ),
              loading: () => ListView.builder(
                itemCount: 10,
                itemBuilder: (_, __) => ShimmerListingCard(),
              ),
              error: (error, _) => ErrorWidget(error: error),
            ),
          ),
        ],
      ),
    );
  }
}
```

### 2. Ürün Detay Ekranı
```dart
// lib/presentation/screens/market/product_detail_screen.dart
class ProductDetailScreen extends ConsumerWidget {
  final String listingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listing = ref.watch(listingDetailProvider(listingId));
    final priceHistory = ref.watch(priceHistoryProvider(listing.product.id));

    return Scaffold(
      appBar: DealBaronAppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Ürün Görseli
            ProductImage(url: listing.product.imageUrl),

            // Fiyat Bilgisi
            PriceInfoCard(
              currentPrice: listing.price,
              dealBaronPrice: dealBaronPrice,
              priceChange: calculatePriceChange(),
            ),

            // 7 Günlük Fiyat Grafiği
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '7 Günlük Fiyat Geçmişi',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    SizedBox(height: 16),
                    PriceChart(
                      data: priceHistory,
                      height: 200,
                    ),
                  ],
                ),
              ),
            ),

            // Ürün Detayları
            ProductDetailsCard(product: listing.product),

            // Satıcı Bilgisi
            SellerInfoCard(seller: listing.seller),

            // Talep Tahmini
            DemandForecastCard(
              product: listing.product,
              currentPrice: listing.price,
            ),
          ],
        ),
      ),
      bottomNavigationBar: BuyButton(
        listing: listing,
        onPressed: () async {
          await _showBuyDialog(context, ref, listing);
        },
      ),
    );
  }
}
```

### 3. Fiyat Grafiği Widget
```dart
// lib/presentation/widgets/price_chart.dart
class PriceChart extends StatelessWidget {
  final List<PricePoint> data;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          lineBarsData: [
            LineChartBarData(
              spots: data.asMap().entries.map((entry) {
                return FlSpot(
                  entry.key.toDouble(),
                  entry.value.price,
                );
              }).toList(),
              isCurved: true,
              color: AppColors.primary,
              barWidth: 3,
              dotData: FlDotData(show: true),
              belowBarData: BarAreaData(
                show: true,
                color: AppColors.primary.withOpacity(0.1),
              ),
            ),
          ],
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final date = data[value.toInt()].date;
                  return Text(
                    DateFormat('dd/MM').format(date),
                    style: TextStyle(fontSize: 10),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  return Text(
                    CurrencyFormatter.formatCompact(value),
                    style: TextStyle(fontSize: 10),
                  );
                },
              ),
            ),
          ),
          gridData: FlGridData(show: true),
          borderData: FlBorderData(show: true),
        ),
      ),
    );
  }
}
```

---

## 💾 Offline Support & Caching

### 1. Hive Local Database
```dart
// lib/data/datasources/local/cache_manager.dart
class CacheManager {
  late Box<ProductModel> _productsBox;
  late Box<MarketListingModel> _listingsBox;

  Future<void> init() async {
    await Hive.initFlutter();

    Hive.registerAdapter(ProductModelAdapter());
    Hive.registerAdapter(MarketListingModelAdapter());

    _productsBox = await Hive.openBox<ProductModel>('products');
    _listingsBox = await Hive.openBox<MarketListingModel>('listings');
  }

  // Cache products
  Future<void> cacheProducts(List<ProductModel> products) async {
    final map = {for (var p in products) p.id: p};
    await _productsBox.putAll(map);
  }

  List<ProductModel> getCachedProducts() {
    return _productsBox.values.toList();
  }

  // Cache listings (5 dakika TTL)
  Future<void> cacheListings(List<MarketListingModel> listings) async {
    await _listingsBox.clear();
    final map = {for (var l in listings) l.id: l};
    await _listingsBox.putAll(map);

    // Timestamp kaydet
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('listings_cached_at', DateTime.now().millisecondsSinceEpoch);
  }

  Future<List<MarketListingModel>?> getCachedListings() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedAt = prefs.getInt('listings_cached_at');

    if (cachedAt == null) return null;

    final now = DateTime.now().millisecondsSinceEpoch;
    final diff = now - cachedAt;

    // 5 dakikadan eski ise null döndür
    if (diff > 5 * 60 * 1000) return null;

    return _listingsBox.values.toList();
  }
}
```

### 2. Repository Pattern (Cache-First)
```dart
// lib/data/repositories/market_repository.dart
class MarketRepository {
  final MarketApi _api;
  final CacheManager _cache;
  final ConnectivityService _connectivity;

  Future<List<MarketListingModel>> getListings({
    required int page,
    required int limit,
  }) async {
    // Önce cache'e bak
    if (page == 1) {
      final cached = await _cache.getCachedListings();
      if (cached != null && cached.isNotEmpty) {
        return cached;
      }
    }

    // İnternet kontrolü
    if (!await _connectivity.isConnected) {
      throw NoInternetException();
    }

    // API'den çek
    try {
      final response = await _api.getListings(page, limit, null);

      // Cache'e kaydet
      if (page == 1) {
        await _cache.cacheListings(response.data);
      }

      return response.data;
    } on DioException catch (e) {
      // Hata durumunda cache'i döndür
      final cached = await _cache.getCachedListings();
      if (cached != null) {
        return cached;
      }
      rethrow;
    }
  }
}
```

---

## 🔔 Push Notifications (Firebase)

### 1. Firebase Setup
```dart
// lib/data/services/notification_service.dart
class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> init() async {
    // Permission iste
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Token al
    final token = await _fcm.getToken();
    print('FCM Token: $token');

    // Backend'e gönder
    await _registerToken(token);

    // Foreground mesajları dinle
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Background mesajları dinle
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Foreground message: ${message.notification?.title}');

    // Local notification göster
    _showLocalNotification(
      title: message.notification?.title ?? '',
      body: message.notification?.body ?? '',
      payload: message.data,
    );
  }

  Future<void> _showLocalNotification({
    required String title,
    required String body,
    Map<String, dynamic>? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'deal_baron_channel',
      'DealBaron Bildirimleri',
      channelDescription: 'Oyun içi bildirimler',
      importance: Importance.high,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    await _localNotifications.show(
      0,
      title,
      body,
      details,
      payload: jsonEncode(payload),
    );
  }
}
```

### 2. Notification Types
```dart
// Üretim tamamlandı
{
  "type": "production_completed",
  "productId": "123",
  "productName": "Buğday",
  "quantity": 100
}

// Satış gerçekleşti
{
  "type": "sale_completed",
  "buyerName": "Ali123",
  "productName": "Çelik",
  "revenue": 5000
}

// Pazar fırsatı
{
  "type": "market_opportunity",
  "productName": "Altın",
  "priceChange": -15.5,
  "message": "Altın fiyatları %15 düştü! Alım fırsatı."
}

// Seviye atlama
{
  "type": "level_up",
  "newLevel": 10,
  "rewards": ["Market unlocked", "500 coins"]
}
```

---

## 🧪 Testing

### 1. Unit Tests
```dart
// test/services/economy_service_test.dart
void main() {
  group('EconomyService', () {
    late EconomyService service;

    setUp(() {
      service = EconomyService();
    });

    test('calculateDemand returns correct value', () {
      final product = ProductModel(
        id: '1',
        name: 'Wheat',
        basePrice: 10,
        a: 1000,
        b: 2,
        // ...
      );

      final demand = service.calculateDemand(product, 100);
      expect(demand, 800); // 1000 - 2*100
    });

    test('calculatePrice with markup', () {
      final price = service.calculatePrice(
        basePrice: 100,
        markup: 0.2,
        elasticityFactor: 0.1,
        marketPressure: 0.5,
      );

      expect(price, closeTo(126, 0.01));
    });
  });
}
```

### 2. Widget Tests
```dart
// test/widgets/price_chart_test.dart
void main() {
  testWidgets('PriceChart renders correctly', (tester) async {
    final data = [
      PricePoint(date: DateTime(2024, 1, 1), price: 100),
      PricePoint(date: DateTime(2024, 1, 2), price: 110),
      PricePoint(date: DateTime(2024, 1, 3), price: 105),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PriceChart(data: data, height: 200),
        ),
      ),
    );

    expect(find.byType(LineChart), findsOneWidget);
  });
}
```

### 3. Integration Tests
```dart
// integration_test/market_flow_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete market purchase flow', (tester) async {
    await tester.pumpWidget(MyApp());

    // Login
    await tester.enterText(find.byKey(Key('username')), 'testuser');
    await tester.enterText(find.byKey(Key('password')), 'password123');
    await tester.tap(find.byKey(Key('login_button')));
    await tester.pumpAndSettle();

    // Navigate to market
    await tester.tap(find.byIcon(Icons.store));
    await tester.pumpAndSettle();

    // Select product
    await tester.tap(find.byType(MarketListingCard).first);
    await tester.pumpAndSettle();

    // Buy
    await tester.tap(find.text('Satın Al'));
    await tester.pumpAndSettle();

    // Verify success
    expect(find.text('Satın alma başarılı'), findsOneWidget);
  });
}
```

---

## 📦 Build & Release

### 1. Build Configurations
```dart
// lib/core/config/app_config.dart
enum Environment { dev, staging, production }

class AppConfig {
  static Environment _environment = Environment.dev;

  static String get apiBaseUrl {
    switch (_environment) {
      case Environment.dev:
        return 'http://10.0.2.2:3000'; // Android emulator localhost
      case Environment.staging:
        return 'https://staging-api.dealbaron.com';
      case Environment.production:
        return 'https://api.dealbaron.com';
    }
  }

  static bool get enableLogging => _environment != Environment.production;
}
```

### 2. Build Commands
```bash
# Development build
flutter build apk --debug --flavor dev -t lib/main_dev.dart

# Staging build
flutter build apk --release --flavor staging -t lib/main_staging.dart

# Production build (App Bundle for Play Store)
flutter build appbundle --release --flavor production -t lib/main_production.dart

# Split APKs (daha küçük boyut)
flutter build apk --split-per-abi --release
```

### 3. android/app/build.gradle
```gradle
android {
    defaultConfig {
        applicationId "com.dealbaron.app"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName

        // Multidex support
        multiDexEnabled true
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }

    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
        }
        production {
            dimension "environment"
        }
    }
}
```

---

## 📊 Performance Optimization

### 1. Image Optimization
```dart
// Cached network images
CachedNetworkImage(
  imageUrl: product.imageUrl,
  placeholder: (context, url) => Shimmer.fromColors(
    baseColor: Colors.grey[300]!,
    highlightColor: Colors.grey[100]!,
    child: Container(color: Colors.white),
  ),
  errorWidget: (context, url, error) => Icon(Icons.error),
  memCacheWidth: 300, // Resize in memory
  memCacheHeight: 300,
);
```

### 2. List Optimization
```dart
// ListView.builder with caching
ListView.builder(
  cacheExtent: 1000, // Cache 1000px ahead
  itemExtent: 100, // Fixed height for better performance
  itemCount: items.length,
  itemBuilder: (context, index) {
    return MarketListingCard(listing: items[index]);
  },
);
```

### 3. Code Splitting
```dart
// Lazy load heavy screens
final heavyScreen = () async {
  return await import('./screens/analytics_screen.dart');
};
```

---

## 🔒 Security

### 1. Secure Storage
```dart
// lib/core/storage/secure_storage.dart
class SecureStorageService {
  final _storage = FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }
}
```

### 2. SSL Pinning (Opsiyonel)
```dart
// Enhanced security
final dio = Dio();
(dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate = (client) {
  client.badCertificateCallback = (X509Certificate cert, String host, int port) {
    // Pin your certificate
    return cert.sha1.toString() == 'YOUR_CERT_SHA1';
  };
  return client;
};
```

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 1.0
**Platform:** Flutter/Android
