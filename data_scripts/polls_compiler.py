import csv

rowsWithoutRepeat = [["Race Name", "Candidate 1", "Result 1", "Candidate 2", "Result 2", "Candidate 3", "Result 3", "Pollster"]]

with open("polls_house_11-3_all.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        repeat = False
        for addedRow in rowsWithoutRepeat:
            if set(row) == set(addedRow):
                repeat = True
        
        if not repeat:
            rowsWithoutRepeat.append(row)

with open("polls_house_all.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerows(rowsWithoutRepeat)


