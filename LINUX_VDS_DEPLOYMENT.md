# DealBaron Linux VDS Backend Deployment Kılavuzu

## 🖥️ Sunucu Özellikleri (Önerilen)

### Minimum Gereksinimler (Başlangıç - 100 kullanıcı)
- **CPU:** 2 vCPU
- **RAM:** 4 GB
- **Disk:** 50 GB SSD
- **Bant Genişliği:** 100 Mbps
- **OS:** Ubuntu 22.04 LTS

### Önerilen (Orta Ölçek - 1000 kullanıcı)
- **CPU:** 4 vCPU
- **RAM:** 8 GB
- **Disk:** 100 GB SSD
- **Bant Genişliği:** 1 Gbps
- **OS:** Ubuntu 22.04 LTS

### VDS Sağlayıcıları (Türkiye)
- **Turhost:** 50-200 TL/ay
- **Hosting.com.tr:** 60-250 TL/ay
- **DigitalOcean:** $6-$24/ay (global)
- **Linode:** $5-$20/ay (global)
- **Hetzner:** €4-€16/ay (Almanya)

---

## 🏗️ Backend Stack (Node.js + Express)

### Teknoloji Seçimi
```
Backend Framework: Node.js 20 LTS + Express.js
Database: PostgreSQL 16
Cache: Redis 7
Process Manager: PM2
Web Server: Nginx (Reverse Proxy)
SSL: Let's Encrypt (Certbot)
Monitoring: PM2 + Grafana (opsiyonel)
```

---

## 📋 Adım Adım Kurulum

### 1. İlk Sunucu Kurulumu

#### 1.1 SSH Bağlantısı
```bash
# VDS'nize bağlanın
ssh root@YOUR_SERVER_IP

# Şifre değiştir (ilk giriş)
passwd
```

#### 1.2 Sistem Güncellemesi
```bash
# Sistem güncelleme
apt update && apt upgrade -y

# Temel araçlar
apt install -y curl wget git vim ufw fail2ban
```

#### 1.3 Güvenlik Ayarları
```bash
# Firewall yapılandırma
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban başlat (Brute force koruması)
systemctl enable fail2ban
systemctl start fail2ban

# Root login'i kapat (Önerilen)
# Önce sudo kullanıcısı oluştur
adduser dealbaron
usermod -aG sudo dealbaron

# SSH key-based auth ayarla (opsiyonel ama önerilen)
# Local makinenizde:
# ssh-keygen -t rsa -b 4096
# ssh-copy-id dealbaron@YOUR_SERVER_IP
```

---

### 2. Node.js Kurulumu

```bash
# NodeSource repository ekle (Node.js 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js ve npm kur
apt install -y nodejs

# Versiyon kontrolü
node -v  # v20.x.x
npm -v   # 10.x.x

# Yarn kur (opsiyonel)
npm install -g yarn

# PM2 kur (Process Manager)
npm install -g pm2
```

---

### 3. PostgreSQL Kurulumu

```bash
# PostgreSQL 16 kur
apt install -y postgresql postgresql-contrib

# PostgreSQL başlat
systemctl start postgresql
systemctl enable postgresql

# PostgreSQL kullanıcısına geç
su - postgres

# Database ve kullanıcı oluştur
psql

CREATE DATABASE dealbaron_prod;
CREATE USER dealbaron WITH ENCRYPTED PASSWORD 'GÜÇLÜ_ŞİFRE_BURAYA';
GRANT ALL PRIVILEGES ON DATABASE dealbaron_prod TO dealbaron;
\q

exit  # postgres kullanıcısından çık

# Uzaktan bağlantıya izin ver (Sadece gerekirse)
# /etc/postgresql/16/main/postgresql.conf
# listen_addresses = 'localhost'  # Varsayılan (güvenli)

# /etc/postgresql/16/main/pg_hba.conf
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            md5
```

---

### 4. Redis Kurulumu

```bash
# Redis kur
apt install -y redis-server

# Redis yapılandırma
vim /etc/redis/redis.conf

# Şu satırları değiştir:
# supervised systemd
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Redis başlat
systemctl restart redis-server
systemctl enable redis-server

# Test
redis-cli ping
# PONG döndürmeli
```

---

### 5. Nginx Kurulumu

```bash
# Nginx kur
apt install -y nginx

# Nginx başlat
systemctl start nginx
systemctl enable nginx

# Nginx yapılandırma dosyası oluştur
vim /etc/nginx/sites-available/dealbaron

# Aşağıdaki yapılandırmayı ekle:
```

#### Nginx Yapılandırması
```nginx
# /etc/nginx/sites-available/dealbaron

upstream dealbaron_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.dealbaron.com;  # Domain adınız

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    # Logs
    access_log /var/log/nginx/dealbaron_access.log;
    error_log /var/log/nginx/dealbaron_error.log;

    location / {
        proxy_pass http://dealbaron_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://dealbaron_backend;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
```

