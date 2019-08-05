import json
import csv
from urllib2 import urlopen

def getJSONFromURL(url):
    response = urlopen(url)
    dataJSON = response.read()
    data = json.loads(dataJSON)
    return data

states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

#year = raw_input("Input Year - ")
#c-t-pt,c-t-eid,c-r-id,c-t-sts,c-t-ico
def writeCSV(file, s, y):
    url = "https://api.followthemoney.org/?dt=1&s=" + s + "&gro=c-t-id&y=" + y + "&APIKey=03c9486f133f22f6eb5638f0b2265782&mode=json"
    data = getJSONFromURL(url)

    statusName = "Election_Status"
    candidateName = "Candidate"

    if y == "2018":
        statusName = "Status_of_Candidate"
        url = "https://api.followthemoney.org/?dt=1&s=" + s + "&gro=c-t-pt,c-t-eid,c-r-id,c-t-sts,c-t-ico&y=" + y + "&APIKey=03c9486f133f22f6eb5638f0b2265782&mode=json"
        candidateName = "Career_Summary"

    pages = data["metaInfo"]["paging"]["totalPages"]

    writer = csv.writer(file)
    writer.writerow(["Candidate", "Party", "State", "Office", "Incumbency", "Result", "Total Money"])

    for page in range(0,pages):
        pageURL = url + "&p=" + str(page)
        pageData = getJSONFromURL(pageURL)
        
        records = pageData["records"]
        length = len(records)
        print("Length of records: " + str(length) + " on page: " + str(page))

        for record in records:
            number = record["record_id"]
            state = record["Election_Jurisdiction"]["Election_Jurisdiction"]
            office = record["Office_Sought"]["Office_Sought"]
            party = record["Specific_Party"]["Specific_Party"]
            name = record[candidateName][candidateName]
            status = record[statusName][statusName]
            incumbency = record["Incumbency_Status"]["Incumbency_Status"]
            totalMoney = record["Total_$"]["Total_$"]

            #number = number.replace(u'\xa0', u' ')
            state = state.replace(u'\xa0', u' ')
            office = office.replace(u'\xa0', u' ')
            party = party.replace(u'\xa0', u' ')
            name = name.replace(u'\xa0', u' ')
            status = status.replace(u'\xa0', u' ')
            incumbency = incumbency.replace(u'\xa0', u' ')
            #totalMoney = totalMoney.replace(u'\xa0', u' ')
            
            print("Record " + str(number))
            print("state: " + state + ", office: " + office + ", party: " + party + ", name: " + name + ", status: " + status + ", incumbency: " + incumbency + ", money: " + totalMoney)

            if status.lower() != "lost-primary" and party.lower() != "writein":
                writer.writerow([name, party, state, office, incumbency, status, totalMoney])

def money_data_reader(year):
    for state in states:
        fileName = "../fundraising_data/fundraising_data_" + str(year) + "/" + state + "_fundraising_data_" + str(year) + ".csv"
        with open(fileName, 'w') as csvf:
            writeCSV(csvf, state, str(year))

print("FINISHED")

