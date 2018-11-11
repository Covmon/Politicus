import csv

states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

rows = [["State", "Position", "District", "Dem Projected", "Dem Actual", "Dem Probability", "Rep Projected", "Rep Actual", "Rep Probability", "Rating"]]

for state in states:
    path = state + "_Races_Election_Predictions.csv"

    with open(path, "r") as f:
        reader = csv.reader(f)
        lineNumber = 0
        for row in reader:
            if lineNumber == 0:
                continue
            
            state = row[1]
            position = row[3]
            district = row[4]

            lineNumber += 1
