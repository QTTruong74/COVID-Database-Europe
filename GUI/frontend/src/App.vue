
<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
                <li class="nav-item">
                  <router-link to="/" class="nav-link">Dashboard</router-link>
                </li>
        <li class="nav-item">
          <router-link to="/countries" class="nav-link">Countries</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/regional-analysis" class="nav-link">Regional Analysis</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/temporal-analysis" class="nav-link">Temporal Analysis</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/survival-rates" class="nav-link">Survival Rates</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/spread-metrics" class="nav-link">Spread Metrics</router-link>
        </li>
      </div>
    </nav>

    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>

