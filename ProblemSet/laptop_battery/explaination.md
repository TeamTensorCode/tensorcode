## Solution Approach

### 1. Data Loading and Visualization
The dataset is first loaded using `pandas`. To understand the relationship between charging time and battery gain, a scatter plot is used. This helps visualize whether the relationship is linear or contains anomalies such as saturation.

### 2. Identifying Saturation Point
In real battery systems, once the battery reaches full capacity, it stops increasing even if charging continues. This creates a **saturation region** in the data.

To handle this, we find:
- The maximum observed battery gain
- The minimum charging time at which this maximum value occurs

This helps identify the point after which additional charging hours no longer increase battery gain.

### 3. Data Cleaning
All data points beyond the saturation point are removed:

- Only samples where `Hours_Charged <= max_charge` are retained

This ensures the remaining dataset follows a more consistent linear relationship.

### 4. Model Training
A simple **Linear Regression** model is trained using:

- Feature: `Hours_Charged`
- Target: `Battery_Gained`

The model learns the relationship between charging duration and battery gain based on the cleaned data.

### 5. Outcome
After training, the model can predict the expected battery gain for any given number of charging hours, 