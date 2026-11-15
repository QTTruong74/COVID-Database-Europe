<template>
  <div class="spread-metrics">
    <h1>Spread Metrics Analysis</h1>
    <p class="description">Analyze growth rate, doubling time, and reproduction number to understand spread velocity</p>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Select Country:</label>
        <select v-model="selectedCountry" @change="calculateMetrics">
          <option value="">-- Select Country --</option>
          <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>Time Period:</label>
        <select v-model="timePeriod" @change="calculateMetrics">
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div v-if="metrics" class="metrics-grid">
      <div class="metric-card growth-rate">
        <div class="metric-icon">📈</div>
        <h3>Growth Rate</h3>
        <div class="metric-value">{{ metrics.growthRate }}%</div>
        <div class="metric-description">Average daily change in cases</div>
        <div class="metric-status" :class="getGrowthStatusClass(metrics.growthRate)">
          {{ getGrowthStatus(metrics.growthRate) }}
        </div>
      </div>

      <div class="metric-card doubling-time">
        <div class="metric-icon">⏱️</div>
        <h3>Doubling Time</h3>
        <div class="metric-value">{{ metrics.doublingTime }}</div>
        <div class="metric-description">Days for cases to double</div>
        <div class="metric-status" :class="getDoublingStatusClass(metrics.doublingTimeDays)">
          {{ getDoublingStatus(metrics.doublingTimeDays) }}
        </div>
      </div>

      <div class="metric-card reproduction">
        <div class="metric-icon">🔄</div>
        <h3>Reproduction Number (R)</h3>
        <div class="metric-value">{{ metrics.reproductionNumber }}</div>
        <div class="metric-description">Average infections per case</div>
        <div class="metric-status" :class="getReproductionStatusClass(metrics.reproductionNumber)">
          {{ getReproductionStatus(metrics.reproductionNumber) }}
        </div>
      </div>

      <div class="metric-card infection-rate">
        <div class="metric-icon">🦠</div>
        <h3>Infection Rate</h3>
        <div class="metric-value">{{ metrics.infectionRate }}</div>
        <div class="metric-description">New cases per million per day</div>
        <div class="metric-status" :class="getInfectionStatusClass(metrics.infectionRate)">
          {{ getInfectionStatus(metrics.infectionRate) }}
        </div>
      </div>
    </div>

    <!-- Time Series Chart -->
    <div v-if="chartData" class="chart-section">
      <h2>Spread Velocity Over Time</h2>
      <div class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Detailed Analysis Table -->
    <div v-if="detailedData.length > 0" class="table-section">
      <h2>Detailed Metrics by Year</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Avg Cases/Million</th>
            <th>Growth Rate (%)</th>
            <th>Doubling Time</th>
            <th>Est. R-Number</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in detailedData" :key="item.year">
            <td class="year-cell">{{ item.year }}</td>
            <td>{{ formatNumber(item.newCases) }}</td>
            <td :class="getGrowthClass(item.growthRate)">
              {{ formatGrowth(item.growthRate) }}
            </td>
            <td>{{ item.doublingTime }}</td>
            <td :class="getRClass(item.rNumber)">
              {{ item.rNumber }}
            </td>
            <td>
              <span class="trend-indicator" :class="getTrendClass(item.growthRate)">
                {{ getTrendIndicator(item.growthRate) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Interpretation Guide -->
    <div class="interpretation-guide">
      <h2>Understanding the Metrics</h2>
      <div class="guide-grid">
        <div class="guide-card">
          <h3>📈 Growth Rate</h3>
          <ul>
            <li><strong>&gt; 10%:</strong> Rapid exponential growth</li>
            <li><strong>5-10%:</strong> Significant growth</li>
            <li><strong>0-5%:</strong> Moderate growth</li>
            <li><strong>&lt; 0%:</strong> Decline</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>⏱️ Doubling Time</h3>
          <ul>
            <li><strong>&lt; 7 days:</strong> Very fast spread</li>
            <li><strong>7-14 days:</strong> Fast spread</li>
            <li><strong>14-30 days:</strong> Moderate spread</li>
            <li><strong>&gt; 30 days:</strong> Slow spread</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🔄 R-Number</h3>
          <ul>
            <li><strong>R &gt; 1:</strong> Epidemic growing</li>
            <li><strong>R = 1:</strong> Stable transmission</li>
            <li><strong>R &lt; 1:</strong> Epidemic declining</li>
            <li><strong>Target:</strong> Keep R below 1</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🦠 Infection Rate</h3>
          <ul>
            <li><strong>&gt; 500:</strong> Critical level</li>
            <li><strong>250-500:</strong> High transmission</li>
            <li><strong>100-250:</strong> Moderate transmission</li>
            <li><strong>&lt; 100:</strong> Low transmission</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!selectedCountry" class="no-data">
      <p>Please select a country to view spread metrics</p>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import CovidCasesDataService from '../services/CovidCasesDataService';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  name: 'SpreadMetrics',
  components: {
    Line
  },
  data() {
    return {
      countries: [],
      selectedCountry: '',
      timePeriod: '14',
      data: [],
      metrics: null,
      detailedData: []
    };
  },
  computed: {
    chartData() {
      if (!this.detailedData.length) return null;

      return {
        labels: this.detailedData.map(d => d.year),
        datasets: [
          {
            label: 'Growth Rate (%)',
            data: this.detailedData.map(d => d.growthRate),
            borderColor: 'rgb(52, 152, 219)',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            yAxisID: 'y',
            tension: 0.4
          },
          {
            label: 'R-Number',
            data: this.detailedData.map(d => parseFloat(d.rNumber)),
            borderColor: 'rgb(231, 76, 60)',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Spread Metrics - ${this.selectedCountry}`
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Growth Rate (%)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'R-Number'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        }
      };
    }
  },
  async mounted() {
    await this.loadCountries();
  },
  methods: {
    async loadCountries() {
      try {
        const response = await CovidCasesDataService.getAll();
        const uniqueCountries = [...new Set(response.data.map(d => d.Country))];
        this.countries = uniqueCountries.sort();
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    },
    async calculateMetrics() {
      if (!this.selectedCountry) return;

      try {
        const response = await CovidCasesDataService.getAll();
        const countryData = response.data
          .filter(d => d.Country === this.selectedCountry)
          .sort((a, b) => a.Year - b.Year);

        this.data = countryData;
        
        // Calculate current metrics (most recent year)
        const latestYear = countryData[countryData.length - 1];
        const previousYear = countryData[countryData.length - 2];

        if (latestYear && previousYear) {
          const newCasesLatest = parseFloat(latestYear.Avg_Cases_per_Million) || 0;
          const newCasesPrevious = parseFloat(previousYear.Avg_Cases_per_Million) || 0;

          // Growth rate
          const growthRate = newCasesPrevious !== 0 
            ? ((newCasesLatest - newCasesPrevious) / newCasesPrevious) * 100 
            : 0;

          // Doubling time (in days, approximated per year)
          let doublingTimeDays = 0;
          let doublingTimeText = 'N/A';
          if (growthRate > 0) {
            doublingTimeDays = Math.round((Math.log(2) / Math.log(1 + growthRate / 100)) * 365);
            doublingTimeText = doublingTimeDays > 365 ? '>365 days' : `${doublingTimeDays} days`;
          } else {
            doublingTimeText = 'Declining';
          }

          // Reproduction number (R) - simplified calculation
          // R ≈ 1 + (growth_rate / 100) * generation_time
          // Assuming generation time of 5 days
          const rNumber = Math.max(0, 1 + (growthRate / 100) * 0.05).toFixed(2);

          // Infection rate
          const infectionRate = (newCasesLatest / 365).toFixed(1);

          this.metrics = {
            growthRate: growthRate.toFixed(1),
            doublingTime: doublingTimeText,
            doublingTimeDays,
            reproductionNumber: rNumber,
            infectionRate
          };
        }

        // Calculate detailed metrics for each year
        this.detailedData = countryData.map((item, index) => {
          if (index === 0) {
            return {
              year: item.Year,
              newCases: parseFloat(item.Avg_Cases_per_Million) || 0,
              growthRate: 0,
              doublingTime: 'N/A',
              rNumber: '1.00'
            };
          }

          const prevItem = countryData[index - 1];
          const newCases = parseFloat(item.Avg_Cases_per_Million) || 0;
          const prevCases = parseFloat(prevItem.Avg_Cases_per_Million) || 0;

          const growth = prevCases !== 0 ? ((newCases - prevCases) / prevCases) * 100 : 0;
          
          let doublingTime = 'Declining';
          if (growth > 0) {
            const days = Math.round((Math.log(2) / Math.log(1 + growth / 100)) * 365);
            doublingTime = days > 365 ? '>365 days' : `${days} days`;
          }

          const r = Math.max(0, 1 + (growth / 100) * 0.05).toFixed(2);

          return {
            year: item.Year,
            newCases,
            growthRate: growth,
            doublingTime,
            rNumber: r
          };
        });

      } catch (error) {
        console.error('Error calculating metrics:', error);
      }
    },
    formatNumber(num) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    },
    formatGrowth(rate) {
      const sign = rate > 0 ? '+' : '';
      return `${sign}${rate.toFixed(1)}%`;
    },
    getGrowthStatusClass(rate) {
      const r = parseFloat(rate);
      if (r > 10) return 'status-critical';
      if (r > 5) return 'status-high';
      if (r > 0) return 'status-moderate';
      return 'status-good';
    },
    getGrowthStatus(rate) {
      const r = parseFloat(rate);
      if (r > 10) return 'Rapid Growth';
      if (r > 5) return 'Significant Growth';
      if (r > 0) return 'Moderate Growth';
      return 'Declining';
    },
    getDoublingStatusClass(days) {
      if (days === 0) return 'status-good';
      if (days < 7) return 'status-critical';
      if (days < 14) return 'status-high';
      if (days < 30) return 'status-moderate';
      return 'status-good';
    },
    getDoublingStatus(days) {
      if (days === 0) return 'Cases Declining';
      if (days < 7) return 'Very Fast Spread';
      if (days < 14) return 'Fast Spread';
      if (days < 30) return 'Moderate Spread';
      return 'Slow Spread';
    },
    getReproductionStatusClass(r) {
      const val = parseFloat(r);
      if (val > 1.5) return 'status-critical';
      if (val > 1.0) return 'status-high';
      if (val > 0.8) return 'status-moderate';
      return 'status-good';
    },
    getReproductionStatus(r) {
      const val = parseFloat(r);
      if (val > 1.5) return 'Rapid Growth';
      if (val > 1.0) return 'Growing';
      if (val > 0.8) return 'Near Stable';
      return 'Declining';
    },
    getInfectionStatusClass(rate) {
      const r = parseFloat(rate);
      if (r > 500) return 'status-critical';
      if (r > 250) return 'status-high';
      if (r > 100) return 'status-moderate';
      return 'status-good';
    },
    getInfectionStatus(rate) {
      const r = parseFloat(rate);
      if (r > 500) return 'Critical Level';
      if (r > 250) return 'High Transmission';
      if (r > 100) return 'Moderate Transmission';
      return 'Low Transmission';
    },
    getGrowthClass(rate) {
      if (rate > 10) return 'growth-critical';
      if (rate > 0) return 'growth-positive';
      return 'growth-negative';
    },
    getRClass(r) {
      const val = parseFloat(r);
      if (val > 1.0) return 'r-high';
      return 'r-low';
    },
    getTrendClass(rate) {
      if (rate > 5) return 'trend-up-fast';
      if (rate > 0) return 'trend-up';
      return 'trend-down';
    },
    getTrendIndicator(rate) {
      if (rate > 5) return '⬆⬆ Rapid';
      if (rate > 0) return '⬆ Growing';
      return '⬇ Declining';
    }
  }
};
</script>

<style scoped>
.spread-metrics {
  padding: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: 600;
  color: #2c3e50;
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
}

.metric-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.metric-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.metric-value {
  font-size: 3em;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 10px;
}

.metric-description {
  color: #7f8c8d;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.metric-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9em;
  display: inline-block;
}

.status-good {
  background: #d4edda;
  color: #155724;
}

.status-moderate {
  background: #fff3cd;
  color: #856404;
}

.status-high {
  background: #f8d7da;
  color: #721c24;
}

.status-critical {
  background: #dc3545;
  color: white;
}

.chart-section, .table-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #3498db;
  color: white;
  padding: 12px;
  text-align: left;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ecf0f1;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.year-cell {
  font-weight: 600;
  color: #2c3e50;
}

.growth-critical {
  color: #dc3545;
  font-weight: 600;
}

.growth-positive {
  color: #f39c12;
  font-weight: 600;
}

.growth-negative {
  color: #27ae60;
  font-weight: 600;
}

.r-high {
  color: #e74c3c;
  font-weight: 600;
}

.r-low {
  color: #27ae60;
  font-weight: 600;
}

.trend-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
}

.trend-up-fast {
  background: #f8d7da;
  color: #721c24;
}

.trend-up {
  background: #fff3cd;
  color: #856404;
}

.trend-down {
  background: #d4edda;
  color: #155724;
}

.interpretation-guide {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.guide-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.guide-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.guide-card ul {
  list-style: none;
  padding: 0;
}

.guide-card li {
  padding: 8px 0;
  color: #495057;
  font-size: 0.95em;
}

.no-data {
  background: #f8f9fa;
  padding: 60px;
  text-align: center;
  border-radius: 8px;
  color: #7f8c8d;
  font-size: 1.2em;
}
</style>
