from bs4 import BeautifulSoup
import csv
import requests
import re

url12 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2012"
url10 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2010"
url08 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2008"
url06 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2006"
url04 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2004"
url02 = "https://en.wikipedia.org/wiki/United_States_House_of_Representatives_elections,_2002"

fileName = "house_results_2002.csv"

get = requests.get(url02)
response = get.text
print("opened the url " + url02)

csvRows = [["State", "District", "Position", "Party", "Candidate", "Vote Share"]]

soup = BeautifulSoup(response, 'html.parser')
tables = soup.find_all("table", {"class": "wikitable"})
print(len(tables))

for table in tables:

    body = table.find("tbody")
    if body == None:
        continue
    rows = body.find_all("tr")
    if rows == None:
        continue

    headers = rows[0].find_all("th")
    if len(headers) != 6:
        continue

    for i in range(1, len(rows)):
        row = rows[i]

        data = row.find_all("td")
        if data == None:
            continue

        #Uncomment for years where there is a th in the race name
        '''
        header = row.find("th")
        if header == None:
            continue
        raceName = header.text.strip()
        '''

        #this is for 2012 and 2006 and 2004 and 2002, where there was no th for the race name:
        raceName = data[0].text.strip() 
        candidatesData = data[len(data) - 1].text

        if "at-large" in raceName:
            district = "At-Large"
            stateIndex = raceName.find("at-large")
            state = raceName[0:stateIndex - 1]
        elif "At-large" in raceName:
            district = "At-Large"
            stateIndex = raceName.find("At-large")
            state = raceName[0:stateIndex - 1]
        else:
            indexNumSearch = (re.search("\d", raceName))
            if indexNumSearch == None:
                continue
            indexNum = indexNumSearch.start()
            state = raceName[0:indexNum - 1]

            district = raceName[indexNum:]

        candidates = candidatesData.split("%")
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
                    candidateName = cand[0:parenStart - 1] #change the start to a 0 in 2014 and 2004 to acount for not having the check mark/square root sign
                    candidatePercent = cand[parenEnd + 2:]
                else:
                    candidateName = cand[0: parenStart - 1]
                    candidatePercent = cand[parenEnd + 2:]

                #rows = [["State", "District", "Position", "Party", "Candidate", "Vote Share"]]
                row = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party.encode('utf-8'), candidateName.encode('utf-8'), candidatePercent.encode('utf-8')]
                csvRows.append(row)
            '''
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

                candidatePercent1 = cand1[parenEndCand1 + 2:]
                candidatePercent2 = cand2[parenEndCand2 + 2:]
                candidatePercent3 = cand3[parenEndCand3 + 2:]

                row1 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party1.encode('utf-8'), candidateName1.encode('utf-8'), candidatePercent1.encode('utf-8')]
                row2 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party2.encode('utf-8'), candidateName2.encode('utf-8'), candidatePercent2.encode('utf-8')]
                row3 = [state.encode('utf-8'), district.encode('utf-8'), "U.S. Representative", party3.encode('utf-8'), candidateName3.encode('utf-8'), candidatePercent3.encode('utf-8')]

                csvRows.append(row1)
                csvRows.append(row2)
                csvRows.append(row3)
            '''
            '''
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
            '''

with open(fileName, "w") as f:
    writer = csv.writer(f)
    writer.writerows(csvRows)



