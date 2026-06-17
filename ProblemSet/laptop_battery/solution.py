
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

from sklearn.linear_model import LinearRegression

# -----------------------
# Load data
# -----------------------
path = ''
data = pd.read_csv(path)

# -----------------------
# Visualization
# -----------------------
sns.scatterplot(data=data, x='Hours_Charged', y='Battery_Gained')
plt.title("Hours Charged vs Battery Gained")
plt.show()

# -----------------------
# Find saturation point
# -----------------------
maximum_battery = data['Battery_Gained'].max()

max_charge = data[
    data['Battery_Gained'] == maximum_battery
    ]['Hours_Charged'].min()

# -----------------------
# Remove saturation region 
# -----------------------
data = data[data['Hours_Charged'] <= max_charge]

# -----------------------
# Linear Regression
# -----------------------
X = data[['Hours_Charged']]
y = data['Battery_Gained']


model = LinearRegression()
model.fit(X, y)
