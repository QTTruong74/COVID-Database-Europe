
import pandas as pd

# Load the CSV file
df = pd.read_csv("daily-new-confirmed-covid-19-cases-deaths-per-million-people (1).csv")

# Rename columns for easier handling
df.columns = ["Index", "Entity", "Day", "Cases_per_million", "Deaths_per_million"]

# Convert Day to datetime and extract year
df['Day'] = pd.to_datetime(df['Day'], errors='coerce')
df['Year'] = df['Day'].dt.year

# Group by Entity and Year, summing cases and deaths
yearly_df = df.groupby(['Entity', 'Year'], as_index=False).agg({
    'Cases_per_million': 'sum',
    'Deaths_per_million': 'sum'
})

# Rename columns for clarity
yearly_df.rename(columns={
    'Cases_per_million': 'Total_Cases_per_Million',
    'Deaths_per_million': 'Total_Deaths_per_Million'
}, inplace=True)

# Save to a new CSV file
yearly_df.to_csv('yearly_covid_stats.csv', index=False)

# Display first few rows
print("Yearly aggregated data saved to yearly_covid_stats.csv")
print(yearly_df.head(10))
