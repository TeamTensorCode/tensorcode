# Laptop Battery Charge Prediction

## Problem Statement

Ali has been tracking his laptop’s charging behavior. Every time his laptop battery runs out, he plugs it in and records:

- The number of hours the laptop is charged
- The battery percentage gained after charging

Over time, he has collected this data in a CSV file.


## Task

Your goal is to build a regression model that learns the relationship between charging time and battery gain.

Given the number of hours a laptop is charged, predict the **battery percentage gained**.

## Input

A CSV file containing:

- `Hours_Charged` — Number of hours the laptop was charged
- `Battery_Gained` — Battery percentage gained after charging

## Output

For each input value of `Hours_Charged`, predict the corresponding `Battery_Gained`.

## Evaluation

Your predictions will be evaluated using a regression metric as:

- R² Score

## Example

| Hours_Charged | Battery_Gained |
|--------------|----------------|
| 1.0          | 20             |
| 2.0          | 40             |
| 3.5          | 70             |

If the laptop is charged for **2.5 hours**, your model should estimate the expected battery gain.
