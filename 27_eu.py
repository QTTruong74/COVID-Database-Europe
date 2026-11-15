
import pandas as pd

# Load the CSV file (semicolon separated)
df = pd.read_csv("vaccin_age.csv", sep=';', quotechar='"')

# List of EU countries (27 members)
eu_countries = [
    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
    "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]

# Filter only EU countries
df_eu = df[df['ReportingCountry'].isin(eu_countries)]

# Aggregate: sum Population and TotalDoses by Year, TargetGroup, Vaccine
df_agg = df_eu.groupby(['Year', 'TargetGroup', 'Vaccine'], as_index=False).agg({
    'Population': 'sum',
    'TotalDoses': 'sum'
})

# Save aggregated data to CSV
output_file = "test.csv"
df_agg.to_csv(output_file, index=False)

print(f"Aggregated EU vaccination data saved to {output_file} with {len(df_agg)} rows.")
