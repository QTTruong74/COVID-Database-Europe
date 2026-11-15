import http from "../backend-access";

class CovidCasesDataService {
  getAll() {
    return http.get("/covid-cases");
  }

  getAllYears() {
    return http.get("/covid-cases/years");
  }

  // Convenience alias used by multiple views
  getYears() {
    return this.getAllYears();
  }

  getByYear(year) {
    return http.get(`/covid-cases/year/${year}`);
  }
}

export default new CovidCasesDataService();