```bash
# Symlink oluştur
ln -s /etc/nginx/sites-available/dealbaron /etc/nginx/sites-enabled/

# Default site'ı kaldır
rm /etc/nginx/sites-enabled/default

# Nginx test
nginx -t

# Nginx restart
systemctl restart nginx
```

---

### 6. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
certbot --nginx -d api.dealbaron.com

# Otomatik yenileme testi
certbot renew --dry-run

# Certbot otomatik yenileme zaten kurulu
# /etc/cron.d/certbot içinde
```

SSL sonrası Nginx yapılandırması otomatik güncellenir:
```nginx
server {
    listen 443 ssl http2;
    server_name api.dealbaron.com;

    ssl_certificate /etc/letsencrypt/live/api.dealbaron.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.dealbaron.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... geri kalan yapılandırma
}

server {
    listen 80;
    server_name api.dealbaron.com;
    return 301 https://$server_name$request_uri;
}
```

---

### 7. Backend Uygulama Deploy

#### 7.1 Proje Klasörü Oluştur
```bash
# Uygulama dizini
mkdir -p /var/www/dealbaron
cd /var/www/dealbaron

# Git ile klonla
git clone https://github.com/yourorg/dealbaron-backend.git .

# veya SFTP ile yükle
# scp -r ./dealbaron-backend/* dealbaron@SERVER_IP:/var/www/dealbaron/
```

#### 7.2 Ortam Değişkenleri
```bash
# .env dosyası oluştur
vim /var/www/dealbaron/.env
```

```env
# /var/www/dealbaron/.env

NODE_ENV=production

# Server
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://dealbaron:GÜÇLÜ_ŞİFRE@localhost:5432/dealbaron_prod

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=çok_güçlü_rastgele_secret_buraya_min_64_karakter
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=başka_güçlü_secret
REFRESH_TOKEN_EXPIRES_IN=30d

# API Keys (ihtiyaç halinde)
FIREBASE_SERVER_KEY=your_firebase_key_here

# CORS
CORS_ORIGIN=https://dealbaron.com

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

```bash
# .env dosyası izinleri
chmod 600 .env
```

#### 7.3 Bağımlılıkları Kur
```bash
cd /var/www/dealbaron

# Production dependencies
npm ci --production

# TypeScript build (eğer kullanıyorsanız)
npm run build
```

#### 7.4 Database Migration
```bash
# Migration'ları çalıştır
npm run db:migrate

# Seed data (production için dikkatli!)
# npm run db:seed
```

#### 7.5 PM2 ile Başlat
```bash
# PM2 ekosistem dosyası oluştur
vim /var/www/dealbaron/ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dealbaron-api',
    script: './dist/index.js',  // veya './src/index.js'
    instances: 'max',  // CPU sayısı kadar instance
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};
```

```bash
# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2 otomatik başlatma
pm2 startup systemd
pm2 save

# Status kontrolü
pm2 status

# Logları izle
pm2 logs dealbaron-api

# Monitoring
pm2 monit
```

---

### 8. Cron Jobs (Arka Plan Görevleri)

```bash
# Cron job ekle
crontab -e
```

```cron
# Ekonomi güncellemesi (5 dakikada bir)
*/5 * * * * curl -X POST http://localhost:3000/api/internal/update-economy

# Günlük yedekleme (gece 3'te)
0 3 * * * /var/www/dealbaron/scripts/backup.sh

# Log rotation (gece 2'de)
0 2 * * * /var/www/dealbaron/scripts/rotate-logs.sh
```

#### Backup Script Örneği
```bash
# /var/www/dealbaron/scripts/backup.sh
#!/bin/bash

BACKUP_DIR="/var/backups/dealbaron"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U dealbaron dealbaron_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Eski backupları sil (30 günden eski)
find $BACKUP_DIR -type f -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Script'i executable yap
chmod +x /var/www/dealbaron/scripts/backup.sh

# Backup dizini oluştur
mkdir -p /var/backups/dealbaron
```

---

## 📊 Monitoring & Logging

### 1. PM2 Monitoring
```bash
# Gerçek zamanlı monitoring
pm2 monit

# Web dashboard (opsiyonel - ücretsiz 4 sunucu)
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
# pm2.io'da dashboard görebilirsiniz
```

### 2. Log Management
```bash
# PM2 log rotation
pm2 install pm2-logrotate

# Yapılandırma
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 3. Sistem Metrikleri
```bash
# htop kur (daha iyi top)
apt install -y htop

# Disk kullanımı
df -h

# Memory kullanımı
free -h

# Network kullanımı
apt install -y nethogs
nethogs
```

### 4. Uptime Monitoring (Opsiyonel)
**Ücretsiz Servisler:**
- **UptimeRobot:** https://uptimerobot.com (50 monitor ücretsiz)
- **StatusCake:** https://www.statuscake.com
- **Freshping:** https://www.freshworks.com/website-monitoring/

---

## 🔒 Güvenlik Best Practices

### 1. SSH Hardening
```bash
# /etc/ssh/sshd_config
vim /etc/ssh/sshd_config

# Değiştirilecek satırlar:
# PermitRootLogin no
# PasswordAuthentication no  # SSH key kullanıyorsanız
# Port 2222  # Default port değiştir (opsiyonel)

