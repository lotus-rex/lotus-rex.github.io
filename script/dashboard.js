// Variabel global untuk menyimpan kurs USD terbaru (untuk kalkulator)
let currentUsdRate = 0;

async function fetchAndRenderExchangeRates() {
    const apiUrl = 'https://api.exchangerate-api.com/v4/latest/IDR';
    const cardContainer = document.getElementById('exchange-rate-cards');
    const dateLabel = document.getElementById('exchange-date-label');
    const presetList = document.getElementById('preset-list');

    if (!cardContainer || !dateLabel) return;

    // Loading State
    dateLabel.innerHTML = `<i data-lucide="refresh-cw" class="w-3 h-3 animate-spin"></i> Syncing...`;
    lucide.createIcons();

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const rates = data.rates;

        // 1. Logika Tanggal
        const updateDate = new Date(data.time_last_updated * 1000);
        dateLabel.textContent = `Updated: ${updateDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

        // 2. Render Kurs Utama (Header)
        currentUsdRate = 1 / rates['USD'];
        const eurRate = 1 / rates['EUR'];
        const gbpRate = 1 / rates['GBP'];

        animateValue('current-rate', currentUsdRate, "Rp ");
        animateValue('eur-rate', eurRate, "Rp ");
        animateValue('gbp-rate', gbpRate, "Rp ");

        // 3. Render Stat Cards (Mata Uang Lain)
        const others = {
            'SGD': { icon: 'landmark', color: 'bg-emerald-500' },
            'AUD': { icon: 'map', color: 'bg-blue-500' },
            'JPY': { icon: 'coins', color: 'bg-rose-500' },
            'MYR': { icon: 'wallet', color: 'bg-amber-500' },
            'CNY': { icon: 'building-bank', color: 'bg-red-500' },
            'KRW': { icon: 'credit-card', color: 'bg-purple-500' },
            'HKD': { icon: 'briefcase', color: 'bg-pink-500' },
            'TWD': { icon: 'shield-check', color: 'bg-cyan-500' }
        };

        cardContainer.innerHTML = Object.entries(others).map(([curr, meta]) => `
            <div class="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all">
                <div class="${meta.color} w-8 h-8 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-${meta.color.split('-')[1]}-100">
                    <i data-lucide="${meta.icon}" class="w-4 h-4"></i>
                </div>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${curr}/IDR</p>
                <h4 class="text-sm font-mono font-bold text-slate-800">Rp ${new Intl.NumberFormat('id-ID').format((1 / rates[curr]).toFixed(0))}</h4>
            </div>
        `).join('');

        // 4. Update Kalkulator Awal
        updateCalculator();

        // 5. Inisialisasi Chart
        renderRateChart(currentUsdRate);

        // 6. Fetch Presets
        if (presetList) fetchAndRenderPresets(presetList);

        lucide.createIcons();

    } catch (error) {
        console.error("Dashboard Sync Error:", error);
        dateLabel.innerHTML = `<span class="text-red-400">Sync Failed</span>`;
    }
}

// Fungsi Efek Animasi Angka
function animateValue(id, value, prefix = "") {
    const obj = document.getElementById(id);
    if (!obj) return;
    const finalValue = Math.floor(value);
    obj.textContent = prefix + new Intl.NumberFormat('id-ID').format(finalValue);
}

// Fungsi Kalkulator Real-time
function updateCalculator() {
    const input = document.getElementById('calc-usd');
    const result = document.getElementById('calc-result');
    if (!input || !result) return;

    input.addEventListener('input', (e) => {
        const val = e.target.value || 0;
        const total = val * currentUsdRate;
        result.textContent = new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            maximumFractionDigits: 0 
        }).format(total);
    });
    
    // Trigger awal
    input.dispatchEvent(new Event('input'));
}

// Render Chart dengan Gradient Modern
function renderRateChart(baseRate) {
    const ctx = document.getElementById('rateChart');
    if (!ctx) return;

    // Bersihkan chart lama jika ada
    const existingChart = Chart.getChart("rateChart");
    if (existingChart) existingChart.destroy();

    const dataPoints = [baseRate - 150, baseRate - 50, baseRate + 100, baseRate - 200, baseRate + 50, baseRate - 20, baseRate];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: dataPoints,
                borderColor: '#4f46e5',
                borderWidth: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4f46e5',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 8,
                tension: 0.4,
                fill: true,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
                    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                    return gradient;
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                y: { grid: { color: '#f8fafc' }, ticks: { font: { family: 'monospace' } } }
            }
        }
    });
}

// Fetch Presets dari /db/res-presets.json
async function fetchAndRenderPresets(container) {
    try {
        const res = await fetch('/db/res-presets.json');
        const data = await res.json();
        const social = data.resolution_presets.social_media;
        
        // Ambil mix dari berbagai platform
        const samples = [
            ...social.youtube.slice(0, 1),
            ...social.tiktok.slice(0, 1),
            ...social.instagram.slice(0, 2)
        ];
        
        container.innerHTML = samples.map(item => `
            <div onclick="copyToClipboard('${item.width}x${item.height}', '${item.name}')" 
                 class="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-pointer">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${item.name}</span>
                    <span class="text-[8px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">${item.ratio}</span>
                </div>
                <div class="flex justify-between items-center text-white font-mono font-bold">
                    <span>${item.width} <span class="text-slate-500">×</span> ${item.height}</span>
                    <i data-lucide="copy" class="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors"></i>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    } catch (e) {
        container.innerHTML = '<p class="text-slate-500 text-xs italic p-4">Presets sedang offline.</p>';
    }
}

// Utility: Copy function
window.copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    // Tambahkan notifikasi toast sederhana jika Anda punya sistemnya
    alert(`Resolusi ${name} (${text}) berhasil disalin!`);
};

// Jalankan saat load
document.addEventListener('DOMContentLoaded', fetchAndRenderExchangeRates);