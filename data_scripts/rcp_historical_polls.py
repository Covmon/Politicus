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

stateLinks = ['https://www.realclearpolitics.com/epolls/2018/governor/ak/alaska_governor_dunleavy_vs_begich-6711.html', 'https://www.realclearpolitics.com/epolls/2018/senate/az/arizona_senate_mcsally_vs_sinema-6328.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ar/arkansas_governor_hutchinson_vs_henderson-6408.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ca/california_governor_cox_vs_newsom-6593.html', 'https://www.realclearpolitics.com/epolls/2018/governor/co/colorado_governor_stapleton_vs_polis-6409.html', 'https://www.realclearpolitics.com/epolls/2018/senate/ct/connecticut_senate_corey_vs_murphy-6262.html', 'https://www.realclearpolitics.com/epolls/2018/senate/de/delaware_senate_arlett_vs_carper-6639.html', 'https://www.realclearpolitics.com/epolls/2018/governor/fl/florida_governor_desantis_vs_gillum-6518.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ga/georgia_governor_kemp_vs_abrams-6628.html', 'https://www.realclearpolitics.com/epolls/2018/governor/hi/hawaii_governor_tupola_vs_ige-6412.html', 'https://www.realclearpolitics.com/epolls/2018/governor/il/illinois_governor_rauner_vs_pritzker-6439.html', 'https://www.realclearpolitics.com/epolls/2018/senate/in/indiana_senate_braun_vs_donnelly-6573.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ia/iowa_governor_reynolds_vs_hubbell-6477.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ks/kansas_governor_kobach_vs_kelly_vs_orman-6660.html', 'https://www.realclearpolitics.com/epolls/2018/house/ky/kentucky_6th_district_barr_vs_mcgrath-6497.html', 'https://www.realclearpolitics.com/epolls/2018/governor/me/maine_governor_moody_vs_mills-6643.html', 'https://www.realclearpolitics.com/epolls/2018/governor/md/maryland_governor_hogan_vs_jealous-6273.html', 'https://www.realclearpolitics.com/epolls/2018/senate/ma/massachusetts_senate_diehl_vs_warren-6581.html', 'https://www.realclearpolitics.com/epolls/2018/governor/mi/michigan_governor_schuette_vs_whitmer-6441.html', 'https://www.realclearpolitics.com/epolls/2018/governor/mn/minnesota_governor_johnson_vs_walz-6443.html', 'https://www.realclearpolitics.com/epolls/2018/senate/ms/mississippi_senate_wicker_vs_baria-6314.html', 'https://www.realclearpolitics.com/epolls/2018/senate/mo/missouri_senate_hawley_vs_mccaskill-6280.html', 'https://www.realclearpolitics.com/epolls/2018/senate/mt/montana_senate_rosendale_vs_tester-6306.html', 'https://www.realclearpolitics.com/epolls/2018/house/ne/nebraska_2nd_district_bacon_vs_eastman-6381.html', 'https://www.realclearpolitics.com/epolls/2018/governor/nv/nevada_governor_laxalt_vs_sisolak-6422.html', 'https://www.realclearpolitics.com/epolls/2018/governor/nh/new_hampshire_governor_sununu_vs_kelly-6561.html', 'https://www.realclearpolitics.com/epolls/2018/senate/nj/new_jersey_senate_hugin_vs_menendez-6506.html', 'https://www.realclearpolitics.com/epolls/2018/governor/nm/new_mexico_governor_pearce_vs_grisham-6440.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ny/new_york_governor_molinaro_vs_cuomo-6536.html', 'https://www.realclearpolitics.com/epolls/2018/house/nc/north_carolina_9th_district_harris_vs_mccready-6533.html', 'https://www.realclearpolitics.com/epolls/2018/senate/nd/north_dakota_senate_cramer_vs_heitkamp-6485.html', 'https://www.realclearpolitics.com/epolls/2018/governor/oh/ohio_governor_dewine_vs_cordray-6426.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ok/oklahoma_governor_stitt_vs_edmondson-6633.html', 'https://www.realclearpolitics.com/epolls/2018/governor/or/oregon_governor_buehler_vs_brown-6428.html', 'https://www.realclearpolitics.com/epolls/2018/governor/pa/pennsylvania_governor_wagner_vs_wolf-6542.html', 'https://www.realclearpolitics.com/epolls/2018/governor/ri/rhode_island_governor_fung_vs_raimondo_vs_trillo-6545.html', 'https://www.realclearpolitics.com/epolls/2018/governor/sc/south_carolina_governor_mcmaster_vs_smith-6431.html', 'https://www.realclearpolitics.com/epolls/2018/governor/sd/south_dakota_governor_noem_vs_sutton-6433.html', 'https://www.realclearpolitics.com/epolls/2018/governor/tx/texas_governor_abbott_vs_valdez-6435.html', 'https://www.realclearpolitics.com/epolls/2018/governor/vt/vermont_governor_scott_vs_hallquist-6657.html', 'https://www.realclearpolitics.com/epolls/2018/senate/va/virginia_senate_stewart_vs_kaine-6321.html', 'https://www.realclearpolitics.com/epolls/2018/senate/wa/washington_senate_hutchison_vs_cantwell-6645.html', 'https://www.realclearpolitics.com/epolls/2018/senate/wv/west_virginia_senate_morrisey_vs_manchin-6258.html', 'https://www.realclearpolitics.com/epolls/2018/governor/wi/wisconsin_governor_walker_vs_evers-6606.html']

