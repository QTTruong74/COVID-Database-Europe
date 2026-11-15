import { createWebHistory, createRouter } from "vue-router";
import CountriesList from './components/CountriesList.vue'
import Dashboard from './components/Dashboard.vue'
import RegionalAnalysis from './components/RegionalAnalysis.vue'
import TemporalAnalysis from './components/TemporalAnalysis.vue'
import SurvivalRates from './components/SurvivalRates.vue'
import SpreadMetrics from './components/SpreadMetrics.vue'
import VaccineAnalysis from './components/VaccineAnalysis.vue'

const routes = [
  {
    path: "/countries",
    name: "countries",
    component: CountriesList
  },
    {
      path: "/",
      name: "dashboard",
      component: Dashboard
    },
    {
      path: "/regional-analysis",
      name: "regional-analysis",
      component: RegionalAnalysis
    },
    {
      path: "/temporal-analysis",
      name: "temporal-analysis",
      component: TemporalAnalysis
    },
    {
      path: "/survival-rates",
      name: "survival-rates",
      component: SurvivalRates
    },
    {
      path: "/spread-metrics",
      name: "spread-metrics",
      component: SpreadMetrics
    },
    {
      path: "/vaccine-analysis",
      name: "vaccine-analysis",
      component: VaccineAnalysis
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;