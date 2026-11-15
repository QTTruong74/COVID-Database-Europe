<template>
  <div class="dashboard-container">
    <h1>COVID-19 Comprehensive Analysis Dashboard</h1>
    <p class="subtitle">Flexible and detailed examination of pandemic data</p>

    <!-- Module Selection -->
    <div class="modules-grid">
      <div class="module-card" @click="navigateTo('/regional-analysis')">
        <div class="module-icon">🌍</div>
        <h3>Regional Analysis</h3>
        <p>Analyze how strongly individual countries were affected based on infections, deaths, and vaccination rates</p>
      </div>

      <div class="module-card" @click="navigateTo('/temporal-analysis')">
        <div class="module-icon">📈</div>
        <h3>Temporal Analysis</h3>
        <p>Track pandemic progression over different phases and identify growth or decline periods</p>
      </div>

      <div class="module-card" @click="navigateTo('/survival-rates')">
        <div class="module-icon">💉</div>
        <h3>Survival Rates</h3>
        <p>Calculate survival rates based on vaccination status and age to identify risk groups</p>
      </div>

      <div class="module-card" @click="navigateTo('/spread-metrics')">
        <div class="module-icon">📊</div>
        <h3>Spread Metrics</h3>
        <p>Analyze growth rate, doubling time, and reproduction number</p>
      </div>

      <div class="module-card" @click="navigateTo('/vaccine-analysis')">
        <div class="module-icon">💊</div>
        <h3>Vaccine Analysis</h3>
        <p>Compare vaccine types used and their effectiveness rates</p>
      </div>

      <div class="module-card" @click="navigateTo('/countries')">
        <div class="module-icon">📋</div>
        <h3>Country Data</h3>
        <p>View detailed statistics and compare countries in sortable tables</p>
      </div>
    </div>

    <!-- Quick Stats Overview -->
    <div class="quick-stats" v-if="stats">
      <h2>Quick Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalCountries }}</div>
          <div class="stat-label">Countries Analyzed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.years }}</div>
          <div class="stat-label">Years of Data</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(stats.totalCases) }}</div>
          <div class="stat-label">Total Cases (millions)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(stats.totalDeaths) }}</div>
          <div class="stat-label">Total Deaths</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CovidCasesDataService from '../services/CovidCasesDataService';

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: null
    };
  },
  mounted() {
    this.loadQuickStats();
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    async loadQuickStats() {
      try {
        const response = await CovidCasesDataService.getAll();
        const data = response.data;
        
        const countries = new Set(data.map(d => d.Country));
        const years = new Set(data.map(d => d.Year));
        
        // Calculate totals (approximate from per million data)
        const totalCases = data.reduce((sum, d) => {
          return sum + (parseFloat(d.Total_Cases_per_Million) || 0);
        }, 0) / 1000000; // Convert to millions
        
        const totalDeaths = data.reduce((sum, d) => {
          return sum + (parseFloat(d.Total_Deaths_per_Million) || 0);
        }, 0) / 1000;
        
        this.stats = {
          totalCountries: countries.size,
          years: `${Math.min(...years)} - ${Math.max(...years)}`,
          totalCases: totalCases,
          totalDeaths: totalDeaths
        };
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },
    formatNumber(num) {
      return num.toFixed(1);
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1em;
  margin-bottom: 40px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.module-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.15);
}

.module-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.module-card h3 {
  color: #3498db;
  margin-bottom: 10px;
  font-size: 1.3em;
}

.module-card p {
  color: #7f8c8d;
  font-size: 0.95em;
  line-height: 1.5;
}

.quick-stats {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-top: 40px;
}

.quick-stats h2 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 10px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
