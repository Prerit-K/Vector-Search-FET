# VECTOR SEARCH: Local Consultation Engine

**Vector Search** is a locally hosted, blueprint-themed web application that acts as a book recommendation engine. It features a technical, monospace UI and processes natural language queries against a local CSV database (`books.csv`) using a custom multiple linear scoring algorithm.

---

## Part 1: How the Web App Works

The application runs entirely in the browser without needing a backend server.

### 1. The Tech Stack

* **Frontend:** Pure HTML5, CSS3 (Custom Variables, CSS Grid/Flexbox), and Vanilla JavaScript.
* **Styling Theme:** "System Schematic" heavily relies on `Courier Prime`, dashed technical borders, and a stark `Deep Blueprint Blue` (`#2B4365`) and `Safety Yellow` (`#FFD700`) color palette.
* **Data Parsing:** Uses `papaparse.min.js` to asynchronously load and parse the local `books.csv` file directly in the browser.

### 2. The Search Algorithm (Concept Mapping & Scoring)

Instead of a true vector database (which requires a backend), the app uses a **Concept Mapping** technique.

1. **Keyword Expansion:** If a user types "sad", the algorithm expands the search array to include `["tragedy", "drama", "death", "grief", "melancholy..."]`.
2. **Multiple Linear Scoring:** The app iterates through the library and applies a linear equation to rank the books.
* Exact Title Match: $+100$ points
* Partial Title Match: $+50$ points
* Character/Genre Match: $+20$ points
* Quality Bias: (Rating $\times\ 5$) + Awards bonus.



---

## Part 2: Addressing the "Linear Regression" Subtitle

The UI includes the subtitle `LINEAR REGRESSION MODEL`. While the web app itself uses a *linear scoring equation* rather than predictive machine learning, the underlying dataset (`books.csv`) has been analyzed using statistical Correlation and Linear Regression in Google Colab to validate the data structures.

### Key Data Science Concepts Explained (For the Defense)

If asked how the data is categorized, whether it uses correlation or regression, and what the numbers mean, refer to this guide:

**1. Is the data classified or grouped?**
Yes. The dataset utilizes **Categorical Data**. Books are grouped by the `genres` column. However, the project relies on keyword mapping and linear scoring rather than training a classification model to predict genres.

**2. Correlation vs. Regression in this Dataset:**

* **Correlation:** We check if two numeric variables in the CSV are related. For example, does a high number of ratings (`numRatings`) correlate with a higher overall `rating`?
* **Linear Regression:** If a relationship exists, regression draws a mathematical line of best fit to predict future outcomes using the formula $y = \beta_0 + \beta_1x + \epsilon$.

**3. The 0.7 Rule (Pearson Correlation Coefficient - $r$):**
When measuring correlation, the output is a value ($r$) between $-1$ and $1$.

* $r = 0$: No relationship.
* $|r| \geq 0.7$: A **strong** relationship. If our Colab analysis shows a value less than $0.7$ (e.g., $0.2$), it means the variables don't strongly impact each other, and plotting a regression line won't yield highly accurate predictions.

---

## Part 3: Google Colab Visualization Guide

To visually prove the statistical nature of the dataset to the instructor, run the following Python script in Google Colab.

### Execution Instructions:

1. Go to [colab.research.google.com](https://colab.research.google.com/).
2. Click **File > New Notebook**.
3. On the left sidebar, click the **Folder icon** (Files) and upload your `books.csv` file.
4. Paste the code below into the first cell and press the **Play** button.

### The Python Code

```python
#Github Link  = https://github.com/Prerit-K/Vector-Search-FET/tree/main
#Website Link = https://prerit-k.github.io/Vector-Search-FET/

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 1. Load the dataset
# Ensure 'books.csv' is uploaded to the Colab files sidebar
df = pd.read_csv('books.csv')

# 2. Clean the data (ensure rating and numRatings are numbers, dropping errors)
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['numRatings'] = pd.to_numeric(df['numRatings'], errors='coerce')
df = df.dropna(subset=['rating', 'numRatings'])

# 3. Calculate Correlation
correlation_value = df['rating'].corr(df['numRatings'])
print(f"Pearson Correlation (r) between Rating and Number of Ratings: {correlation_value:.2f}")

if abs(correlation_value) >= 0.7:
    print("Conclusion: STRONG correlation (Meets the 0.7 threshold).")
else:
    print("Conclusion: WEAK correlation (Does not meet the 0.7 threshold).")

# 4. Visualization 1: Correlation Heatmap
plt.figure(figsize=(6, 4))
corr_matrix = df[['rating', 'numRatings']].corr()
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
plt.title('Correlation Heatmap')
plt.show()

# 5. Visualization 2: Linear Regression Scatter Plot
plt.figure(figsize=(8, 5))
sns.regplot(x='numRatings', y='rating', data=df, scatter_kws={'alpha':0.3}, line_kws={'color':'red'})
plt.title('Linear Regression: Rating vs. Number of Ratings')
plt.xlabel('Number of Ratings')
plt.ylabel('Average Rating')
plt.show()


```

### Expected Output Visualizations

Once you run the code, Colab will generate two graphs that you can show your teacher:

1. **The Heatmap:** This grid will clearly display the exact $r$ value.
2. **The Regression Plot:** This will plot every book in your CSV as a dot and draw the red linear regression line through the data.

To view the Results:

https://colab.research.google.com/drive/1M44dDSwxBF8XuYgxSzEU6JdKoBxLlxgM?usp=sharing
