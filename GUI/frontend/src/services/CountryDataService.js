import http from "../backend-access";

class CountryDataService {
  getAll() {
    return http.get("/countries");
  }

  get(code) {
    return http.get(`/countries/${code}`);
  }
}

export default new CountryDataService();
