import pandas as pd
import json

file_path = 'Kopie von Skill Scaling.xlsx'
xls = pd.ExcelFile(file_path)
data = {}
for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    data[sheet_name] = df.to_dict(orient='records')

with open('excel_output.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
print("Excel parsing complete. Output saved to excel_output.json")