def start():
    #for pd in args.url:
    url = stateLinks[0]
    state = "AK"

    fileName = state + "_historical_polls.csv"
    print("Starting a url " + url)

    get = requests.get(url)
    response = get.text
    print("Opened the url " + url)

    soup = BeautifulSoup(response, 'html.parser')

    snapshot = soup.find("div", {"id": "snapshot"})
    snapshotStr = str(snapshot)
    index = snapshotStr.find("PAST KEY RACES")
    snapshotStr = snapshotStr[index + 28:]

    snapshotSoup = BeautifulSoup(snapshotStr, 'html.parser')

    links = [a.get('href') for a in snapshotSoup.find_all('a', href=True)]
    print(links)

    rows = [["Race", "Year", "Cand 1", "Cand 1 Party", "Cand 1 Result", "Cand 2", "Cand 2 Party", "Cand 2 Result", "Cand 3", "Cand 3 Party", "Cand 3 Result"]]


    for link in links:
        if "president" in link or "Presidential" in link or "_04" in link or "2004" in link:
            continue
        elif "../../../.." in link:
            newLink = link[11:]
            urlAdjusted = "http://www.realclearpolitics.com" + newLink
            newRows = getPollingAverages(urlAdjusted)
            rows += newRows
        else:
            newRows = getPollingAverages(link)
            rows += newRows
        

    
    with open(fileName, "w") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    
    print("DONE")

def getPollingAverages(url):
    
    print("started the url " + url)
    get = requests.get(url)
    response = get.text
    print("Opened the url " + url)
    '''
    file = open("rcp_example.html", 'r')
    response = file.read()
    print("Opened file")
    '''

    year = "?"
    for y in ["2006", "2008", "2010", "2012", "2014", "2016"]:
        if y in url:
            year = y

    soup = BeautifulSoup(response, 'html.parser')

    numColumnsToDelete = 4
    pollingTableDivName = "polling-data-full"

    #Alaska At-Large District - Young vs. Dunbar vs. McDermott
    titleH2 = soup.find('h2', {"class": "page_title"})
    if titleH2 == None:
        titleH2 = soup.find('h2', {"id": "main-poll-title"})

    titleText = titleH2.text.strip()
    indexDashRace = titleText.find("-")
    if indexDashRace == -1:
        title = titleText
    else:
        title = titleText[0:indexDashRace-1]

    if "Large" in titleText:
        if "At" in title:
            title = title + "-Large"
        else:
            title = title + " At-Large"
    
    fp = soup.find("div", {"id": pollingTableDivName})
    rows = fp.find('table', {"class": 'data'})


    p = []
    rowNum = 0
    for row in rows:
        rowNum += 1
        if rowNum == 1:
            cols = row.find_all(['th', 'td'])

            if "MoE" not in str(cols):
                numColumnsToDelete = 3

            del cols[0:numColumnsToDelete]

            cand1 = cols[0].text.strip()
            cand2 = cols[1].text.strip()

            index1 = cand1.find("(")
            party1 = cand1[index1+1:index1+2]
            name1 = cand1[0: index1 - 1]
            if index1 == -1:
                party1 = "N/A"
                name1 = cand1

            index2 = cand2.find("(")
            party2 = cand2[index2+1:index2+2]
            name2 = cand2[0: index2 - 1]
            if index2 == -1:
                party2 = "N/A"
                name2 = cand2

            cand3 = ""
            party3 = ""
            name3 = ""

            if len(cols) == 4:
                cand3 = cols[2].text.strip()
                index3 = cand3.find("(")
                party3 = cand3[index3+1:index3+2]
                name3 = cand3[0: index3 - 1]
                if index3 == -1:
                    party3 = "N/A"
                    name3 = cand3

        elif rowNum != 2:
            cols = row.find_all(['th', 'td'])

            del cols[0:numColumnsToDelete]

            cand1 = cols[0].text.strip()
            cand2 = cols[1].text.strip()
            cand3 = ""

            if len(cols) == 4:
                cand3 = cols[2].text.strip()

            newRow = [title, year, name1, party1, cand1, name2, party2, cand2, name3, party3, cand3]
            p.append(newRow)
        else:
            continue
    
    return p
    '''
    #Election Cand 1 Poll 1 Cand 2 Poll 2
    with open("test.csv", "w") as f:
        writer = csv.writer(f)
        writer.writerows(p)
    '''
        

start()
#getPollingAverages("https://www.realclearpolitics.com/epolls/2016/senate/ut/utah_senate_lee_vs_snow-5986.html")







######
