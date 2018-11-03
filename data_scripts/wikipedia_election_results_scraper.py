from bs4 import BeautifulSoup
import csv
import requests
import re

url = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2016"
url14 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2014"
url12 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2012"

fileName = "house_results_2014.csv"

get = requests.get(url14)
response = get.text
print("opened the url " + url14)

csvRows = [["State", "District", "Position", "Party", "Candidate", "Vote Share"]]

soup = BeautifulSoup(response, 'html.parser')
tables = soup.find_all("table", {"class": "wikitable sortable"})
print(len(tables))

for table in tables:

    body = table.find("tbody")
    if body == None:
        continue
    rows = body.find_all("tr")
    if rows == None:
        continue

    headers = rows[0].find_all("th")
    if len(headers) != 3:
        continue

    for i in range(2, len(rows)):
        row = rows[i]

        header = row.find("th")
        raceName = header.text.strip()

        data = row.find_all("td")
        if data == None:
            continue
        
        candidatesData = data[len(data) - 1].text

        if "at-large" in raceName:
            district = "At-Large"
            stateIndex = raceName.find("at-large")
            state = raceName[0:stateIndex - 1]
        else:
            indexNum = (re.search("\d", raceName)).start()
            state = raceName[0:indexNum - 1]

            district = raceName[indexNum:]

        candidates = candidatesData.split("[")
        for k in range(0, len(candidates)):
            
            cand = candidates[k]

            if "Write-ins" in cand or len(cand) < 10:
                continue
            
            print("candidate " + str(k) + " of election " + state + " " + district)
            print(cand)
            test = cand.split("(")

            if len(test) == 1:
                continue
            
            elif len(test) == 2:
                parenStart = cand.find("(")
                parenEnd = cand.find(")")
                party = cand[parenStart + 1: parenEnd]

                if "write-in" in party or "Write-in" in party or "Write-In" in party:
                    continue

                if k == 0:
                    candidateName = cand[2:parenStart - 1]
                    candidatePercent = cand[parenEnd + 2:]
                else:
                    parts = cand.split("]")
                    if len(parts) == 1:
                        candPart = parts[0]
                        candidateName = candPart[0: parenStart - 1]
                        candidatePercent = cand[parenEnd + 2:]
                    else:
                        candPart = parts[1]
                        parenStart = candPart.find("(")
                        candidateName = candPart[0: parenStart - 1]
                        candidatePercent = cand[parenEnd + 2:]
                #rows = [["State", "District", "Position", "Party", "Candidate", "Vote Share"]]
                row = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party.encode('utf-8'), candidateName.encode('utf-8'), candidatePercent.encode('utf-8')]
                csvRows.append(row)
            elif len(test) >= 4:
                cands = cand.split("%")

                cand1 = cands[0]
                cand2 = cands[1]
                cand3 = cands[2]

                parenStartCand1 = cand1.find("(")
                parenEndCand1 = cand1.find(")")
                parenStartCand2 = cand2.find("(")
                parenEndCand2 = cand2.find(")")
                parenStartCand3 = cand3.find("(")
                parenEndCand3 = cand3.find(")")

                candidateName1 = cand1[2:parenStartCand1 - 1]
                candidateName2 = cand2[0: parenStartCand2 - 1]
                candidateName3 = cand3[0:parenStartCand3 - 1]

                party1 = cand1[parenStartCand1 + 1:parenEndCand1]
                party2 = cand2[parenStartCand2 + 1:parenEndCand2]
                party3 = cand3[parenStartCand3 + 1:parenEndCand3]

                candidatePercent1 = cand1[parenEndCand1 + 2:] + "%"
                candidatePercent2 = cand2[parenEndCand2 + 2:] + "%"
                candidatePercent3 = cand3[parenEndCand3 + 2:] + "%"

                row1 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party1.encode('utf-8'), candidateName1.encode('utf-8'), candidatePercent1.encode('utf-8')]
                row2 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party2.encode('utf-8'), candidateName2.encode('utf-8'), candidatePercent2.encode('utf-8')]
                row3 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party3.encode('utf-8'), candidateName3.encode('utf-8'), candidatePercent3.encode('utf-8')]

                csvRows.append(row1)
                csvRows.append(row2)
                csvRows.append(row3)
            else:
                percentIndex = cand.find("%")
                if k == 0:
                    cand1 = cand[2:percentIndex]
                else:
                    cand1 = cand[0:percentIndex]
                cand2 = cand[percentIndex + 1:]

                parenStartCand1 = cand1.find("(")
                parenEndCand1 = cand1.find(")")
                parenStartCand2 = cand2.find("(")
                parenEndCand2 = cand2.find(")")

                party1 = cand1[parenStartCand1 + 1:parenEndCand1]
                party2 = cand2[parenStartCand2 + 1:parenEndCand2]

                candidateName1 = cand1[0:parenStartCand1 - 1]
                candidateName2 = cand2[0:parenStartCand2 - 1]

                candidatePercent1 = cand1[parenEndCand1 + 2:]
                candidatePercent2 = cand2[parenEndCand2 + 2:]

                row1 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party1.encode('utf-8'), candidateName1.encode('utf-8'), candidatePercent1.encode('utf-8')]
                row2 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party2.encode('utf-8'), candidateName2.encode('utf-8'), candidatePercent2.encode('utf-8')]

                csvRows.append(row1)
                csvRows.append(row2)

with open(fileName, "w") as f:
    writer = csv.writer(f)
    writer.writerows(csvRows)



