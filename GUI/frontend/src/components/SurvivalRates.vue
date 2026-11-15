<template>
  <div class="survival-rates">
    <h1>Survival Rates Analysis</h1>
    <p class="description">Calculate survival rates based on vaccination status and age to identify risk groups</p>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Select Country:</label>
        <select v-model="selectedCountry" @change="loadData">
          <option value="">-- Select Country --</option>
          <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>Select Year:</label>
        <select v-model="selectedYear" @change="loadData">
          <option value="">-- Select Year --</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <!-- Vaccination Data -->
    <div v-if="vaccinationData.length > 0" class="vaccination-section">
      <h2>Vaccination Coverage by Age Group</h2>
      <div class="chart-container">
        <Bar :data="vaccinationChartData" :options="vaccinationChartOptions" />
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Age Group</th>
            <th>1st Dose (%)</th>
            <th>2nd Dose (%)</th>
            <th>Additional Dose (%)</th>
            <th>Vaccination Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in vaccinationData" :key="item.AgeGroup">
            <td class="age-group">{{ item.AgeGroup }}</td>
            <td>{{ formatPercent(item.Denominator_1) }}</td>
            <td>{{ formatPercent(item.Denominator_2) }}</td>
            <td>{{ formatPercent(item.DoseAdditional1) }}</td>
            <td>
              <span class="status-badge" :class="getVaccinationClass(item.Denominator_2)">
                {{ getVaccinationStatus(item.Denominator_2) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mortality Analysis -->
    <div v-if="mortalityData" class="mortality-section">
      <h2>Mortality Rate Analysis</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Overall Mortality Rate</div>
          <div class="stat-value">{{ mortalityData.overall }}%</div>
          <div class="stat-description">Deaths per 100 cases</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Case Fatality Rate</div>
          <div class="stat-value">{{ mortalityData.caseFatality }}%</div>
          <div class="stat-description">Based on total cases/deaths</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Estimated Survival Rate</div>
          <div class="stat-value">{{ mortalityData.survival }}%</div>
          <div class="stat-description">100% - Mortality Rate</div>
        </div>
      </div>

      <!-- Risk Assessment by Age -->
      <div class="risk-analysis">
        <h3>Risk Assessment by Age Group</h3>
        <div class="risk-grid">
          <div v-for="risk in riskByAge" :key="risk.age" class="risk-card" :class="risk.riskLevel">
            <h4>{{ risk.age }}</h4>
            <div class="risk-metrics">
              <div>
                <strong>Vaccination Rate:</strong> {{ risk.vaccinationRate }}%
              </div>
              <div>
                <strong>Risk Level:</strong> {{ risk.riskLabel }}
              </div>
              <div>
                <strong>Estimated Protection:</strong> {{ risk.protection }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Survival Calculator -->
    <div class="calculator-section">
      <h2>Survival Rate Calculator</h2>
      <div class="calculator">
        <div class="calculator-inputs">
          <div class="input-group">
            <label>Age Group:</label>
            <select v-model="calcAge">
              <option value="18-24">18-24</option>
              <option value="25-49">25-49</option>
              <option value="50-59">50-59</option>
              <option value="60-69">60-69</option>
              <option value="70-79">70-79</option>
              <option value="80+">80+</option>
            </select>
          </div>

          <div class="input-group">
            <label>Vaccination Status:</label>
            <select v-model="calcVaccination">
              <option value="unvaccinated">Unvaccinated</option>
              <option value="partial">Partially Vaccinated</option>
              <option value="full">Fully Vaccinated</option>
              <option value="booster">Booster Received</option>
            </select>
          </div>

          <button @click="calculateSurvival" class="calc-button">Calculate</button>
        </div>

        <div v-if="calcResult" class="calc-result">
          <h3>⚕️ Estimated Survival Rate</h3>
          <div class="result-value" :class="getRiskClass(calcResult.riskFactor)">{{ calcResult.survivalRate }}%</div>
          <div class="mortality-value">Mortality Risk: {{ calcResult.mortalityRate }}%</div>
          
          <div class="result-details">
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Risk Level:</strong>
                <span class="badge" :class="getRiskBadgeClass(calcResult.riskFactor)">{{ calcResult.riskFactor }}</span>
              </div>
              <div class="detail-item">
                <strong>Protection Level:</strong>
                <span>{{ calcResult.protectionLevel }}</span>
              </div>
              <div class="detail-item">
                <strong>Vaccine Effectiveness:</strong>
                <span>{{ calcResult.vaccineEffectiveness }}</span>
              </div>
              <div class="detail-item">
                <strong>Risk Reduction:</strong>
                <span class="positive">{{ calcResult.riskReduction }}</span>
              </div>
            </div>

            <div class="calculation-breakdown">
              <h4>📊 Calculation Breakdown:</h4>
              <ul>
                <li><strong>Baseline CFR (Country Average):</strong> {{ calcResult.baselineCFR }}%</li>
                <li><strong>Age-Adjusted CFR:</strong> {{ calcResult.ageAdjustedCFR }}%</li>
                <li><strong>After Vaccine Protection:</strong> {{ calcResult.mortalityRate }}%</li>
              </ul>
            </div>

            <div class="recommendation-box">
              <strong>💡 Recommendation:</strong>
              <p>{{ calcResult.recommendation }}</p>
            </div>

            <div class="disclaimer">
              <small>
                ⚠️ <strong>Disclaimer:</strong> This is an ESTIMATE based on:
                <ul>
                  <li>Real mortality data from {{ selectedCountry }} ({{ selectedYear }})</li>
                  <li>Published age-specific risk factors</li>
                  <li>Generic vaccine effectiveness (not specific vaccine brand)</li>
                  <li>Individual risk varies based on health conditions</li>
                </ul>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedCountry || !selectedYear" class="no-data">
      <p>Please select a country and year to view survival rate analysis</p>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import http from "../backend-access";
import CovidCasesDataService from "../services/CovidCasesDataService";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'SurvivalRates',
  components: {
    Bar
  },
  data() {
    return {
      countries: [],
      years: [],
      selectedCountry: '',
      selectedYear: '',
      vaccinationData: [],
      covidData: null,
      calcAge: '25-49',
      calcVaccination: 'full',
      calcResult: null,
      // Real-world vaccine effectiveness against death (based on research)
      vaccineEffectiveness: {
        'COM': { // Pfizer/BioNTech
          partial: 0.50,
          full: 0.88,
          booster: 0.95
        },
        'MOD': { // Moderna
          partial: 0.48,
          full: 0.87,
          booster: 0.94
        },
        'AZ': { // AstraZeneca
          partial: 0.40,
          full: 0.75,
          booster: 0.85
        },
        'JANSS': { // Johnson & Johnson
          partial: 0.30,
          full: 0.70,
          booster: 0.80
        },
        'default': { // Generic/Unknown
          partial: 0.45,
          full: 0.80,
          booster: 0.90
        }
      },
      // Age-specific mortality multipliers (based on real COVID-19 data)
      // These represent relative risk compared to 25-49 age group
      ageRiskMultipliers: {
        '18-24': 0.5,   // Half the risk of 25-49
        '25-49': 1.0,   // Baseline
        '50-59': 5.0,   // 5x higher risk
        '60-69': 25.0,  // 25x higher risk
        '70-79': 90.0,  // 90x higher risk
        '80+': 300.0    // 300x higher risk
      },
      vaccineDistribution: []
    };
  },
  computed: {
    vaccinationChartData() {
      if (!this.vaccinationData.length) return null;

      return {
        labels: this.vaccinationData.map(d => d.AgeGroup),
        datasets: [
          {
            label: '1st Dose Coverage',
            data: this.vaccinationData.map(d => parseFloat(d.Denominator_1) || 0),
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          },
          {
            label: '2nd Dose Coverage',
            data: this.vaccinationData.map(d => parseFloat(d.Denominator_2) || 0),
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          },
          {
            label: 'Booster Dose',
            data: this.vaccinationData.map(d => parseFloat(d.DoseAdditional1) || 0),
            backgroundColor: 'rgba(155, 89, 182, 0.6)',
            borderColor: 'rgba(155, 89, 182, 1)',
            borderWidth: 1
          }
        ]
      };
    },
    vaccinationChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Vaccination Coverage - ${this.selectedCountry} (${this.selectedYear})`
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Coverage (%)'
            }
          }
        }
      };
    },
    mortalityData() {
      if (!this.covidData) return null;

      const cases = parseFloat(this.covidData.Total_Cases_per_Million) || 0;
      const deaths = parseFloat(this.covidData.Total_Deaths_per_Million) || 0;

      if (cases === 0) return null;

      // Calculate REAL case fatality rate from actual data
      const caseFatality = (deaths / cases) * 100;
      const survival = 100 - caseFatality;

      return {
        overall: caseFatality.toFixed(2),
        caseFatality: caseFatality.toFixed(2),
        survival: survival.toFixed(2),
        totalCases: cases.toFixed(0),
        totalDeaths: deaths.toFixed(2)
      };
    },
    riskByAge() {
      if (!this.vaccinationData.length || !this.mortalityData) return [];

      const baselineCFR = parseFloat(this.mortalityData.caseFatality);

      return this.vaccinationData.map(vax => {
        const vacRate = parseFloat(vax.Denominator_2) || 0;
        
        // Use realistic age risk multipliers
        let riskMultiplier = 1;
        if (vax.AgeGroup.includes('Age80+') || vax.AgeGroup.includes('80+')) {
          riskMultiplier = 300; // 300x baseline risk
        } else if (vax.AgeGroup.includes('Age70') || vax.AgeGroup.includes('70-79')) {
          riskMultiplier = 90;  // 90x baseline risk
        } else if (vax.AgeGroup.includes('Age60') || vax.AgeGroup.includes('60-69')) {
          riskMultiplier = 25;  // 25x baseline risk
        } else if (vax.AgeGroup.includes('Age50') || vax.AgeGroup.includes('50-59')) {
          riskMultiplier = 5;   // 5x baseline risk
        } else if (vax.AgeGroup.includes('Age18') || vax.AgeGroup.includes('Age25') || vax.AgeGroup.includes('18-24') || vax.AgeGroup.includes('25-49')) {
          riskMultiplier = 0.5; // 0.5x baseline risk
        }

        // Calculate age-adjusted CFR
        const ageAdjustedCFR = baselineCFR * riskMultiplier;
        
        // Apply vaccine protection (assumes generic ~85% effectiveness for full vaccination)
        const vaccineProtection = vacRate / 100 * 0.85;
        const protectedCFR = ageAdjustedCFR * (1 - vaccineProtection);
        
        const survivalRate = 100 - protectedCFR;

        let riskLevel = 'low';
        let riskLabel = 'Low Risk';
        if (protectedCFR > 5) {
          riskLevel = 'high';
          riskLabel = 'High Risk';
        } else if (protectedCFR > 1) {
          riskLevel = 'moderate';
          riskLabel = 'Moderate Risk';
        }

        return {
          age: vax.AgeGroup,
          vaccinationRate: vacRate.toFixed(1),
          riskLevel,
          riskLabel,
          protection: (vaccineProtection * 100).toFixed(1),
          estimatedCFR: protectedCFR.toFixed(3),
          survivalRate: survivalRate.toFixed(2)
        };
      });
    }
  },
  async mounted() {
    await this.loadCountries();
    await this.loadYears();
  },
  methods: {
    async loadCountries() {
      try {
        const response = await http.get('/vaccination-country-age/countries');
        if (Array.isArray(response.data) && response.data.length) {
          this.countries = response.data;
        } else {
          throw new Error('Empty countries response');
        }
      } catch (error) {
        console.error('Error loading countries:', error);
        // Fallback: derive from covid cases if vaccination endpoint fails/empty
        try {
          const covidResp = await CovidCasesDataService.getAll();
          const derived = [...new Set(covidResp.data.map(d => d.Country))].sort();
          this.countries = derived;
        } catch (err) {
          console.error('Fallback country load failed:', err);
        }
      }
    },
    async loadYears() {
      try {
        const response = await http.get('/vaccination-country-age/years');
        if (Array.isArray(response.data) && response.data.length) {
          this.years = response.data;
        } else {
          throw new Error('Empty years response');
        }
      } catch (error) {
        console.error('Error loading years:', error);
        // Fallback: derive from covid cases if vaccination endpoint fails/empty
        try {
          const covidResp = await CovidCasesDataService.getYears();
          const rawYears = Array.isArray(covidResp.data) ? covidResp.data : [];
          this.years = rawYears.map(y => (y && y.Year !== undefined ? y.Year : y));
        } catch (err) {
          console.error('Fallback year load failed:', err);
        }
      }
    },
    async loadData() {
      if (!this.selectedCountry || !this.selectedYear) return;

      try {
        // Load vaccination data
        const vacResponse = await http.get(
          `/vaccination-country-age?country=${this.selectedCountry}&year=${this.selectedYear}`
        );
        this.vaccinationData = vacResponse.data;

        // Load COVID data
        const covidResponse = await http.get(
          `/covid-cases/year/${this.selectedYear}`
        );
        this.covidData = covidResponse.data.find(d => d.Country === this.selectedCountry);

      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    calculateSurvival() {
      if (!this.mortalityData) {
        alert('Please select a country and year first');
        return;
      }

      // Get REAL baseline CFR from actual data
      const baselineCFR = parseFloat(this.mortalityData.caseFatality);
      
      // Apply age risk multiplier (based on real epidemiological data)
      const ageMultiplier = this.ageRiskMultipliers[this.calcAge] || 1.0;
      const ageAdjustedCFR = baselineCFR * ageMultiplier;

      // Get vaccine effectiveness
      let vaccineEff = 0;
      let protectionLevel = '';
      let vaccineName = 'Generic';
      
      if (this.calcVaccination === 'booster') {
        vaccineEff = this.vaccineEffectiveness.default.booster;
        protectionLevel = 'Excellent (Booster)';
      } else if (this.calcVaccination === 'full') {
        vaccineEff = this.vaccineEffectiveness.default.full;
        protectionLevel = 'Very Good (Fully Vaccinated)';
      } else if (this.calcVaccination === 'partial') {
        vaccineEff = this.vaccineEffectiveness.default.partial;
        protectionLevel = 'Moderate (Partially Vaccinated)';
      } else {
        vaccineEff = 0.0;
        protectionLevel = 'None (Unvaccinated)';
      }

      // Calculate final CFR with vaccine protection
      // Formula: Protected CFR = Age-Adjusted CFR × (1 - Vaccine Effectiveness)
      const protectedCFR = ageAdjustedCFR * (1 - vaccineEff);
      const survivalRate = 100 - protectedCFR;

      // Determine risk factor
      let riskFactor = 'Low';
      let recommendation = 'Continue following health guidelines and maintain vaccination status';
      
      if (protectedCFR > 5) {
        riskFactor = 'High';
        recommendation = 'High risk group. Strongly consider booster doses and additional protective measures. Consult with healthcare provider.';
      } else if (protectedCFR > 1) {
        riskFactor = 'Moderate';
        recommendation = 'Moderate risk. Ensure full vaccination including boosters. Follow safety protocols.';
      } else if (protectedCFR > 0.1) {
        riskFactor = 'Low';
        recommendation = 'Low risk. Maintain vaccination status and follow standard health guidelines.';
      } else {
        riskFactor = 'Very Low';
        recommendation = 'Very low risk. Continue standard health practices.';
      }

      this.calcResult = {
        survivalRate: survivalRate.toFixed(4),
        mortalityRate: protectedCFR.toFixed(4),
        baselineCFR: baselineCFR.toFixed(3),
        ageAdjustedCFR: ageAdjustedCFR.toFixed(3),
        riskFactor,
        protectionLevel,
        vaccineName,
        vaccineEffectiveness: (vaccineEff * 100).toFixed(0) + '%',
        riskReduction: ((ageAdjustedCFR - protectedCFR) / ageAdjustedCFR * 100).toFixed(1) + '%',
        recommendation
      };
    },
    formatPercent(value) {
      if (!value) return '0.0%';
      return `${parseFloat(value).toFixed(1)}%`;
    },
    getVaccinationStatus(rate) {
      const val = parseFloat(rate) || 0;
      if (val >= 80) return 'High Coverage';
      if (val >= 60) return 'Good Coverage';
      if (val >= 40) return 'Moderate Coverage';
      return 'Low Coverage';
    },
    getVaccinationClass(rate) {
      const val = parseFloat(rate) || 0;
      if (val >= 80) return 'status-high';
      if (val >= 60) return 'status-good';
      if (val >= 40) return 'status-moderate';
      return 'status-low';
    },
    getRiskClass(riskFactor) {
      if (riskFactor === 'High') return 'risk-high';
      if (riskFactor === 'Moderate') return 'risk-moderate';
      return 'risk-low';
    },
    getRiskBadgeClass(riskFactor) {
      if (riskFactor === 'High') return 'badge-high';
      if (riskFactor === 'Moderate') return 'badge-moderate';
      return 'badge-low';
    }
  }
};
</script>

<style scoped>
.survival-rates {
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

.vaccination-section, .mortality-section, .calculator-section {
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
  height: 300px;
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
  white-space: nowrap;
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ecf0f1;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.age-group {
  font-weight: 600;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.status-high {
  background: #d4edda;
  color: #155724;
}

.status-good {
  background: #d1ecf1;
  color: #0c5460;
}

.status-moderate {
  background: #fff3cd;
  color: #856404;
}

.status-low {
  background: #f8d7da;
  color: #721c24;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 25px;
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
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-description {
  color: #95a5a6;
  font-size: 0.85em;
}

.risk-analysis {
  margin-top: 30px;
}

.risk-analysis h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.risk-card {
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.risk-card.low {
  background: #d4edda;
  border-color: #28a745;
}

.risk-card.moderate {
  background: #fff3cd;
  border-color: #ffc107;
}

.risk-card.high {
  background: #f8d7da;
  border-color: #dc3545;
}

.risk-card h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.risk-metrics div {
  margin: 5px 0;
  color: #495057;
  font-size: 0.9em;
}

.calculator {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
}

.calculator-inputs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  color: #2c3e50;
}

.input-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.calc-button {
  padding: 10px 30px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.calc-button:hover {
  background: #2980b9;
}

.calc-result {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.calc-result h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.result-value {
  font-size: 3em;
  font-weight: bold;
  color: #27ae60;
  text-align: center;
  margin-bottom: 10px;
}

.result-value.risk-high {
  color: #e74c3c;
}

.result-value.risk-moderate {
  color: #f39c12;
}

.result-value.risk-low {
  color: #27ae60;
}

.mortality-value {
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1em;
  margin-bottom: 20px;
}

.result-details {
  margin-top: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item strong {
  color: #2c3e50;
  font-size: 0.9em;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-block;
  font-size: 0.9em;
}

.badge-high {
  background: #f8d7da;
  color: #721c24;
}

.badge-moderate {
  background: #fff3cd;
  color: #856404;
}

.badge-low {
  background: #d4edda;
  color: #155724;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.calculation-breakdown {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  border-left: 4px solid #27ae60;
}

.calculation-breakdown h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.calculation-breakdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.calculation-breakdown li {
  margin: 8px 0;
  color: #495057;
}

.recommendation-box {
  background: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  border-left: 4px solid #f39c12;
}

.recommendation-box strong {
  color: #856404;
  display: block;
  margin-bottom: 8px;
}

.recommendation-box p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
}

.disclaimer {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #6c757d;
}

.disclaimer small {
  color: #6c757d;
}

.disclaimer ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.disclaimer li {
  margin: 5px 0;
}

.result-details p {
  margin: 10px 0;
  color: #495057;
  font-size: 1.1em;
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