# SSH restart
systemctl restart sshd
```

### 2. Automatic Security Updates
```bash
apt install -y unattended-upgrades

# Yapılandırma
dpkg-reconfigure -plow unattended-upgrades
```

### 3. Database Backup Encryption
```bash
# Encrypted backup
pg_dump -U dealbaron dealbaron_prod | gzip | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc -k YOUR_ENCRYPTION_PASSWORD
```

### 4. Environment Variables Security
```bash
# .env dosyası asla git'e commitlenmemeli
echo ".env" >> .gitignore

# Dosya izinleri
chmod 600 /var/www/dealbaron/.env
chown dealbaron:dealbaron /var/www/dealbaron/.env
```

---

## 🚀 Deployment Workflow (CI/CD)

### GitHub Actions ile Otomatik Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to VDS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VDS_HOST }}
          username: ${{ secrets.VDS_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/dealbaron
            git pull origin main
            npm ci --production
            npm run build
            npm run db:migrate
            pm2 reload dealbaron-api
```

### Manuel Deploy Script
```bash
# /var/www/dealbaron/deploy.sh
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Run migrations
npm run db:migrate

# Reload PM2
pm2 reload dealbaron-api

echo "✅ Deployment completed!"
```

```bash
chmod +x /var/www/dealbaron/deploy.sh

# Deploy komutu
cd /var/www/dealbaron && ./deploy.sh
```

---

## 📈 Scaling (Büyüme Planı)

### 1. Vertical Scaling (Daha Güçlü Sunucu)
```
Başlangıç:  2 vCPU, 4 GB RAM  →  100 kullanıcı
1. Büyüme:  4 vCPU, 8 GB RAM  →  1,000 kullanıcı
2. Büyüme:  8 vCPU, 16 GB RAM →  5,000 kullanıcı
```

### 2. Horizontal Scaling (Birden Fazla Sunucu)

**Load Balancer + Multiple App Servers**
```
             [Load Balancer]
                   |
        +----------+----------+
        |                     |
   [App Server 1]       [App Server 2]
        |                     |
        +----------+----------+
                   |
          [PostgreSQL Master]
                   |
          [PostgreSQL Replica] (Read-only)
```

**Veritabanı Replication:**
```bash
# Master-Slave PostgreSQL replication
# Master: Write operations
# Slave: Read operations

# Connection pooling (PgBouncer)
apt install -y pgbouncer
```

### 3. CDN Kullanımı
- Static assets için Cloudflare CDN
- Image optimization
- DDoS protection

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"
```bash
# Portu kullanan process'i bul
lsof -i :3000

# Process'i öldür
kill -9 PID
```

### Problem: "Database connection error"
```bash
# PostgreSQL durumu
systemctl status postgresql

# Connection test
psql -U dealbaron -d dealbaron_prod -h localhost

# Logları kontrol et
tail -f /var/log/postgresql/postgresql-16-main.log
```

### Problem: "Out of memory"
```bash
# Memory kullanımı
free -h

# PM2 memory limiti ayarla
# ecosystem.config.js içinde:
# max_memory_restart: '1G'
```

### Problem: "SSL certificate expired"
```bash
# Sertifika durumu
certbot certificates

# Manuel yenileme
certbot renew
```

---

## 📝 Günlük Bakım Kontrol Listesi

### Günlük
- [ ] PM2 status kontrolü: `pm2 status`
- [ ] Disk kullanımı: `df -h`
- [ ] Log kontrolü: `pm2 logs --lines 100`

### Haftalık
- [ ] Database backup kontrolü
- [ ] Security update: `apt update && apt upgrade`
- [ ] Log dosyası boyutları
- [ ] Uptime metrikleri

### Aylık
- [ ] SSL sertifika durumu
- [ ] Database performance analizi
- [ ] Eski backup temizleme
- [ ] Security audit

---

## 💰 Maliyet Tahmini (Aylık)

### Minimum Setup
- VDS (4GB RAM): 100-150 TL
- Domain: 50-100 TL/yıl (aylık ~8 TL)
- SSL: Ücretsiz (Let's Encrypt)
- **Toplam: ~160 TL/ay**

### Önerilen Setup (1000 kullanıcı)
- VDS (8GB RAM): 200-300 TL
- Domain: 8 TL
- CDN (Cloudflare Free)
- Monitoring (PM2 Plus): Ücretsiz
- **Toplam: ~250-350 TL/ay**

---

## 📞 Destek ve Yardım

### Faydalı Komutlar Özeti
```bash
# PM2
pm2 status           # Durum
pm2 logs             # Loglar
pm2 restart all      # Yeniden başlat
pm2 monit            # Monitoring

# Nginx
nginx -t             # Test
systemctl status nginx
systemctl restart nginx

# PostgreSQL
systemctl status postgresql
psql -U dealbaron -d dealbaron_prod

# Sistem
htop                 # CPU/Memory
df -h                # Disk
free -h              # Memory
```

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 1.0
**Platform:** Linux VDS (Ubuntu 22.04)
