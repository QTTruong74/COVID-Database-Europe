<template>
  <div class="regional-analysis">
    <h1>Regional Analysis</h1>
    <p class="description">Analyze how strongly individual countries were affected by the pandemic based on new infections, deaths, and vaccination rates</p>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Select Year:</label>
        <select v-model="selectedYear" @change="loadData">
          <option value="all">All Years</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>Sort By:</label>
        <select v-model="sortMetric" @change="sortData">
          <option value="Total_Cases_per_Million">Total Cases</option>
          <option value="Total_Deaths_per_Million">Total Deaths</option>
          <option value="Avg_Cases_per_Million">Avg Cases</option>
          <option value="Avg_Deaths_per_Million">Avg Deaths</option>
        </select>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showChart" />
          Show Chart
        </label>
      </div>
    </div>

    <!-- Chart View -->
    <div v-if="showChart && chartData" class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <!-- Table View -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortBy('Country')">Country</th>
            <th @click="sortBy('Year')">Year</th>
            <th @click="sortBy('Total_Cases_per_Million')">Total Cases/Million</th>
            <th @click="sortBy('Total_Deaths_per_Million')">Total Deaths/Million</th>
            <th @click="sortBy('Avg_Cases_per_Million')">Avg Cases/Million</th>
            <th @click="sortBy('Avg_Deaths_per_Million')">Avg Deaths/Million</th>
            <th>Mortality Rate</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedData" :key="`${item.Country}-${item.Year}`" :class="getSeverityClass(item)">
            <td class="country-name">{{ item.Country }}</td>
            <td>{{ item.Year }}</td>
            <td>{{ formatNumber(item.Total_Cases_per_Million) }}</td>
            <td>{{ formatNumber(item.Total_Deaths_per_Million) }}</td>
            <td>{{ formatNumber(item.Avg_Cases_per_Million) }}</td>
            <td>{{ formatNumber(item.Avg_Deaths_per_Million) }}</td>
            <td>{{ calculateMortalityRate(item) }}%</td>
            <td>
              <span class="severity-badge" :class="getSeverityClass(item)">
                {{ getSeverityLevel(item) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Statistics -->
    <div class="summary-stats">
      <h2>Summary Statistics</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Most Affected Country (Cases)</div>
          <div class="stat-value">{{ mostAffectedByCases }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Most Affected Country (Deaths)</div>
          <div class="stat-value">{{ mostAffectedByDeaths }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Average Cases/Million</div>
          <div class="stat-value">{{ formatNumber(avgCases) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Average Deaths/Million</div>
          <div class="stat-value">{{ formatNumber(avgDeaths) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import CovidCasesDataService from '../services/CovidCasesDataService';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'RegionalAnalysis',
  components: {
    Bar
  },
  data() {
    return {
      data: [],
      sortedData: [],
      years: [],
      selectedYear: 'all',
      sortMetric: 'Total_Cases_per_Million',
      sortDirection: 1,
      showChart: true
    };
  },
  computed: {
    chartData() {
      if (!this.sortedData.length) return null;

      // Take top 15 countries for chart
      const topCountries = this.sortedData.slice(0, 15);
      
      return {
        labels: topCountries.map(d => d.Country),
        datasets: [
          {
            label: 'Total Cases per Million',
              data: topCountries.map(d => d.Total_Cases_per_Million),
              yAxisID: 'y',
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          },
          {
            label: 'Total Deaths per Million',
              data: topCountries.map(d => d.Total_Deaths_per_Million),
              yAxisID: 'yDeaths',
            backgroundColor: 'rgba(231, 76, 60, 0.6)',
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 1
          }
        ]
      };
    },
    chartOptions() {
      // compute a suggested max for the deaths axis so it displays appropriately
      const deathsData = (this.chartData && this.chartData.datasets && this.chartData.datasets[1])
        ? this.chartData.datasets[1].data.map(v => Number(v) || 0)
        : [];
      const deathsMax = deathsData.length ? Math.max(...deathsData) : 10;

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Top 15 Countries - ${this.selectedYear === 'all' ? 'All Years' : this.selectedYear}`
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cases per Million'
            },
            ticks: {
              callback: function(value) { return Number(value).toLocaleString(); }
            }
          },
          yDeaths: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Deaths per Million'
            },
            grid: {
              drawOnChartArea: false
            },
            suggestedMax: deathsMax * 1.2,
            ticks: {
              callback: function(value) { return Number(value).toLocaleString(); }
            }
          }
        }
      };
    },
    mostAffectedByCases() {
      if (!this.sortedData.length) return 'N/A';
      const max = this.sortedData.reduce((prev, curr) => 
        curr.Total_Cases_per_Million > prev.Total_Cases_per_Million ? curr : prev
      );
      return `${max.Country} (${this.formatNumber(max.Total_Cases_per_Million)})`;
    },
    mostAffectedByDeaths() {
      if (!this.sortedData.length) return 'N/A';
      const max = this.sortedData.reduce((prev, curr) => 
        curr.Total_Deaths_per_Million > prev.Total_Deaths_per_Million ? curr : prev
      );
      return `${max.Country} (${this.formatNumber(max.Total_Deaths_per_Million)})`;
    },
    avgCases() {
      if (!this.sortedData.length) return 0;
      return this.sortedData.reduce((sum, d) => sum + d.Total_Cases_per_Million, 0) / this.sortedData.length;
    },
    avgDeaths() {
      if (!this.sortedData.length) return 0;
      return this.sortedData.reduce((sum, d) => sum + d.Total_Deaths_per_Million, 0) / this.sortedData.length;
    }
  },
  mounted() {
    this.loadYears();
    this.loadData();
  },
  methods: {
    async loadYears() {
      try {
        const response = await CovidCasesDataService.getYears();
        const years = Array.isArray(response.data) ? response.data : [];
        this.years = years.map(y => (y && y.Year !== undefined ? y.Year : y));
      } catch (error) {
        console.error('Error loading years:', error);
      }
    },
    async loadData() {
      try {
        let response;
        if (this.selectedYear === 'all') {
          response = await CovidCasesDataService.getAll();
        } else {
          response = await CovidCasesDataService.getByYear(this.selectedYear);
        }
        this.data = response.data;
        this.sortData();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    sortBy(field) {
      if (this.sortMetric === field) {
        this.sortDirection *= -1;
      } else {
        this.sortMetric = field;
        this.sortDirection = 1;
      }
      this.sortData();
    },
    sortData() {
      this.sortedData = [...this.data].sort((a, b) => {
        const aVal = a[this.sortMetric] || 0;
        const bVal = b[this.sortMetric] || 0;
        return (bVal - aVal) * this.sortDirection;
      });
    },
    formatNumber(num) {
      if (!num) return '0';
      return parseFloat(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
    },
    calculateMortalityRate(item) {
      const cases = parseFloat(item.Total_Cases_per_Million) || 0;
      const deaths = parseFloat(item.Total_Deaths_per_Million) || 0;
      if (cases === 0) return '0.00';
      return ((deaths / cases) * 100).toFixed(2);
    },
    getSeverityLevel(item) {
      const deaths = parseFloat(item.Total_Deaths_per_Million) || 0;
      if (deaths > 3000) return 'Critical';
      if (deaths > 2000) return 'High';
      if (deaths > 1000) return 'Moderate';
      return 'Low';
    },
    getSeverityClass(item) {
      const deaths = parseFloat(item.Total_Deaths_per_Million) || 0;
      if (deaths > 3000) return 'severity-critical';
      if (deaths > 2000) return 'severity-high';
      if (deaths > 1000) return 'severity-moderate';
      return 'severity-low';
    }
  }
};
</script>

<style scoped>
.regional-analysis {
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

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
  margin-bottom: 30px;
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
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.data-table th:hover {
  background: #2980b9;
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

.severity-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.severity-low {
  background: #d4edda;
  color: #155724;
}

.severity-moderate {
  background: #fff3cd;
  color: #856404;
}

.severity-high {
  background: #f8d7da;
  color: #721c24;
}

.severity-critical {
  background: #dc3545;
  color: white;
}

.summary-stats {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-stats h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9em;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  color: #3498db;
  font-size: 1.8em;
  font-weight: bold;
}
</style>
