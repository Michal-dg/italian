// js/ui/stats.js
import { state, setStatsChart } from '../state.js';
import { elements } from './domElements.js';
import { openModal } from './modals.js';
import { formatDate } from '../utils.js';

async function renderStatsChart() {
    // NOWA LOGIKA: Czytamy dane bezpośrednio ze stanu aplikacji (który jest zasilany z Supabase)
    const allWords = state.words; 
    
    const learnedByDay = allWords
        .filter(w => w.learned_date) // Używamy 'learned_date' zgodnie ze schematem bazy danych
        .reduce((acc, word) => {
            const day = formatDate(new Date(word.learned_date));
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

    const sortedDays = Object.keys(learnedByDay).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('.');
        const [dayB, monthB, yearB] = b.split('.');
        return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
    });

    if (state.statsChart) {
        state.statsChart.destroy();
    }
    
    const chart = new Chart(elements.statsChartCanvas, {
        type: 'bar',
        data: {
            labels: sortedDays,
            datasets: [{
                label: 'Nauczone słowa',
                data: sortedDays.map(day => learnedByDay[day]),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: { 
                y: { 
                    beginAtZero: true, 
                    ticks: { 
                        stepSize: 1 
                    } 
                } 
            },
            plugins: { 
                legend: { 
                    display: false 
                } 
            }
        }
    });
    setStatsChart(chart);
}


export function initStats() {
    elements.showStatsBtn.addEventListener('click', async () => {
        await renderStatsChart();
        openModal(elements.statsModal);
    });
}