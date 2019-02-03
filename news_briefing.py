#news briefer to write stories
import pandas as pd
import numpy as np
import pickle
import requests
import json
from datetime import datetime
import datetime
import glob
import os
from collections import OrderedDict, Counter
import operator
from itertools import groupby
import sys

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV, LassoLarsCV
from sklearn.svm import LinearSVR
from sklearn.decomposition import PCA
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

sys.path.insert(0, '/Users/sammahle/Desktop/election_projects/open_election_investigation/finding_elections')
from finding_years_of_elections import election_finder

desired_positions_dict = {'u.s. representative': 'us_rep','state senator': 'state_sen','state representative': 'state_rep'}
state_abrv_to_name = {'WA': 'Washington', 'DE': 'Delaware', 'WI': 'Wisconsin', 'WV': 'West Virginia', 'HI': 'Hawaii', 'FL': 'Florida', 'WY': 'Wyoming', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'TX': 'Texas', 'LA': 'Louisiana', 'NC': 'North Carolina', 'ND': 'North Dakota', 'NE': 'Nebraska', 'TN': 'Tennessee', 'NY': 'New York', 'PA': 'Pennsylvania', 'AK': 'Alaska', 'NV': 'Nevada', 'VA': 'Virginia', 'CO': 'Colorado', 'CA': 'California', 'AL': 'Alabama', 'AR': 'Arkansas', 'VT': 'Vermont', 'IL': 'Illinois', 'GA': 'Georgia', 'IN': 'Indiana', 'IA': 'Iowa', 'MA': 'Massachusetts', 'AZ': 'Arizona', 'ID': 'Idaho', 'CT': 'Connecticut', 'ME': 'Maine', 'MD': 'Maryland', 'OK': 'Oklahoma', 'OH': 'Ohio', 'UT': 'Utah', 'MO': 'Missouri', 'MN': 'Minnesota', 'MI': 'Michigan', 'RI': 'Rhode Island', 'KS': 'Kansas', 'MT': 'Montana', 'MS': 'Mississippi', 'SC': 'South Carolina', 'KY': 'Kentucky', 'OR': 'Oregon', 'SD': 'South Dakota'}
number_to_word_dict = {1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine'}
number_to_ith_dict = {1:'first',2:'second',3:'third',4:'fourth',5:'fifth',6:'sixth',7:'seventh',8:'eighth',9:'ninth'}

#official_position_names_dict = {'us_rep':'U.S. Representative','state_sen':'State Senator','state_rep':'State Representative','secretary of state':'Secretary Of State'}
datetime1 = datetime.datetime.now()

def first_tuesday_after_first_tuesday_if_first_tuesday_is_first_of_november_finder(year):
	#return the data of election tuesday as a string for open election files
	year = int(year)
	if datetime.date(year, 11, 1).weekday() != 0:
		days_until_first_tuesday_after_first_tuesday_if_first_tuesday_is_first = 8 - datetime.date(year, 11, 1).weekday() 
	else: #if day is a monday
		days_until_first_tuesday_after_first_tuesday_if_first_tuesday_is_first = 1 - datetime.date(year, 11, 1).weekday() 
	return str(datetime.date(year, 11, 1) + datetime.timedelta(days_until_first_tuesday_after_first_tuesday_if_first_tuesday_is_first)).replace('-','')


def RepresentsInt(s):
	if type(s) == list:
		return False
	else:	
	    try: 
	        int(s)
	        return True
	    except ValueError:
	        return False	

def RepresentssInt(s):
	if type(s) == list:
		return False
	else:	
	    try: 
	        int(float(s))
	        return str(int(float(s)))
	    except ValueError:
	        return s			

def news_briefer(position_name,state,year):
	desired_positions_dict = {'U.S. Representative': 'us_rep','State Senator': 'state_sen','State Representative': 'state_rep'}

	df_state_elec_data = pd.read_csv('../open_election_investigation/statewide_election_general_data.csv')
	df_state_elec_data = df_state_elec_data.loc[df_state_elec_data['Unnamed: 0']==state_abrv_to_name[state.upper()],:]
	us_rep_seats = df_state_elec_data['Number of U.S. Representatives']
	state_rep_seats = df_state_elec_data['Size of Lower Chamber']
	state_sen_seats = df_state_elec_data['Size of Upper Chamber']
	state_house_name = df_state_elec_data['Name of Lower Chamber']
	state_sen_name = df_state_elec_data['Name of Upper Chamber']
	state_rep_seats_maj = df_state_elec_data['State House Seats Needed for Majority']
	state_rep_seats_smaj = df_state_elec_data['State House Seats Needed for Supermajority']
	state_sen_seats_maj = df_state_elec_data['State Senate Seats Needed for Majority']
	state_sen_seats_smaj = df_state_elec_data['State Senate Seats Needed for Supermajority']
	state_rep_term_length = df_state_elec_data['State Representative Term Length']
	state_sen_term_length = df_state_elec_data['State Senator Term Length']
	
	term_length = state_rep_term_length
	if position_name == 'State Senator':
		term_length = int(state_sen_term_length)
	last_election = int(year-int(term_length))

	#df_election_data_features = pd.read_csv('/Users/sammahle/Downloads/Politicus-master/fundraising_data1/fundraising_data_{}/{}_fundraising_data_{}.csv'.format(year,state.upper(),year))
	#df_election_data_features = df_election_data_features.loc[df_election_data_features.result.str.contains('Pending')]

	df_election_data_features = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/pending_elections/{}_pending_elections.csv'.format(state.upper()))

	df_election_data_features = df_election_data_features.loc[df_election_data_features.office==position_name]
	df_election_data_features.insert(loc=0,column='year',value=year)
	df_election_data_features = df_election_data_features[['state','year','office','district','candidate','party', 'incumbency','total money']]

	"""df_more_features = pd.read_csv('/Users/sammahle/Desktop/election_projects/open_election_investigation/EML_NO_DD/{}/{}.csv'.format(state.upper(),desired_positions_dict[position_name]))
	df_more_features.rename(columns={'District':'district'},inplace=True)
	df_more_features.replace('(X)',np.NaN, inplace=True)
	df_more_features.replace('-',np.NaN, inplace=True)
	df_more_features.replace('*****',np.NaN, inplace=True)
	df_more_features = df_more_features.loc[df_more_features.state==state_abrv_to_name[state.upper()]]
	df_more_features.district = df_more_features.district.astype(str)"""
	df_election_data_features.district = df_election_data_features.district.astype(str)
	df_election_data_features.district = df_election_data_features.district.str.replace('.0','',regex=False)
	df_election_data_features_pos = df_election_data_features.loc[df_election_data_features.office==position_name]
	
	df_election_data_features_old = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/fundraising_data_parsed/fundraising_data_{}/{}_fundraising_data_{}.csv'.format(str(int(year-term_length)),state.upper(),str(int(year-term_length))))
	df_election_data_features_old = df_election_data_features_old.loc[df_election_data_features_old.result.str.contains('General')]
	df_election_data_features_old = df_election_data_features_old.loc[df_election_data_features_old.office==position_name]
	df_election_data_features_old.insert(loc=0,column='year',value=str(int(year-term_length)))
	#df_election_data_features_old = df_election_data_features_old[['state','year','office','district','candidate','party', 'incumbency','total money']]
	df_election_data_features_old.district = df_election_data_features_old.district.astype(str)
	df_election_data_features_old.district = df_election_data_features_old.district.str.replace('.0','',regex=False)
	df_election_data_features_old_pos = df_election_data_features_old.loc[df_election_data_features_old.office==position_name]

	df_current_legislators = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/current_legislators/{}/{}_current_legislators.csv'.format(year,state.upper()))
	df_current_legislators_pos = df_current_legislators.loc[df_current_legislators.Position==position_name]
	df_current_legislators_pos.District = df_current_legislators_pos.District.astype(str)
	df_current_legislators_pos.District = df_current_legislators_pos.District.str.replace('.0','',regex=False)
	df_current_legislators_after_last = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/current_legislators/{}/{}_current_legislators.csv'.format(2017,state.upper()))
	df_current_legislators_after_last_pos = df_current_legislators_after_last.loc[df_current_legislators_after_last.Position==position_name]
	df_current_legislators_after_last_pos.District = df_current_legislators_after_last_pos.District.astype(str)
	df_current_legislators_after_last_pos.District = df_current_legislators_after_last_pos.District.str.replace('.0','',regex=False)
	df_current_legislators_before_last = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/current_legislators/{}/{}_current_legislators.csv'.format(2016,state.upper()))
	df_current_legislators_before_last_pos = df_current_legislators_before_last.loc[df_current_legislators_before_last.Position==position_name]
	df_current_legislators_before_last_pos.District = df_current_legislators_before_last_pos.District.astype(str)
	df_current_legislators_before_last_pos.District = df_current_legislators_before_last_pos.District.str.replace('.0','',regex=False)

	#first load election predictions
	df_election_predictions = pd.read_csv('/Users/sammahle/Desktop/election_projects/Politicus/election_predictons_and_results_csv/{}/{}_Election_Races_Predictions/{}_Races_Election_Predictions.csv'.format(year,year,state.upper()))
	print df_election_predictions
	df_election_predictions = df_election_predictions.loc[df_election_predictions.Position==position_name]
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].str.replace('>', '')
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].str.replace('<', '')	
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].astype(float)*.01
	df_election_predictions = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']>.005)&(df_election_predictions['Predicted Win Probability']<.995)]
	try:
		df_election_predictions.District.astype(float)
	except:
		pass
	else:
		df_election_predictions.District = df_election_predictions.District.astype(float)
		df_election_predictions.District = df_election_predictions.District.astype(int)
		df_election_predictions.sort_values(by=['District'],inplace=True)
		df_election_predictions.District = df_election_predictions.District.astype(str)

	df_election_predictions_competitive = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']>.05)&(df_election_predictions['Predicted Win Probability']<.95)]
	df_election_predictions_mildly_competitive = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']<.05)|(df_election_predictions['Predicted Win Probability']>.95)]

	expected_dem_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&(df_election_predictions.Party=='DEM')]['Predicted Win Probability']/10000).sum()
	expected_rep_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&(df_election_predictions.Party=='REP')]['Predicted Win Probability']/10000).sum()
	expected_other_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&((df_election_predictions.Party!='DEM')&(df_election_predictions.Party!='REP'))]['Predicted Win Probability']/10000).sum()

	current_seats = {'DEM':0,'REP':0,'IND':0}
	current_seats['DEM'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='DEM'])
	current_seats['REP'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='REP'])
	current_seats['IND'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='IND'])	

	former_seats = {'DEM':0,'REP':0,'IND':0}
	former_seats['DEM'] = len(df_current_legislators_before_last_pos.loc[df_current_legislators_before_last_pos.Party=='DEM'])
	former_seats['REP'] = len(df_current_legislators_before_last_pos.loc[df_current_legislators_before_last_pos.Party=='REP'])
	former_seats['IND'] = len(df_current_legislators_before_last_pos.loc[df_current_legislators_before_last_pos.Party=='IND'])	

	if position_name == 'State Senator':
		total_seats,seats_up_for_election,seats_needed_for_maj,seats_needed_for_smaj,body_name,term_length = int(state_sen_seats.iloc[0]), len(df_election_predictions.loc[df_election_predictions.Position==position_name].District.unique()),int(state_sen_seats_maj.iloc[0]), int(state_sen_seats_smaj.iloc[0]), state_sen_name.iloc[0], state_sen_term_length
	elif position_name == 'State Representative':
		total_seats,seats_up_for_election,seats_needed_for_maj,seats_needed_for_smaj,body_name,term_length = int(state_rep_seats.iloc[0]), len(df_election_predictions.loc[df_election_predictions.Position==position_name].District.unique()),int(state_rep_seats_maj.iloc[0]), int(state_rep_seats_smaj.iloc[0]), state_house_name.iloc[0], state_rep_term_length

	if seats_up_for_election < total_seats:
		current_safe_seats = {'DEM':0,'REP':0,'IND':0}							
		df_current_legislators_not_running = df_current_legislators.loc[df_current_legislators['Next Election']!=2018]
		current_safe_seats['DEM'] = len(df_current_legislators_not_running.loc[df_current_legislators_not_running.Party=='DEM'])
		current_safe_seats['REP'] = len(df_current_legislators_not_running.loc[df_current_legislators_not_running.Party=='REP'])
		current_safe_seats['IND'] = len(df_current_legislators_not_running.loc[df_current_legislators_not_running.Party=='IND'])		
		seats_needed_for_rep_maj,seats_needed_for_dem_maj,seats_needed_for_other_maj = seats_needed_for_maj-current_safe_seats['REP'],seats_needed_for_maj-current_safe_seats['DEM'],seats_needed_for_maj-current_safe_seats['IND']
		seats_needed_for_rep_smaj,seats_needed_for_dem_smaj,seats_needed_for_other_smaj = seats_needed_for_smaj-current_safe_seats['REP'],seats_needed_for_smaj-current_safe_seats['DEM'],seats_needed_for_smaj-current_safe_seats['IND']
	else:
		current_safe_seats = {'DEM':0,'REP':0,'IND':0}
		seats_needed_for_rep_maj,seats_needed_for_dem_maj,seats_needed_for_other_maj = seats_needed_for_maj,seats_needed_for_maj,seats_needed_for_maj
		seats_needed_for_rep_smaj,seats_needed_for_dem_smaj,seats_needed_for_other_smaj = seats_needed_for_smaj,seats_needed_for_smaj,seats_needed_for_smaj

	#couldn't I just get a bunch of this INFO from BODIES AND CURRENT LEGISLATORS
	df_current_legislators_after_last_pos_dict = df_current_legislators_after_last_pos.to_dict()
	df_current_legislators_before_last_pos_dict = df_current_legislators_before_last_pos.to_dict()
	flipped_districts = []

	for x,y in zip(df_current_legislators_after_last_pos_dict['Party'],df_current_legislators_after_last_pos_dict['Party']):
		#print df_current_legislators_after_last_pos_dict['Party'][x], df_current_legislators_before_last_pos_dict['Party'][y]
		if df_current_legislators_after_last_pos_dict['Party'][x] != df_current_legislators_before_last_pos_dict['Party'][y]:
			flipped_districts.append(df_current_legislators_after_last_pos_dict['District'][x])

	seats_gained_last_election = {'DEM':0,'REP':0}
	for key,value in df_current_legislators_after_last_pos.loc[df_current_legislators_after_last_pos.District.isin(flipped_districts)]['Party'].value_counts().to_dict().iteritems():
		seats_gained_last_election[key] = value

	party_winner_last_election = max(seats_gained_last_election.items(), key = lambda x: x[1])[0]
	num_net_seats_party_winner_last_election = seats_gained_last_election[party_winner_last_election]-(sum(seats_gained_last_election.values())-seats_gained_last_election[party_winner_last_election])

	election_predictions_competitive_districts = []
	for district in sorted(df_election_predictions_competitive.District.unique()):
		election_predictions_competitive_districts.append(district)

	controlling_party = max(current_seats.items(), key = lambda x: x[1])[0]
	other_party = ['DEM','REP']
	other_party.remove(controlling_party)
	other_party = other_party[0]
	former_majority_or_supermajority = 'majority'
	majority_or_supermajority = 'majority'
	if former_seats[controlling_party] > seats_needed_for_smaj:
		former_majority_or_supermajority = 'supermajority'
	if current_seats[controlling_party] > seats_needed_for_smaj:
		majority_or_supermajority = 'supermajority'
	cut_into_or_improve = 'cut into'
	if current_seats[controlling_party] == party_winner_last_election:
		cut_into_or_improve = 'improve'

	full_statement = ''

	raise ValueError('l')

	def special_elections_statement_function():

		special_seats_not_flipped = {}
		special_seats_flipped = {}

		for district in df_current_legislators_pos.loc[df_current_legislators_pos['Year Elected']>last_election].District.unique():
			incumbent_name = df_current_legislators_after_last_pos.loc[df_current_legislators_after_last_pos.District==district]['Candidate'].iloc[0]
			current_name = df_current_legislators_pos.loc[df_current_legislators_pos.District==district]['Candidate'].iloc[0]
			current_year_elected = df_current_legislators_pos.loc[df_current_legislators_pos.District==district]['Year Elected'].iloc[0]
			incumbent_party = df_current_legislators_after_last_pos.loc[df_current_legislators_after_last_pos.District==district]['Party'].iloc[0]
			current_party = df_current_legislators_pos.loc[df_current_legislators_pos.District==district]['Party'].iloc[0]
			df_defeated_special_name = pd.read_csv('/Users/sammahle/Downloads/Politicus-master/fundraising_data1/fundraising_data_{}/{}_fundraising_data_{}.csv'.format(current_year_elected,state.upper(),current_year_elected))
			df_defeated_special_name = df_defeated_special_name.loc[(df_defeated_special_name.district==int(district))&(df_defeated_special_name.office==position_name)]
			df_defeated_special_name_runoff = df_defeated_special_name.loc[(df_defeated_special_name.result.str.contains('Runoff'))&(df_defeated_special_name.result.str.contains('Lost'))]
			if df_defeated_special_name_runoff.empty == False:
				defeated_special_name = df_defeated_special_name_runoff['candidate'].iloc[0]
			elif df_defeated_special_name.loc[(df_defeated_special_name.result.str.contains('General'))&(df_defeated_special_name.result.str.contains('Lost'))].empty != False:
				defeated_special_name = df_defeated_special_name.loc[(df_defeated_special_name.result.str.contains('General'))&(df_defeated_special_name.result.str.contains('Lost'))]['candidate'].iloc[0]
			else:
				defeated_special_name = ''

			if incumbent_party == current_party:
				if current_party in special_seats_not_flipped.keys():
					special_seats_not_flipped[current_party] = special_seats_not_flipped[current_party].append(district)
				else:
					special_seats_not_flipped[current_party] = district
			else:
				special_seats_flipped[district] = [incumbent_name,incumbent_party,current_party,current_name,defeated_special_name]
			
		special_elections_statement = ''
		if any(special_seats_not_flipped.keys()) or any(special_seats_flipped.keys()):
			has_or_have,plural_or_not = 'have','s'
			if (len(special_seats_not_flipped.keys())+len(special_seats_flipped.keys())) == 1:
				has_or_have,plural_or_not = 'has',''

			special_elections_statement = ' Since then, there {} been {} special election{} in the {} {}.'.format(has_or_have,number_to_word_dict[len(special_seats_not_flipped.values())+len(special_seats_flipped.keys())],plural_or_not,state,body_name)

		party_and_seats = dict(Counter(dict([(i, len(list(c))) for i,c in groupby(sorted([x[2] for x in special_seats_flipped.values()]))]))-Counter(dict([(i, len(list(c))) for i,c in groupby(sorted([x[1] for x in special_seats_flipped.values()]))])))

		if any(party_and_seats) == False:
			special_elections_opening_statement = ' Though there has been no change in partisan control, as '
			special_elections_final_statement = ''
			special_elections_final_final_statement = ''
		else:
			special_elections_opening_statement = ' While the '
			special_elections_final_statement = ', the {} picked up {} seat{} by flipping '.format(party_and_seats.keys()[0],number_to_word_dict[party_and_seats.values()[0]],plural_or_not)
			special_elections_final_final_statement = ''

		special_statement = ''
		party_statements = []
		for party in special_seats_not_flipped.keys():
			party_statement = 'the {} held District'.format(party)
			if type(special_seats_not_flipped[party]) == str:
				district_statement = ' {}'.format(special_seats_not_flipped[party])
			else:
				for district in special_seats_not_flipped[party]:
					district_statement = ' {}'.format(district)
			party_statement = party_statement + district_statement
			party_statements.append(party_statement)
		special_statement = ' and '.join(party_statements)

		if any(special_seats_flipped):
			district_statements = []
			for district in special_seats_flipped.keys():
				district_statement = 'District {} as {} {} defeated {} to replace {} {}.'.format(district,special_seats_flipped[district][2],special_seats_flipped[district][3],special_seats_flipped[district][4],special_seats_flipped[district][1],special_seats_flipped[district][0])
				district_statements.append(district_statement)
			district_statements = ' and'.join(district_statements)
			special_elections_final_final_statement = special_elections_final_final_statement + district_statements

		if any(special_statement) or any(special_elections_final_statement) or any(special_elections_final_final_statement):
			special_elections_statement = special_elections_opening_statement + special_statement + special_elections_final_statement + special_elections_final_final_statement
		else:	
			special_elections_statement = ' There have been no special elections in the {} {} since {}.'.format(state_abrv_to_name[state],body_name,int(year)-int(term_length))
		return special_elections_statement

	special_elections_statement = special_elections_statement_function()	

	if num_net_seats_party_winner_last_election == 0:
		num_net_seats_party_winner_last_election = 'neither party picked up seats as the {} held their '.format(controlling_party)
	elif num_net_seats_party_winner_last_election == 1:
		num_net_seats_party_winner_last_election = 'the {} party picked up one net seat to {} their '.format(party_winner_last_election,cut_into_or_improve)
	else:
		num_net_seats_party_winner_last_election = 'the {} party gained {} overall net seats to {} their '.format(party_winner_last_election,num_net_seats_party_winner_last_election,cut_into_or_improve) 

	opening_statement = 'Going into the 2018 Election, the {} Party holds a {}-{} lead in the {} {}. During the 2016 Election Cycle, the {}{}. In {} election the following seats were flipped: {}.{}\n'.format(controlling_party, current_seats[controlling_party], current_seats[other_party], state_abrv_to_name[state],body_name, num_net_seats_party_winner_last_election,former_majority_or_supermajority, year-int(term_length),', '.join(flipped_districts), special_elections_statement)
	#competitive_elections = 'We have identified the following elections as competitive - {}'.format('and'.join(election_predictions_competitive_districts))
	
	district_statements = ''
	for election in election_predictions_competitive_districts:
		df_current_legislators_pos_dis = df_current_legislators_pos.loc[df_current_legislators_pos.District==election]
		df_election_predictions_dis = df_election_predictions_competitive.loc[df_election_predictions_competitive.District==election]
		df_election_data_features_pos_dis = df_election_data_features_pos.loc[df_election_data_features_pos.district==election]
		df_election_data_features_old_pos_dis = df_election_data_features_old_pos.loc[df_election_data_features_old_pos.district==election]
		incumbent_name = df_current_legislators_pos_dis['Candidate'].iloc[0]
		incumbent_last_name = df_current_legislators_pos_dis['Candidate'].iloc[0].split()[-1]
		incumbent_finding_names = [x for name in list(df_election_predictions_dis.Candidate.unique()) for x in name.split()]
		#[words for segments in a for words in segments.split()]
		if incumbent_last_name in incumbent_finding_names:
			incumbent_running = 'is'
		else:
			incumbent_running = 'is not'
		term_in_seat = df_current_legislators_pos_dis['Number of Terms in Position'].iloc[0]
		can_winner = df_election_data_features_old_pos_dis.loc[df_election_data_features_old_pos_dis.result.str.contains('Won')]['candidate'].iloc[0]
		can_loser_list = []
		for can_loser in df_election_data_features_old_pos_dis.loc[df_election_data_features_old_pos_dis.result.str.contains('Lost')]['candidate'].tolist():
			can_loser_list.append(can_loser)
		can_loser_filler =  'defeated ' + ' and '.join(can_loser_list) + ' to win'
		if any(can_loser_list) == False:
			can_loser_filler = 'ran unopposed winning'

		candidate1 = "Candidate 1"
		candidate2 = "Candidate 2"
		winningCandidatae = "Winning Candidate"
		winningCandidateVoteShare = "76"
		winningCandidateProbability = "65%"
		losingCandidate = "Losing Candidate"
		losingCandidateVoteShare = "24"

		district_statement = 'District {} - Currently this seat is held by {}, who {} running for reelection in 2018. In {}, {} {} his or her {} term in this seat. In the upcoming midterm, election, {} will face {}. We project {} to win with {} percent of the vote, with {} probability, with opponent {} receieving {} percent of the vote.\n'.format(election,incumbent_name,incumbent_running,str(int(year-int(term_length))),can_winner,can_loser_filler,number_to_ith_dict[term_in_seat],candidate1,candidate2,winningCandidatae,winningCandidateVoteShare,winningCandidateProbability,losingCandidate,losingCandidateVoteShare) #(insert about challengers if opposing party in here) In this year"s Democratic primary, {} defeated {} and {} or x amount of challengers and in the Republican Primary .... Our past election results have this district classified as a {} {}, but/and we have this race projected as a {} with {} defeating {} by an averaging margin of {} points, but/and since this is a {} we would be {} suprised to see {} win.'.format()
		district_statements = district_statements + district_statement

	election_predictions_semi_competitive_districts = []
	election_predictions_semi_competitive_statement = []
	for district in df_election_predictions_mildly_competitive.District.unique():
		incumbent_name = df_current_legislators_pos.loc[df_current_legislators_pos.District==district]['Candidate'].iloc[0]
		district_statement = 'District {} - '.format(district)
		first_can = True
		for can in df_election_predictions_mildly_competitive.loc[df_election_predictions_mildly_competitive.District==district]['Candidate'].unique():
			incumbent_filler = ''
			can_vote_share = round(df_election_predictions_mildly_competitive.loc[df_election_predictions_mildly_competitive.Candidate==can]['Predicted Vote Share'].unique(),3)*100
			print district
			print can, incumbent_name
			party = "Party"
			if can == incumbent_name:
				incumbent_filler = ' (i)'
			can_statement = '{}{}, {} ({}%)'.format(can,incumbent_filler,party,can_vote_share)
			if first_can == False:
				can_statement = ' vs. {}{}, {} ({}%)'.format(can,incumbent_filler,party,can_vote_share)
			district_statement = district_statement + can_statement
			first_can = False

		election_predictions_competitive_districts.append('{}'.format(district))
		election_predictions_semi_competitive_statement.append(district_statement)

	semi_competitive_elections = 'We have identified the following elections as semi-competitive - {}'.format('and'.join(df_election_predictions_mildly_competitive))
	election_predictions_semi_competitive_statement = '\n'.join(election_predictions_semi_competitive_statement)


	mydate = datetime.datetime.now()
	article_title,author,date = '{} {} Preview\n'.format(state_abrv_to_name[state],body_name), 'Sam Mahle\n', str(mydate.strftime("%B")) + ' ' + str(mydate.strftime("%d")).lstrip('0') + ', ' + str(mydate.strftime("%Y")) + '\n\n'
	preview = article_title + author + date

	full_statement =  preview + opening_statement + '\n<b>Competitive Seats</b>\n\n' + district_statements + '\n<b>Semi-Competitive Seats</b>\n\n' + election_predictions_semi_competitive_statement
	full_statement = full_statement.replace('REP', 'Republican')
	full_statement = full_statement.replace('DEM', 'Democrat')
	full_statement = full_statement.replace('the Republican', 'the Republicans')
	full_statement = full_statement.replace('the Democrat', 'the Democrats')
	full_statement = full_statement.replace('Republicans Party', 'Republican Party')
	full_statement = full_statement.replace('Democrats Party', 'Democratic Party')

	if position_name == 'State Senator':
		position_filler = 'State_Senator'
	elif position_name == 'State Representative':
		position_filler = 'State_Representative'

	if not os.path.exists('/Users/sammahle/Desktop/election_projects/Politicus/news_articles/{}/{}'.format(year, state, state, position_filler)):
	    os.makedirs('/Users/sammahle/Desktop/election_projects/Politicus/news_articles/{}/{}'.format(year, state, state, position_filler))

	with open('/Users/sammahle/Desktop/election_projects/Politicus/news_articles/{}/{}/{}_{}.txt'.format(year, state, state, position_filler),'w') as f:
		f.write(full_statement)



