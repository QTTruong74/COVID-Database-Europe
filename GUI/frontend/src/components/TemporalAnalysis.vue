<template>
  <div class="temporal-analysis">
    <h1>Temporal Analysis</h1>
    <p class="description">Track pandemic progression over different phases and identify periods with strong growth or decline in case numbers</p>

    <!-- Country Selection -->
    <div class="controls">
      <div class="control-group">
        <label>Select Countries:</label>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" @click="selectAllCountries">Select All</button>
            <button type="button" @click="clearSelection">Clear</button>
            <small style="color:#7f8c8d;margin-left:8px;">(Hold Ctrl/Cmd to multi-select)</small>
          </div>
          <select v-model="selectedCountries" multiple size="6" style="min-width:220px;" @change="analyzeData">
            <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
          </select>
        </div>
      </div>

      <div class="control-group">
        <label>Metric:</label>
        <select v-model="selectedMetric" @change="updateChart">
          <option value="Avg_Cases_per_Million">Avg Cases per Million</option>
          <option value="Avg_Deaths_per_Million">Avg Deaths per Million</option>
          <option value="Total_Cases_per_Million">Total Cases per Million</option>
          <option value="Total_Deaths_per_Million">Total Deaths per Million</option>
        </select>
      </div>
    </div>

    <!-- Time Series Chart -->
    <div class="chart-container" v-if="chartData">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Phase Analysis -->
    <div class="phase-analysis" v-if="phases.length > 0">
      <h2>Identified Phases</h2>
      <div class="phases-grid">
        <div v-for="(phase, index) in phases" :key="index" class="phase-card" :class="phase.type">
          <h3>{{ phase.type === 'growth' ? '📈 Growth Phase' : '📉 Decline Phase' }}</h3>
          <div class="phase-info">
            <p><strong>Period:</strong> {{ phase.startYear }} - {{ phase.endYear }}</p>
            <p><strong>Change Rate:</strong> {{ phase.changeRate }}%</p>
            <p><strong>Description:</strong> {{ phase.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Growth/Decline Table -->
    <div class="table-container">
      <h2>Year-over-Year Changes</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Year</th>
            <th>{{ selectedMetric.replace(/_/g, ' ') }}</th>
            <th>Change from Previous Year</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in analysisData" :key="`${item.Country}-${item.Year}`">
            <td class="country-name">{{ item.Country }}</td>
            <td>{{ item.Year }}</td>
            <td>{{ formatNumber(item.value) }}</td>
            <td :class="getChangeClass(item.change)">
              {{ item.change !== null ? formatChange(item.change) : 'N/A' }}
            </td>
            <td>
              <span class="trend-badge" :class="getTrendClass(item.change)">
                {{ getTrendLabel(item.change) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import CovidCasesDataService from '../services/CovidCasesDataService';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  name: 'TemporalAnalysis',
  components: {
    Line
  },
  data() {
    return {
      data: [],
      countries: [],
      selectedCountries: [],
      selectedMetric: 'Avg_Cases_per_Million',
      analysisData: [],
      phases: []
    };
  },
  computed: {
    chartData() {
      if (!this.analysisData.length) return null;

      const groupedData = {};
      this.analysisData.forEach(item => {
        if (!groupedData[item.Country]) {
          groupedData[item.Country] = [];
        }
        groupedData[item.Country].push(item);
      });

      const colors = [
        'rgb(52, 152, 219)',
        'rgb(231, 76, 60)',
        'rgb(46, 204, 113)',
        'rgb(155, 89, 182)',
        'rgb(241, 196, 15)',
        'rgb(230, 126, 34)'
      ];

      // determine which countries to display: if user selected any, use them; otherwise show top 3
      const availableCountries = Object.keys(groupedData);
      let countriesToShow = [];
      if (this.selectedCountries && this.selectedCountries.length) {
        countriesToShow = this.selectedCountries.filter(c => availableCountries.includes(c));
      } else {
        // pick top 3 by average value to avoid visual clutter
        const averages = availableCountries.map(c => ({
          country: c,
          avg: groupedData[c].reduce((s, v) => s + v.value, 0) / groupedData[c].length
        }));
        countriesToShow = averages.sort((a, b) => b.avg - a.avg).slice(0, 3).map(a => a.country);
      }

      const datasets = countriesToShow.map((country, index) => {
        const countryData = groupedData[country].sort((a, b) => a.Year - b.Year);
        return {
          label: country,
          data: countryData.map(d => d.value),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.08)'),
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 1,
          spanGaps: true
        };
      });

      const years = [...new Set(this.analysisData.map(d => d.Year))].sort();

      return {
        labels: years,
        datasets: datasets
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 12
            }
          },
          title: {
            display: true,
            text: `${this.selectedMetric.replace(/_/g, ' ')} Over Time`
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return Number(value).toLocaleString(); }
            }
          }
        }
      };
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const response = await CovidCasesDataService.getAll();
        this.data = response.data;
        
        // Extract unique countries
        this.countries = [...new Set(this.data.map(d => d.Country))].sort();
        // by default keep selection empty so top 3 are shown
        this.selectedCountries = [];
        
        this.analyzeData();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    analyzeData() {
      let filteredData = this.data;
      if (this.selectedCountries && this.selectedCountries.length) {
        filteredData = filteredData.filter(d => this.selectedCountries.includes(d.Country));
      }

      // Group by country and year
      const grouped = {};
      filteredData.forEach(item => {
        const key = `${item.Country}-${item.Year}`;
        if (!grouped[key]) {
          grouped[key] = {
            Country: item.Country,
            Year: item.Year,
            value: parseFloat(item[this.selectedMetric]) || 0
          };
        }
      });

      // Convert to array and sort
      const dataArray = Object.values(grouped).sort((a, b) => {
        if (a.Country !== b.Country) return a.Country.localeCompare(b.Country);
        return a.Year - b.Year;
      });

      // Calculate year-over-year changes
      this.analysisData = dataArray.map((item, index) => {
        if (index === 0) {
          return { ...item, change: null };
        }
        
        const prevItem = dataArray[index - 1];
        if (prevItem.Country === item.Country && prevItem.Year === item.Year - 1) {
          const change = prevItem.value !== 0 
            ? ((item.value - prevItem.value) / prevItem.value) * 100 
            : 0;
          return { ...item, change };
        }
        
        return { ...item, change: null };
      });

      this.identifyPhases();
    },
    identifyPhases() {
      // only compute phases when exactly one country is selected
      const targetCountry = (this.selectedCountries && this.selectedCountries.length === 1)
        ? this.selectedCountries[0]
        : null;

      if (!targetCountry) {
        this.phases = [];
        return;
      }

      const countryData = this.analysisData
        .filter(d => d.Country === targetCountry && d.change !== null)
        .sort((a, b) => a.Year - b.Year);

      const phases = [];
      let currentPhase = null;

      countryData.forEach((item, index) => {
        const isGrowth = item.change > 10;
        const isDecline = item.change < -10;

        if (isGrowth || isDecline) {
          const phaseType = isGrowth ? 'growth' : 'decline';
          
          if (!currentPhase || currentPhase.type !== phaseType) {
            if (currentPhase) {
              phases.push(currentPhase);
            }
            currentPhase = {
              type: phaseType,
              startYear: item.Year,
              endYear: item.Year,
              changeRate: item.change,
              description: ''
            };
          } else {
            currentPhase.endYear = item.Year;
            currentPhase.changeRate = (currentPhase.changeRate + item.change) / 2;
          }
        } else {
          if (currentPhase) {
            phases.push(currentPhase);
            currentPhase = null;
          }
        }
      });

      if (currentPhase) {
        phases.push(currentPhase);
      }

      // Add descriptions
      this.phases = phases.map(phase => ({
        ...phase,
        changeRate: phase.changeRate.toFixed(1),
        description: phase.type === 'growth' 
          ? `Significant increase in ${this.selectedMetric.replace(/_/g, ' ').toLowerCase()}`
          : `Significant decrease in ${this.selectedMetric.replace(/_/g, ' ').toLowerCase()}`
      }));
    },
    selectAllCountries() {
      this.selectedCountries = [...this.countries];
      this.analyzeData();
    },
    clearSelection() {
      this.selectedCountries = [];
      this.analyzeData();
    },
    updateChart() {
      this.analyzeData();
    },
    formatNumber(num) {
      if (!num) return '0';
      return parseFloat(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
    },
    formatChange(change) {
      const sign = change > 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
    },
    getChangeClass(change) {
      if (change === null) return '';
      return change > 0 ? 'change-positive' : 'change-negative';
    },
    getTrendClass(change) {
      if (change === null) return 'trend-stable';
      if (change > 10) return 'trend-growth';
      if (change < -10) return 'trend-decline';
      return 'trend-stable';
    },
    getTrendLabel(change) {
      if (change === null) return 'N/A';
      if (change > 10) return 'Strong Growth';
      if (change < -10) return 'Strong Decline';
      if (change > 0) return 'Moderate Growth';
      if (change < 0) return 'Moderate Decline';
      return 'Stable';
    }
  }
};
</script>

<style scoped>
.temporal-analysis {
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

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  height: 400px;
}

.phase-analysis {
  margin-bottom: 30px;
}

.phase-analysis h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.phases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.phase-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.phase-card.growth {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left: 4px solid #28a745;
}

.phase-card.decline {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-left: 4px solid #dc3545;
}

.phase-card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.phase-info p {
  margin: 8px 0;
  color: #495057;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-x: auto;
}

.table-container h2 {
  color: #2c3e50;
  margin-bottom: 20px;
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

.country-name {
  font-weight: 600;
  color: #2c3e50;
}

.change-positive {
  color: #e74c3c;
  font-weight: 600;
}

.change-negative {
  color: #27ae60;
  font-weight: 600;
}

.trend-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.trend-growth {
  background: #f8d7da;
  color: #721c24;
}

.trend-decline {
  background: #d4edda;
  color: #155724;
}

.trend-stable {
  background: #d1ecf1;
  color: #0c5460;
}
</style>
