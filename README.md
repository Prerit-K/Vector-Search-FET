# VECTOR SEARCH: Local Book Recommendation Engine

## Project Overview
**Subject:** Foundations of Emerging Technologies (FET)

Vector Search is a client-side, local heuristic recommendation engine and data analysis project. It allows users to input natural language queries (moods, feelings, quotes, or genres) and instantly retrieves the most relevant book from a localized dataset. 

The frontend user interface is designed with a philosophy of fluid minimalism, ensuring that the complex data retrieval happens behind a clean, intuitive, command-line-style terminal. To fulfill the statistical requirements of the project, this repository also contains a deep-dive data analysis (via Google Colab) exploring the correlation and linear regression between book ratings and user engagement.

---

## Dataset Details
* **Source:** Kaggle (Standardized Book Dataset)
* **File Size:** ~75 MB (`books.csv`)
* **Core Features Utilized:**
  * `Title` & `Author` (Identification)
  * `Description`, `Genres`, `Characters` (Textual Analysis)
  * `Rating`, `NumRatings`, `Awards` (Quality & Statistical Metrics)
  * `CoverImg` (UI Rendering)

*Note: The dataset is processed entirely locally in the browser using `Papa.parse` to ensure zero-latency querying without relying on external database servers.*

---

## The Search Algorithm (Heuristic Scoring)
The live website utilizes a **Custom Weighted Scoring Algorithm** rather than a standard database query. Here is how the engine processes a user's prompt:

1. **Concept Mapping (Expansion):** The user's input is cross-referenced with a conceptual dictionary. For example, if a user searches for "sad", the algorithm automatically expands the search vector to include `["tragedy", "drama", "death", "grief", "melancholy"]`.
2. **Data Normalization:** The algorithm parses the 75MB dataset asynchronously, normalizing text fields to lowercase to ensure clean comparisons.
3. **Weighted Point System:**
   * **Exact Title Match:** +100 points
   * **Partial Title Match:** +50 points
   * **Character Match:** +20 points per expanded term
   * **Genre Match:** +15 points per expanded term
   * **Description Match:** +5 points per expanded term
4. **Quality Bias Boost:** To prevent low-quality books from surfacing, the algorithm applies a multiplier based on the book's `Rating` and the length of its `Awards` list. The highest-scoring volume is then returned to the UI.

---

## Data Analysis: Correlation & Linear Regression
While the frontend handles heuristic matching, the statistical behavior of the dataset is analyzed using Python in Google Colab. 

We conducted a **Linear Regression Analysis** to observe the relationship between a book's perceived quality (`Rating`) and its popularity (`NumRatings`). 

### Python Implementation (Google Colab)
The following code was used to generate our correlation heatmaps and regression models:

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 1. Load the Dataset
# Ensure 'books.csv' is uploaded to your Colab environment
df = pd.read_csv('books.csv', on_bad_lines='skip')

# 2. Data Cleaning for Analysis
# Drop missing numerical values for accurate regression
df_clean = df.dropna(subset=['rating', 'numRatings'])
df_clean['rating'] = pd.to_numeric(df_clean['rating'], errors='coerce')
df_clean['numRatings'] = pd.to_numeric(df_clean['numRatings'], errors='coerce')
df_clean = df_clean.dropna(subset=['rating', 'numRatings'])

# 3. Correlation Analysis
print("--- Correlation Matrix ---")
correlation = df_clean[['rating', 'numRatings']].corr()
print(correlation)

# Plotting the Correlation Heatmap
plt.figure(figsize=(6, 4))
sns.heatmap(correlation, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation between Rating and Number of Ratings')
plt.show()

# 4. Linear Regression Model
# X = Independent Variable (Number of Ratings), y = Dependent Variable (Rating)
X = df_clean[['numRatings']]
y = df_clean['rating']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Model Evaluation
print("\n--- Regression Metrics ---")
print(f"Coefficient (Slope): {model.coef_[0]:.6f}")
print(f"Intercept: {model.intercept_:.6f}")
print(f"Mean Squared Error (MSE): {mean_squared_error(y_test, y_pred):.4f}")
print(f"R-squared: {r2_score(y_test, y_pred):.4f}")

# 5. Visualizing the Regression Line
plt.figure(figsize=(10, 6))
plt.scatter(X_test, y_test, color='blue', alpha=0.3, label='Actual Data')
plt.plot(X_test, y_pred, color='red', linewidth=2, label='Regression Line')
plt.title('Linear Regression: Number of Ratings vs. Book Rating')
plt.xlabel('Number of Ratings (Popularity)')
plt.ylabel('Average Rating (Quality)')
plt.legend()
plt.grid(True)
plt.show()
