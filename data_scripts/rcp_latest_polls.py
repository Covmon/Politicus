from bs4 import BeautifulSoup
import csv
import argparse
import requests

try:
    from urllib.request import urlopen
except ImportError:
    from urllib2 import urlopen

'''
parser = argparse.ArgumentParser()
parser.add_argument("url", nargs='+', help="The url of the polling data.")
parser.add_argument("--output", nargs="?", help="The output file name.")
args = parser.parse_args()'''

availableStates = ["Colorado", "Iowa", "Missouri", "New York", "South Carolina", "Tennessee", "Kansas", "Georgia", "Utah", "Michigan", "Idaho", "Minnesota"]


def start():
    #for pd in args.url:
    print("Starting a url")
    urlSenate = "https://www.realclearpolitics.com/epolls/latest_polls/senate/"
    urlGovernor = "https://www.realclearpolitics.com/epolls/latest_polls/governor/"
    urlHouse = "https://www.realclearpolitics.com/epolls/latest_polls/house/"
    url = urlGovernor

    fileName = "polls_governors_10-29.csv"

    get = requests.get(url)
    response = get.text
    print("Opened the url " + url)

    soup = BeautifulSoup(response, 'html.parser')
    print("Created the soup")

    tables = soup.find_all("div", {"class": 'table-races'})
    print("Found the data")

    rows = [["Race Name", "Candidate 1", "Result 1", "Candidate 2", "Result 2", "Candidate 3", "Result 3", "Pollster"]]

    for table in tables:
        print("Loop table")
        rows1 = table.find_all("tr", {"class": ""})
        rows2 = table.find_all("tr", {"class": "alt"})
        rowsToIterate = rows1 + rows2

        getElectionPoll(rows, rowsToIterate)
            

    #Race | Cand A | Cand B | Cand C | Pollster |  Poll Cand A | Poll Cand B | Poll Cand C  
    
    with open(fileName, "w") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    
    print("DONE")

def getElectionPoll(allRowsList, rowsToIterate):
    for row in rowsToIterate:
        if not row.find("td", {"class": "lp-race"}):
            continue
        raceTD = row.find("td", {"class": "lp-race"})
        race = raceTD.find("a").getText()
        pollTD = row.find("td", {"class": "lp-poll"})
        poll = pollTD.find("a").getText()
        resultsTD = row.find("td", {"class": "lp-results"})
        results = resultsTD.find("a").getText()
        
        indexDashRace = race.find("-") #15
        indexVsRace = race.find("vs.") #23

        inAvailableState = False
        for state in availableStates:
            if state in race:
                inAvailableState = True

        if not inAvailableState:
            continue


        if "Special Election" in race:
            indexSpecialElection = race.find("Special Election")
            raceName = race[0:indexSpecialElection - 1]
        elif "Generic Congressional" in race:
            continue
        elif "At-Large" in race:
            #Montana At-Large District - Gianforte vs. ...
            afterDash = race[indexDashRace + 1:]
            indexDashRace2 = afterDash.find("-")
            posDashRace2 = indexDashRace2 + indexDashRace
            raceName = race[0:posDashRace2]
            indexVsRace = indexVsRace - (len(race) - len(afterDash)) #39 - (50 - 39) = 39 - 11 = 28
            race = afterDash
            indexDashRace = indexDashRace2 + 1 #15
        else:
            raceName = race[0:indexDashRace - 1]


        #Montana At-Large District - Gianforte vs. Williams
        cand1 = race[indexDashRace + 1:indexVsRace - 1]
        cand2 = ""
        cand3 = ""

        otherCands = race[indexVsRace + 4:]
        if "vs." in otherCands:
            #Donnelly vs. Brenton
            indexVsRace2 = otherCands.find("vs.")
            cand2 = otherCands[0: indexVsRace2 - 1]
            cand3 = otherCands[indexVsRace2 + 4:]
        else:
            cand2 = race[indexVsRace + 4:] #28:end


        indexCommaResults = results.find(",")

        resultsA = results[indexCommaResults - 3:indexCommaResults]
        resultsB = ""
        resultsC = ""

        results1 = ""
        results2 = ""
        results3 = ""
        #Donnelly 41, Braun 40, Brenton 8
        #Braun 40, Brenton 8
        otherResults = results[indexCommaResults + 2:]
        if "," in otherResults:
            indexCommaResults2 = otherResults.find(",")
            resultsB = otherResults[indexCommaResults2 - 2: indexCommaResults2]
            resultsC = results[len(results) - 2:]

            indexCand1Results = results.find(cand1)
            indexCand2Results = results.find(cand2)
            indexCand3Results = results.find(cand3)

            if indexCand1Results < indexCand2Results and indexCand2Results < indexCand3Results:
                results1 = resultsA
                results2 = resultsB
                results3 = resultsC
            elif indexCand1Results < indexCand2Results and indexCand2Results > indexCand3Results and indexCand1Results < indexCand3Results:
                results1= resultsA
                results2 = resultsC
                results3 = resultsB
            elif indexCand1Results < indexCand2Results and indexCand2Results > indexCand3Results and indexCand1Results < indexCand3Results:
                results1= resultsC
                results2 = resultsA
                results3 = resultsB
            elif indexCand1Results > indexCand2Results and indexCand2Results > indexCand3Results:
                results1 = resultsC
                results2 = resultsB
                results3 = resultsA
            elif indexCand2Results < indexCand1Results and indexCand2Results < indexCand3Results and indexCand1Results < indexCand3Results:
                results1= resultsB
                results2 = resultsA
                results3 = resultsC
            elif indexCand2Results < indexCand1Results and indexCand2Results < indexCand3Results and indexCand1Results > indexCand3Results:
                results1= resultsB
                results2 = resultsC
                results3 = resultsA
        else:
            resultsB = results[len(results) - 2:]
            indexCand1Results = results.find(cand1)
            indexCand2Results = results.find(cand2)

            if indexCand1Results < indexCand2Results:
                results1 = resultsA
                results2 = resultsB
            else:
                results1 = resultsB
                results2 = resultsA
        
        newRow = [raceName, cand1, results1, cand2, results2, cand3, results3, poll]
        allRowsList.append(newRow)

start()