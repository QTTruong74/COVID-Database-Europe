<template>
  <div class="countries-list-container">
    <h2>COVID-19 Statistics by Country</h2>
    
    <!-- Year Filter -->
    <div class="filters">
      <label for="yearSelect"><strong>Select Year:</strong></label>
      <select id="yearSelect" v-model="selectedYear" @change="loadCovidData" class="form-select">
        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>

    <!-- Countries Table -->
    <div class="table-responsive mt-4">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th @click="sortBy('Country')" style="cursor: pointer;">
              Country {{ sortColumn === 'Country' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
            <th @click="sortBy('Year')" style="cursor: pointer;">
              Year {{ sortColumn === 'Year' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
            <th @click="sortBy('Total_Cases_per_Million')" style="cursor: pointer;">
              Total Cases/M {{ sortColumn === 'Total_Cases_per_Million' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
            <th @click="sortBy('Total_Deaths_per_Million')" style="cursor: pointer;">
              Total Deaths/M {{ sortColumn === 'Total_Deaths_per_Million' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
            <th @click="sortBy('Peak_Cases_per_Million')" style="cursor: pointer;">
              Peak Cases/M {{ sortColumn === 'Peak_Cases_per_Million' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
            <th @click="sortBy('Peak_Deaths_per_Million')" style="cursor: pointer;">
              Peak Deaths/M {{ sortColumn === 'Peak_Deaths_per_Million' ? (sortDirection === 'asc' ? '▲' : '▼') : '' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="country in sortedData" :key="country.Country + country.Year" 
              @click="selectCountry(country)"
              :class="{ 'table-active': selectedCountry === country }"
              style="cursor: pointer;">
            <td>{{ country.Country }}</td>
            <td>{{ country.Year }}</td>
            <td :class="getCasesClass(country.Total_Cases_per_Million)">
              {{ formatNumber(country.Total_Cases_per_Million) }}
            </td>
            <td :class="getDeathsClass(country.Total_Deaths_per_Million)">
              {{ formatNumber(country.Total_Deaths_per_Million) }}
            </td>
            <td>{{ formatNumber(country.Peak_Cases_per_Million) }}</td>
            <td>{{ formatNumber(country.Peak_Deaths_per_Million) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Selected Country Details -->
    <div v-if="selectedCountry" class="country-details mt-4">
      <h3>{{ selectedCountry.Country }} - {{ selectedCountry.Year }} Details</h3>
      <div class="row">
        <div class="col-md-6">
          <div class="detail-card">
            <h5>Cases Statistics</h5>
            <p><strong>Total Cases per Million:</strong> {{ formatNumber(selectedCountry.Total_Cases_per_Million) }}</p>
            <p><strong>Peak Cases per Million:</strong> {{ formatNumber(selectedCountry.Peak_Cases_per_Million) }}</p>
            <p><strong>Average Cases per Million:</strong> {{ formatNumber(selectedCountry.Avg_Cases_per_Million) }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="detail-card">
            <h5>Deaths Statistics</h5>
            <p><strong>Total Deaths per Million:</strong> {{ formatNumber(selectedCountry.Total_Deaths_per_Million) }}</p>
            <p><strong>Peak Deaths per Million:</strong> {{ formatNumber(selectedCountry.Peak_Deaths_per_Million) }}</p>
            <p><strong>Average Deaths per Million:</strong> {{ formatNumber(selectedCountry.Avg_Deaths_per_Million) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center mt-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import CovidCasesDataService from '../services/CovidCasesDataService';

export default {
  name: 'CountriesList',
  data() {
    return {
      covidData: [],
      availableYears: [],
      selectedYear: 2020,
      selectedCountry: null,
      loading: false,
      sortColumn: 'Total_Cases_per_Million',
      sortDirection: 'desc'
    };
  },
  computed: {
    sortedData() {
      const data = [...this.covidData];
      if (!this.sortColumn) return data;

      return data.sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        // Convert to numbers if they're numeric strings
        if (typeof aVal === 'string' && !isNaN(aVal)) aVal = parseFloat(aVal);
        if (typeof bVal === 'string' && !isNaN(bVal)) bVal = parseFloat(bVal);

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
  },
  mounted() {
    this.loadYears();
  },
  methods: {
    async loadYears() {
      try {
        const response = await CovidCasesDataService.getAllYears();
        this.availableYears = response.data.map(item => item.Year).sort();
        if (this.availableYears.length > 0) {
          this.selectedYear = this.availableYears[0];
          this.loadCovidData();
        }
      } catch (error) {
        console.error('Error loading years:', error);
      }
    },
    async loadCovidData() {
      this.loading = true;
      try {
        const response = await CovidCasesDataService.getByYear(this.selectedYear);
        this.covidData = response.data;
        this.selectedCountry = null;
      } catch (error) {
        console.error('Error loading COVID data:', error);
      } finally {
        this.loading = false;
      }
    },
    selectCountry(country) {
      this.selectedCountry = country;
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'desc';
      }
    },
    formatNumber(value) {
      if (value === null || value === undefined) return 'N/A';
      const num = parseFloat(value);
      return isNaN(num) ? 'N/A' : num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    },
    getCasesClass(cases) {
      const num = parseFloat(cases);
      if (num > 300000) return 'text-danger fw-bold';
      if (num > 100000) return 'text-warning fw-bold';
      return '';
    },
    getDeathsClass(deaths) {
      const num = parseFloat(deaths);
      if (num > 2000) return 'text-danger fw-bold';
      if (num > 1000) return 'text-warning fw-bold';
      return '';
    }
  }
};
</script>

<style scoped>
.countries-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-select {
  width: 200px;
}

.table-responsive {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  background: #343a40;
  color: white;
  font-weight: 600;
  padding: 12px;
}

.table td {
  padding: 10px 12px;
}

.table-hover tbody tr:hover {
  background-color: #e9ecef;
}

.country-details {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.country-details h3 {
  color: #007bff;
  margin-bottom: 20px;
}

.detail-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.detail-card h5 {
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.detail-card p {
  margin-bottom: 10px;
  font-size: 1.05em;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #fd7e14 !important;
}

.fw-bold {
  font-weight: bold;
}
</style>
