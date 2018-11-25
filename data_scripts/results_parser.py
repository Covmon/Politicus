import csv

states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

statesGA = ["GA"]

rows = [["State", "Position", "District", "Dem Projected", "Dem Actual", "Dem Probability", "Rep Projected", "Rep Actual", "Rep Probability", "Other Projected", "Other Actual", "Other Probability"]]

for state in states:
    pathPredictions = state + "_Races_Election_Predictions.csv"
    pathResults = state + "_Races_Election_Results"

    with open(pathPredictions, "r") as f, open(pathResults, "r") as f2:
        predictionsReader = csv.reader(f)
        resultsReader = csv.reader(f2)

        lineNumber = 0
        lastDist = ""
        lastPos = ""

        currentRaceRow = ["","","","","","","","","","","",""]

        for predictionRow in predictionsReader:                        
            if lineNumber == 0:
                lineNumber += 1
                continue

            correspondingResultsRow = []         

            isNewRace = True

            state = predictionRow[1]
            position = predictionRow[3]
            district = predictionRow[4]
            party = predictionRow[6]

            for resultsRow in resultsReader:
                if resultsRow[1] == state and resultsRow[3] == position and resultsRow[4] == district and resultsRow[6] == party:
                    correspondingResultsRow = resultsRow
                    break

            projected = round(float(predictionRow[7]),2)
            actual = correspondingResultsRow[7]
            probability = predictionRow[8]

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

    fileName = state + "_2018_Election_Results_Parsed"
    with open(fileName, "w") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

