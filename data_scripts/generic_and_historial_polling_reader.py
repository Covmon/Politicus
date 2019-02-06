import sys
import pandas as pd
import numpy as np
import pickle
import requests
import json
import datetime
import glob
import os
from collections import OrderedDict

states = ['wa', 'wi', 'wv', 'fl', 'wy', 'nh', 'nj', 'nm', 'nc', 'nd', 'ne', 'ny', 'ri', 'nv', 'co', 'ca', 'ga', 'ct', 'ok', 'oh', 'ks', 'sc', 'ky', 'or', 'sd', 'de', 'hi', 'tx', 'la', 'tn', 'pa', 'va', 'ak', 'al', 'ar', 'vt', 'il', 'in', 'ia', 'az', 'id', 'me', 'md', 'ma', 'ut', 'mo', 'mn', 'mi', 'mt', 'ms']
dict_of_desired_informalities = {'United States Representative': [], 'Governor/ Lt. Governor': [], 'COMMISSIONER': [], 'UNITED STATES REPRESENTATIVE 1st DISTRICT': [], 'UNOPPOSED': [], 'COMMISSIONER OF AGRICULTURE': [], 'ATTORNEY GENERAL': [], 'REPRESENTATIVE 1st DISTRICT': [], 'U.S REPRESENTATIVE': [], 'U.S. House of Representatives': [], 'UNITED STATES REPRESENTATIVE 2nd DISTRICT': [], 'Governor & Lt Governor': [], 'Board of Education District 4': [], 'U.S. Senate': [], 'State Attorney': [], 'Senator': [], 'UNOPPOSED WYNNE': [], 'State Board of Education, Dist. 3': [], 'State Board of Education, Dist. 2': [], 'President of the United States': [], 'Secretary Of State': [], 'U.S. President/Vice President': [], 'State House of Representatives District 120': [], 'TAX COLLECTOR': [], 'Soil and Water Commissioner': [], 'IOWA SENATE': [], 'State Senator (Unexpired Term)': [], 'UNOPPOSED DEMOCRATIC CANDIDATES': [], 'Tennessee Senate': [], 'Unopposed Candidates': [], 'U.S. SENATOR': [], 'UNOPPOSED INDEPENDENT CANDIDATES': [], 'President/Vice President': [], 'Public Service Commission, District 2': [], 'STATE SENATOR': [], 'U.S. Senator Vacancy': [], 'COMPTROLLER GENERAL': [], 'UNOPPOSED CANDIDATES': [], 'State Supreme Court Justice Position 1': [], 'Commissioner': [], 'SECRETARY OF STATE': [], 'UNITED STATES REPRESENTATIVE': [], 'UNOPPOSED REPUBLICAN CANDIDATES': [], 'Comptroller': [], 'Congress 1': [], 'U.S. Senator': [], 'United States President': [], 'Governor': [], 'U.S. Congress District 2': [], 'State Senator': [], 'Commissioner Of Public Lands': [], 'U.S. Congress District 1': [], 'United States Senator': [], 'U.S. Congress District 4': [], 'U.S. House of Representatives District 3': [], 'U.S. House of Representatives District 2': [], 'GOVERNOR & LT. GOVERNOR': [], 'LIEUTENANT GOVERNOR': [], 'U.S. House of Representatives District 5': [], 'State Assembly': [], 'SPECIAL ELECTION, US Representative, Unexpired Term': [], 'REPRESENTATIVE 2nd DISTRICT': [], 'UNITED STATES PRESIDENT': [], 'STATE REPRESENTATIVE DISTRICT 51 - RECOUNT': [], 'Public Service Commission, District 5': [], 'State Representative (Pos. 1)': [], 'ADJUTANT GENERAL': [], 'Unopposed State Rep': [], 'U.S. REPRESENTATIVE 1st DISTRICT': [], 'All Unopposed Candidates': [], "Governor's Council": [], 'Secretary of State': [], 'Treasurer of State': [], 'SUPERINTENDENT OF SCHOOLS': [], 'Treasurer/Collector': [], 'U.S. Representative': [], 'Commissioner Of Labor': [], 'State Board Of Education - District 3': []}
state_abrv_to_name = {'WA': 'Washington', 'DE': 'Delaware', 'WI': 'Wisconsin', 'WV': 'West Virginia', 'HI': 'Hawaii', 'FL': 'Florida', 'WY': 'Wyoming', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'TX': 'Texas', 'LA': 'Louisiana', 'NC': 'North Carolina', 'ND': 'North Dakota', 'NE': 'Nebraska', 'TN': 'Tennessee', 'NY': 'New York', 'PA': 'Pennsylvania', 'AK': 'Alaska', 'NV': 'Nevada', 'VA': 'Virginia', 'CO': 'Colorado', 'CA': 'California', 'AL': 'Alabama', 'AR': 'Arkansas', 'VT': 'Vermont', 'IL': 'Illinois', 'GA': 'Georgia', 'IN': 'Indiana', 'IA': 'Iowa', 'MA': 'Massachusetts', 'AZ': 'Arizona', 'ID': 'Idaho', 'CT': 'Connecticut', 'ME': 'Maine', 'MD': 'Maryland', 'OK': 'Oklahoma', 'OH': 'Ohio', 'UT': 'Utah', 'MO': 'Missouri', 'MN': 'Minnesota', 'MI': 'Michigan', 'RI': 'Rhode Island', 'KS': 'Kansas', 'MT': 'Montana', 'MS': 'Mississippi', 'SC': 'South Carolina', 'KY': 'Kentucky', 'OR': 'Oregon', 'SD': 'South Dakota'}