news_briefer('State Representative','GA',2019)


"""#Going into the 2018 Election, the REP Party holds a 118-62 lead in the Georgia House of Representatives. During the 2016 Election Cycle, the DEM picked up 1 overall seats to cut into their majority. In this election the following seats were flipped: 101, 138, 145.
competitive
Currently this seat is held by George Samuel Brockway III, who is not running for reelection in 2018. In 2016, George Samuel Brockway III defeated Karen Ridgeway to win his or her 3 term in this seat.
Currently this seat is held by P Efstration, who is not running for reelection in 2018. In 2016, P Efstration defeated  to win his or her 2 term in this seat.
Currently this seat is held by Joyce Chandler, who is not running for reelection in 2018. In 2016, Joyce Chandler defeated Donna McLeod to win his or her 3 term in this seat.
Currently this seat is held by David Casas, who is not running for reelection in 2018. In 2016, David Casas defeated  to win his or her 3 term in this seat.
Currently this seat is held by Robert Brian Strickland, who is not running for reelection in 2018. In 2016, Robert Brian Strickland defeated Darryl Payton to win his or her 3 term in this seat.
Currently this seat is held by Regina Quick, who is not running for reelection in 2018. In 2016, Regina Quick defeated  to win his or her 3 term in this seat.
Currently this seat is held by Charles Edward Williams, who is not running for reelection in 2018. In 2016, Charles Edward Williams defeated  to win his or her 3 term in this seat.
Currently this seat is held by Samuel Teasley, who is not running for reelection in 2018. In 2016, Samuel Teasley defeated R Bolton to win his or her 3 term in this seat.
Currently this seat is held by Richard Golick, who is not running for reelection in 2018. In 2016, Richard Golick defeated Erick Allen to win his or her 3 term in this seat.
Currently this seat is held by Wendell Willard, who is not running for reelection in 2018. In 2016, Wendell Willard defeated  to win his or her 3 term in this seat.
Currently this seat is held by Beth Beskin, who is running for reelection in 2018. In 2016, Beth Beskin defeated Robert Gibeling to win his or her 2 term in this seat.
Currently this seat is held by Thomas Taylor, who is not running for reelection in 2018. In 2016, Thomas Taylor defeated  to win his or her 4 term in this seat.
Currently this seat is held by Meagan Hanson, who is running for reelection in 2018. In 2016, Meagan Hanson defeated Taylor Bennett to win his or her 1 term in this seat.

#Semi competitive - ['District 108: Clay Cox (55.5)vs. Jasmine Clark (44.5)', 'District 151: Gerald Greene (54.6)vs. Joyce Barlow (45.4)', 'District 164: Ron Stephens (55.7)vs. Aer Scott (44.3)', 'District 43: Sharon Cooper (54.5)vs. Luisa Wakeman (45.5)', 'District 48: Betty Price (56.4)vs. Mary Robichaux (43.6)', 'District 50: Kelly Leigh Stewart (55.1)vs. Angelika Kausche (44.9)', 'District 95: Scott Hilton (55.0)vs. Beth Moore (45.0)']"""