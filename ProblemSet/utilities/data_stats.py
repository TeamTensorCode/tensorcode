import pandas as pd
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt


path = r''

data = pd.read_csv(path)
def stat(data):
    
    print(data.columns)
    
    print(data.info())
    print(data.describe())