#rcp avg
generic_rcp_polls = '/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_generic_ballot.csv'
df_generic_polls = pd.read_csv(generic_rcp_polls)

#df_generic_polls.loc[df_generic_polls.Year==2018,'Dem Actual'] = 53.3
#df_generic_polls.loc[df_generic_polls.Year==2018,'Rep Actual'] = 44.9

df_generic_polls = df_generic_polls[df_generic_polls.columns[~df_generic_polls.columns.str.contains('Unnamed:')]]
df_generic_polls.to_csv('/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_generic_ballot.csv')
df_generic_polls = df_generic_polls.loc[df_generic_polls.Year!='-']

df_generic_polls.loc['Mean'] = df_generic_polls.mean()
df_generic_polls.loc['Mean','Year'] = '-'
df_generic_polls.Year = df_generic_polls.Year.astype(str)
df_generic_polls.Year = df_generic_polls.Year.str.replace('.0','',regex=False)

df_generic_polls['(DEM - REP) Polling Avg'] = (df_generic_polls['Dem Polling Avg'] - df_generic_polls['Rep Polling Avg'])/float(100)
df_generic_polls['(DEM - REP) Polling Avg Adj.'] = (df_generic_polls['(DEM - REP) Polling Avg'] - df_generic_polls.loc[df_generic_polls.Year=='-','(DEM - REP) Polling Avg'].iloc[0])
df_generic_polls['(DEM - REP) Actual'] = (df_generic_polls['Dem Actual'] - df_generic_polls['Rep Actual'])/float(100)
df_generic_polls['(DEM - REP) Actual Avg Adj.'] = df_generic_polls['(DEM - REP) Actual'] - df_generic_polls.loc[df_generic_polls.Year=='-','(DEM - REP) Actual'].iloc[0]
df_generic_polls.to_csv('/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_generic_ballot.csv')

#governors

"""file_name_governors = '/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_governors_10-23.csv'
file_name_house = '/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_house_10-23.csv'
file_name_senate = '/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_senate_10-23.csv'

polling_df_governors = pd.read_csv(file_name_governors)

print polling_df_governors.columns

polling_df_governors['Race Name'] = polling_df_governors['Race Name'].str.rstrip(' Governor')

print polling_df_governors

for state in states:
	try:
		df_polling_state = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/polling_data/historical_polls/{}_historical_polls.csv'.format(state.upper()))
	except:
		pass
	else:	
		df_polling_state = df_polling_state.loc[df_polling_state.Year>2008]
		df_polling_state['State'] = state_abrv_to_name[state.upper()]
		for col_name in ['Cand 1 Party','Cand 2 Party','Cand 3 Party']:
			df_polling_state[col_name] = df_polling_state[col_name].astype(str)
			df_polling_state.loc[df_polling_state[col_name]=='L',col_name] = df_polling_state.loc[df_polling_state[col_name]=='L',col_name].str.replace('L', 'LIB')#, regex=False)
			df_polling_state.loc[df_polling_state[col_name]=='D',col_name] = df_polling_state.loc[df_polling_state[col_name]=='D',col_name].str.replace('D', 'DEM')#, regex=False)
			df_polling_state.loc[df_polling_state[col_name]=='R',col_name] = df_polling_state.loc[df_polling_state[col_name]=='R',col_name].str.replace('R', 'REP')#, regex=False)
			df_polling_state.loc[df_polling_state[col_name]=='I',col_name] = df_polling_state.loc[df_polling_state[col_name]=='I',col_name].str.replace('I', 'IND')#, regex=False)
		
		df_polling_state['District'] = 0
		df_polling_state['Race'] = df_polling_state['Race'].str.replace(state_abrv_to_name[state.upper()],'',regex=False).str.strip().str.strip('-')
		df_polling_state['Race'] = df_polling_state['Race'].str.replace('Race','',regex=False).str.strip().str.strip('-')
		df_polling_state['Race'] = df_polling_state['Race'].str.replace('Senate','Senator',regex=False)
		df_polling_state.loc[df_polling_state['Race'].str.contains('District'),'District'] = df_polling_state.loc[df_polling_state['Race'].str.contains('District')].Race.str.replace(' District','',regex=False).str.replace('th','',regex=False).str.replace('rd','',regex=False).str.replace('nd','',regex=False).str.replace('st','',regex=False)
		df_polling_state.loc[df_polling_state['Race'].str.contains('District'),'Race'] = 'U.S. Representative'
		df_polling_state.loc[df_polling_state['Race'].str.contains('At-Large'),'District'] = 1
		df_polling_state.loc[df_polling_state['Race'].str.contains('At-Large'),'Race'] = 'U.S. Representative'

		df_polling_state.set_index('State')
		df_polling_state = df_polling_state[['Year','Race', 'District', 'Cand 1', 'Cand 1 Party', 'Cand 1 Result', 'Cand 2', 'Cand 2 Party', 'Cand 2 Result', 'Cand 3', 'Cand 3 Party', 'Cand 3 Result']]

		df_polling_state.to_csv('/Users/sammahle/Desktop/election_projects/Politicus/polling_data/parsed_historical_polls/{}_historical_polls.csv'.format(state.upper()))"""
	
df_polling_state = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/polling_data/polls_governor_10-26.csv')
df_polling_state['Race Name'] = df_polling_state['Race Name'].str.replace(' Governor','',regex=False)
df_polling_state = df_polling_state.loc[df_polling_state['Race Name']=='Georgia']
df_polling_state.mean()['Result 1'] - df_polling_state.mean()['Result 2']

