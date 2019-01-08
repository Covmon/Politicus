import csv
import re

states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

statesToUse = ["MA"]

rows = [["State", "Position", "District", "Dem Projected", "Dem Actual", "Dem Probability", "Rep Projected", "Rep Actual", "Rep Probability", "Other Projected", "Other Actual", "Other Probability", "Rating", "Winner", "Correct", "Error"]]

for state in statesToUse:
    pathPredictions = "/Users/noahcovey/Documents/Development/Elections/Politicus/2018_Election_Races_Predictions/" + state + "_Races_Election_Predictions.csv"
    pathResults = "/Users/noahcovey/Documents/Development/Elections/Politicus/2018_Election_Races_Results/" + state + "_Races_Election_Results.csv"
    pathPredAndResults = "/Users/noahcovey/Documents/Development/Elections/Politicus/election_predictons_and_results_csv/2018/2018_Election_Races_Predictions_And_Results/" + state + "_Election_Races_Predictions_And_Results.csv"

    with open(pathPredAndResults, "r") as f:
        #predictionsReader = csv.reader(f)
        #resultsReader = csv.reader(f2)
        reader = csv.reader(f)

        lineNumber = 0
        lastDist = ""
        lastPos = ""

        currentRaceRow = ["","","","","","","","","","","",""]

        for predictionRow in reader:                        
            if lineNumber == 0:
                lineNumber += 1
                continue

            isNewRace = True

            state = predictionRow[0]
            position = predictionRow[2]
            district = predictionRow[3]
            party = predictionRow[5]

            print state, position, district, party

            projectedNum = re.sub("[^\d\.]", "", predictionRow[6])
            probabilityNum = re.sub("[^\d\.]", "", predictionRow[9])

            projected = round(float(projectedNum),2)
            actual = predictionRow[7]
            probability = probabilityNum

            if lastDist == district and lastPos == position:
                isNewRace = False

            if isNewRace and not lineNumber == 1:
                rows.append(currentRaceRow)
                currentRaceRow = ["","","","","","","","","","","",""]

            if isNewRace:
                currentRaceRow[0] = state
                currentRaceRow[1] = position
                currentRaceRow[2] = district

            startingIndex = 3
            if party == "REP":
                startingIndex = 6
            elif not party == "DEM":
                startingIndex = 9

            currentRaceRow[startingIndex] = projected
            currentRaceRow[startingIndex + 1] = actual
            currentRaceRow[startingIndex + 2] = probability
            
            lastDist = district
            lastPos = position

            lineNumber += 1

    fileName = "/Users/noahcovey/Documents/Development/Elections/Politicus/election_predictons_and_results_csv/2018/2018_Election_Results_Parsed/" + state + "_2018_Election_Results_Parsed.csv"
    with open(fileName, "w") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

