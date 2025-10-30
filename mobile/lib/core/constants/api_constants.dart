class ApiConstants {
  ApiConstants._();

  // Base URL - Update this with your server IP
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000/api/v1'; // iOS simulator
  // static const String baseUrl = 'http://YOUR_SERVER_IP:3000/api/v1'; // Physical device

  // Auth Endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String profile = '/auth/me';
  static const String updateProfile = '/auth/profile';
  static const String changePassword = '/auth/change-password';

  // Product Endpoints
  static const String products = '/products';
  static String productById(String id) => '/products/$id';
  static String productPriceHistory(String id) => '/products/$id/price-history';
  static String productStats(String id) => '/products/$id/stats';
  static String calculatePrice(String id) => '/products/$id/calculate-price';

  // Market Endpoints
  static const String marketListings = '/market/listings';
  static const String myListings = '/market/my-listings';
  static String buyFromMarket(String id) => '/market/buy/$id';
  static String cancelListing(String id) => '/market/listings/$id';

  // DealBaron Endpoints
  static String dealBaronPrice(String productId) => '/dealbaron/price/$productId';
  static const String dealBaronBuy = '/dealbaron/buy';
  static const String dealBaronSell = '/dealbaron/sell';

  // Business Endpoints
  static const String businesses = '/business';
  static String businessById(String id) => '/business/$id';
  static String businessInventory(String id) => '/business/$id/inventory';

  // Production Endpoints
  static const String startProduction = '/production/start';
  static String activeProduction(String businessId) => '/production/active/$businessId';
  static String completedProduction(String businessId) => '/production/completed/$businessId';
  static String collectProduction(String jobId) => '/production/collect/$jobId';
  static String cancelProduction(String jobId) => '/production/$jobId';

  // Headers
  static Map<String, String> get headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  static Map<String, String> headersWithAuth(String token) => {
        ...headers,
        'Authorization': 'Bearer $token',
      };

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}
