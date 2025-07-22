// GOGOEAT - 美食地圖應用程式
class GoGoEat {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.markers = [];
        this.infoWindow = null;
        this.currentFilters = {
            budget: null,
            rating: null,
            isOpen: false,
            hasParking: false
        };
        this.restaurants = [
            {
                id: 1,
                name: "阿明牛肉麵",
                lat: 25.0330,
                lng: 121.5654,
                rating: 4.5,
                priceRange: "$150-300",
                category: "台式料理",
                phone: "02-2345-6789",
                address: "台北市大安區忠孝東路四段123號",
                hours: "11:00 - 21:00",
                isOpen: true,
                hasParking: true,
                image: "https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=牛肉麵",
                reviews: 128
            },
            {
                id: 2,
                name: "義式披薩屋",
                lat: 25.0320,
                lng: 121.5644,
                rating: 4.2,
                priceRange: "$200-500",
                category: "義式料理",
                phone: "02-2345-6790",
                address: "台北市大安區忠孝東路四段456號",
                hours: "12:00 - 22:00",
                isOpen: true,
                hasParking: false,
                image: "https://via.placeholder.com/400x200/4ECDC4/FFFFFF?text=披薩",
                reviews: 89
            },
            {
                id: 3,
                name: "日式拉麵店",
                lat: 25.0340,
                lng: 121.5664,
                rating: 4.7,
                priceRange: "$180-350",
                category: "日式料理",
                phone: "02-2345-6791",
                address: "台北市大安區忠孝東路四段789號",
                hours: "11:30 - 21:30",
                isOpen: true,
                hasParking: true,
                image: "https://via.placeholder.com/400x200/45B7D1/FFFFFF?text=拉麵",
                reviews: 156
            }
        ];
        
