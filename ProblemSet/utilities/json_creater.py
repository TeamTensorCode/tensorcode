import os
import json
import pandas as pd

# =========================
# CONFIG (YOU EDIT THIS)
# =========================
path = "/home/huzaifa/Code/tensorcode/ProblemSet/laptop_battery"
difficulty = "easy"   # easy / medium / hard


# =========================
# HELPERS
# =========================
def read_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def read_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")


# =========================
# MAIN BUILDER
# =========================
def build_json(problem_path, difficulty_level):
    data = {}

    # file paths
    files = {
        "statement": "statement.txt",
        "trainset": "Training_Set.csv",
        "testset": "Test_Set.csv",
        "solution": "solution.py",
        "explanation": "explaination.md"
    }

    # read files if exist
    for key, file_name in files.items():
        full_path = os.path.join(problem_path, file_name)

        if os.path.exists(full_path):
            if file_name.endswith(".csv"):
                data[key] = read_csv(full_path)
            else:
                data[key] = read_file(full_path)

    # metadata
    data["problem_name"] = os.path.basename(problem_path)
    data["difficulty"] = difficulty_level

    # save json
    output_path = os.path.join(problem_path, "problem.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print(f"✅ JSON created at: {output_path}")


# =========================
# RUN
# =========================
build_json(path, difficulty)