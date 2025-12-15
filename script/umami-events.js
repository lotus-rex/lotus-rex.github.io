//umami-events.js

document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk mendapatkan nama game dari URL path
    // Contoh: "/games/snake-clone.html" -> "snake-clone"
    function getGameName() {
        const path = window.location.pathname;
        const match = path.match(/\/games\/(.+?)-clone\.html/i);
        if (match && match[1]) {
            // Ubah menjadi format yang mudah dibaca, misalnya: "snake-clone" -> "Snake Clone"
            const name = match[1].replace(/-/g, ' ');
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        // Jika tidak sesuai pola, gunakan nama default
        return 'Unknown Game'; 
    }

    // Fungsi untuk memanggil event tracking Umami
    function trackUmamiEvent(eventType, eventData) {
        // Pastikan umami.track() ada sebelum memanggilnya
        if (typeof umami !== 'undefined' && typeof umami.track === 'function') {
            umami.track(eventType, eventData);
            console.log(`Umami Tracked: ${eventType} - ${eventData}`);
        } else {
            // console.warn("Umami tracking function (umami.track) not found.");
        }
    }

    const gameName = getGameName();
    
    // --- Logika Event Tracking ---

    // 1. Event 'Game Page Load' (Umami 'View')
    // Ini berfungsi sebagai event 'umami' dasar untuk melihat halaman game
    trackUmamiEvent('Game Page View', { name: gameName });

    // 2. Tambahkan Event Listener ke Tombol 'Mulai' (Start Game Button)
    // Hampir semua game memiliki tombol 'startGameBtn' atau 'restartBtn'
    
    // Tracking saat game dimulai
    const startButton = document.getElementById('startGameBtn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            trackUmamiEvent('Game Started', { game: gameName });
        });
    }

    // Tracking saat game dimainkan lagi (restart)
    const restartButton = document.getElementById('restartBtn');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            trackUmamiEvent('Game Restarted', { game: gameName });
        });
    }
    
    // Catatan: Event 'Game Over' (misalnya, saat saveScore dipanggil) harus
    // ditambahkan secara manual di logika JavaScript spesifik game tersebut
    // agar dapat mengirim data skor.
});