        this.init();
    }

    // 初始化應用程式
    init() {
        this.setupEventListeners();
        this.getCurrentLocation();
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 篩選按鈕
        document.getElementById('budgetBtn').addEventListener('click', () => this.showBudgetModal());
        document.getElementById('ratingBtn').addEventListener('click', () => this.showRatingModal());
        document.getElementById('randomBtn').addEventListener('click', () => this.showRandomRestaurant());

        // 搜尋功能
        const searchInput = document.querySelector('input[placeholder="搜尋餐廳、美食..."]');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // 篩選選項
        this.setupFilterListeners();

        // 模態框背景點擊關閉
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });

        // 定位按鈕
        document.querySelector('.location-btn').addEventListener('click', () => this.getCurrentLocation());
    }

    // 設定篩選器監聽器
    setupFilterListeners() {
        // 預算篩選
        document.querySelectorAll('#budgetModal .filter-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const budget = e.currentTarget.dataset.budget;
                this.currentFilters.budget = budget;
                this.applyFilters();
                this.closeBudgetModal();
            });
        });

        // 評分篩選
        document.querySelectorAll('#ratingModal .filter-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const rating = parseFloat(e.currentTarget.dataset.rating);
                this.currentFilters.rating = rating;
                this.applyFilters();
                this.closeRatingModal();
            });
        });

        // 其他篩選器
        document.querySelector('.filter-open').addEventListener('click', () => {
            this.currentFilters.isOpen = !this.currentFilters.isOpen;
            this.toggleFilterButton(document.querySelector('.filter-open'));
            this.applyFilters();
        });

        document.querySelector('.filter-parking').addEventListener('click', () => {
            this.currentFilters.hasParking = !this.currentFilters.hasParking;
            this.toggleFilterButton(document.querySelector('.filter-parking'));
            this.applyFilters();
        });
    }

    // 切換篩選按鈕狀態
    toggleFilterButton(button) {
        button.classList.toggle('bg-primary');
        button.classList.toggle('text-white');
        button.classList.toggle('bg-gray-100');
    }

    // 獲取用戶位置
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.initMap();
                },
                (error) => {
                    console.error('定位失敗:', error);
                    // 使用台北市中心作為預設位置
                    this.userLocation = { lat: 25.0330, lng: 121.5654 };
                    this.initMap();
                }
            );
        } else {
            console.error('瀏覽器不支援定位功能');
            this.userLocation = { lat: 25.0330, lng: 121.5654 };
            this.initMap();
        }
    }

    // 初始化Google地圖
    initMap() {
        const mapOptions = {
            zoom: 15,
            center: this.userLocation,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        };

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.infoWindow = new google.maps.InfoWindow();

        // 添加用戶位置標記
        new google.maps.Marker({
            position: this.userLocation,
            map: this.map,
            title: '您的位置',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#45B7D1" stroke="white" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(24, 24)
            }
        });

        // 添加餐廳標記
        this.addRestaurantMarkers();

        // 地圖點擊事件
        this.map.addListener('click', () => {
            this.infoWindow.close();
        });
    }

    // 添加餐廳標記
    addRestaurantMarkers() {
        this.clearMarkers();

        this.restaurants.forEach(restaurant => {
            if (this.shouldShowRestaurant(restaurant)) {
                const marker = new google.maps.Marker({
                    position: { lat: restaurant.lat, lng: restaurant.lng },
                    map: this.map,
                    title: restaurant.name,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="white" stroke-width="2"/>
                                <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32)
                    }
                });

                marker.addListener('click', () => {
                    this.showRestaurantInfo(restaurant);
                });

                this.markers.push(marker);
            }
        });
    }

    // 清除所有標記
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    // 檢查是否應該顯示餐廳
    shouldShowRestaurant(restaurant) {
        // 預算篩選
        if (this.currentFilters.budget) {
            const budgetRanges = {
                'under100': [0, 100],
                '100-300': [100, 300],
                '300-500': [300, 500],
                'over500': [500, 9999]
            };
            
            const range = budgetRanges[this.currentFilters.budget];
            const restaurantPrice = parseInt(restaurant.priceRange.split('-')[1].replace('$', ''));
            
            if (restaurantPrice < range[0] || restaurantPrice > range[1]) {
                return false;
            }
        }

        // 評分篩選
        if (this.currentFilters.rating && restaurant.rating < this.currentFilters.rating) {
            return false;
        }

        // 營業狀態篩選
        if (this.currentFilters.isOpen && !restaurant.isOpen) {
            return false;
        }

        // 停車場篩選
        if (this.currentFilters.hasParking && !restaurant.hasParking) {
            return false;
        }

        return true;
    }

    // 顯示餐廳資訊
    showRestaurantInfo(restaurant) {
        const distance = this.calculateDistance(this.userLocation, { lat: restaurant.lat, lng: restaurant.lng });
        
        document.getElementById('restaurantImage').src = restaurant.image;
        document.getElementById('restaurantName').textContent = restaurant.name;
        document.getElementById('restaurantRating').textContent = restaurant.rating;
        document.getElementById('restaurantPrice').textContent = restaurant.priceRange;
        document.getElementById('restaurantDistance').textContent = `${distance.toFixed(1)}km`;
        
        // 更新餐廳詳細資訊
        document.querySelector('#restaurantCard .restaurant-address').textContent = restaurant.address;
        document.querySelector('#restaurantCard .restaurant-phone').textContent = restaurant.phone;
        document.querySelector('#restaurantCard .restaurant-hours').textContent = restaurant.hours;
        document.querySelector('#restaurantCard .restaurant-reviews').textContent = `(${restaurant.reviews} 評論)`;

        this.showRestaurantCard();
    }

    // 計算距離
    calculateDistance(pos1, pos2) {
        const R = 6371; // 地球半徑（公里）
        const dLat = this.deg2rad(pos2.lat - pos1.lat);
        const dLng = this.deg2rad(pos2.lng - pos1.lng);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(pos1.lat)) * Math.cos(this.deg2rad(pos2.lat)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // 搜尋功能
    handleSearch(query) {
        if (query.length < 2) {
            this.addRestaurantMarkers();
            return;
        }

        const filteredRestaurants = this.restaurants.filter(restaurant => 
            restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.category.toLowerCase().includes(query.toLowerCase())
        );

        this.clearMarkers();
        filteredRestaurants.forEach(restaurant => {
            if (this.shouldShowRestaurant(restaurant)) {
                const marker = new google.maps.Marker({
                    position: { lat: restaurant.lat, lng: restaurant.lng },
                    map: this.map,
                    title: restaurant.name,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="white" stroke-width="2"/>
                                <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32)
                    }
                });

                marker.addListener('click', () => {
                    this.showRestaurantInfo(restaurant);
                });

                this.markers.push(marker);
            }
        });
    }

    // 應用篩選器
    applyFilters() {
        this.addRestaurantMarkers();
    }

    // 隨機推薦餐廳
    showRandomRestaurant() {
        const availableRestaurants = this.restaurants.filter(restaurant => 
            this.shouldShowRestaurant(restaurant)
        );

        if (availableRestaurants.length === 0) {
            alert('沒有符合條件的餐廳');
            return;
        }

        const randomRestaurant = availableRestaurants[Math.floor(Math.random() * availableRestaurants.length)];
        
        // 更新隨機推薦模態框內容
        document.querySelector('#randomModal .random-restaurant-image').src = randomRestaurant.image;
        document.querySelector('#randomModal .random-restaurant-name').textContent = randomRestaurant.name;
        document.querySelector('#randomModal .random-restaurant-rating').textContent = randomRestaurant.rating;
        document.querySelector('#randomModal .random-restaurant-price').textContent = randomRestaurant.priceRange;
        
        const distance = this.calculateDistance(this.userLocation, { lat: randomRestaurant.lat, lng: randomRestaurant.lng });
        document.querySelector('#randomModal .random-restaurant-distance').textContent = `${distance.toFixed(1)}km`;

        this.showRandomModal();

        // 在地圖上高亮顯示推薦餐廳
        this.map.setCenter({ lat: randomRestaurant.lat, lng: randomRestaurant.lng });
        this.map.setZoom(17);
    }

    // 模態框控制方法
    showBudgetModal() {
        document.getElementById('budgetModal').classList.remove('hidden');
    }

    closeBudgetModal() {
        document.getElementById('budgetModal').classList.add('hidden');
    }

    showRatingModal() {
        document.getElementById('ratingModal').classList.remove('hidden');
    }

    closeRatingModal() {
        document.getElementById('ratingModal').classList.add('hidden');
    }

    showRestaurantCard() {
        document.getElementById('restaurantCard').classList.remove('hidden');
    }

    closeRestaurantCard() {
        document.getElementById('restaurantCard').classList.add('hidden');
    }

    showRandomModal() {
        document.getElementById('randomModal').classList.remove('hidden');
    }

    closeRandomModal() {
        document.getElementById('randomModal').classList.add('hidden');
    }

    closeAllModals() {
        this.closeBudgetModal();
        this.closeRatingModal();
        this.closeRestaurantCard();
        this.closeRandomModal();
    }
}

// 初始化應用程式
let app;

function initApp() {
    app = new GoGoEat();
}

// Google Maps API 載入完成後的回調函數
window.initMap = initApp;