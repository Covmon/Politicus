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
from collections import OrderedDict
import operator

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV, LassoLarsCV
from sklearn.svm import LinearSVR
from sklearn.decomposition import PCA
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from finding_years_of_elections import election_finder

desired_positions_dict = {'u.s. representative': 'us_rep','state senator': 'state_sen','state representative': 'state_rep'}
state_abrv_to_name = {'WA': 'Washington', 'DE': 'Delaware', 'WI': 'Wisconsin', 'WV': 'West Virginia', 'HI': 'Hawaii', 'FL': 'Florida', 'WY': 'Wyoming', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'TX': 'Texas', 'LA': 'Louisiana', 'NC': 'North Carolina', 'ND': 'North Dakota', 'NE': 'Nebraska', 'TN': 'Tennessee', 'NY': 'New York', 'PA': 'Pennsylvania', 'AK': 'Alaska', 'NV': 'Nevada', 'VA': 'Virginia', 'CO': 'Colorado', 'CA': 'California', 'AL': 'Alabama', 'AR': 'Arkansas', 'VT': 'Vermont', 'IL': 'Illinois', 'GA': 'Georgia', 'IN': 'Indiana', 'IA': 'Iowa', 'MA': 'Massachusetts', 'AZ': 'Arizona', 'ID': 'Idaho', 'CT': 'Connecticut', 'ME': 'Maine', 'MD': 'Maryland', 'OK': 'Oklahoma', 'OH': 'Ohio', 'UT': 'Utah', 'MO': 'Missouri', 'MN': 'Minnesota', 'MI': 'Michigan', 'RI': 'Rhode Island', 'KS': 'Kansas', 'MT': 'Montana', 'MS': 'Mississippi', 'SC': 'South Carolina', 'KY': 'Kentucky', 'OR': 'Oregon', 'SD': 'South Dakota'}

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

def news_briefer(position_name,state,year=2018):

	desired_positions_dict = {'U.S. Representative': 'us_rep','State Senator': 'state_sen','State Representative': 'state_rep'}

	df_state_elec_data = pd.read_csv('statewide_election_general_data.csv')
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
		term_length = state_sen_term_length

	df_election_data_features = pd.read_csv('/Users/sammahle/Downloads/Politicus-master/fundraising_data1/fundraising_data_{}/{}_fundraising_data_{}.csv'.format(year,state.upper(),year))
	df_election_data_features = df_election_data_features.loc[df_election_data_features.result.str.contains('Pending')]
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
	

	df_election_data_features_old = pd.read_csv('/Users/sammahle/Downloads/Politicus-master/fundraising_data1/fundraising_data_{}/{}_fundraising_data_{}.csv'.format(str(int(year-term_length)),state.upper(),str(int(year-term_length))))
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
	df_election_predictions = pd.read_csv('/Users/sammahle/Desktop/election_projects/open_election_investigation/{}_Candidates_Election_Predictions.csv'.format(state))
	df_election_predictions = df_election_predictions.loc[df_election_predictions.Position==position_name]
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].str.replace('>', '')
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].str.replace('<', '')	
	df_election_predictions['Predicted Win Probability'] = df_election_predictions['Predicted Win Probability'].astype(float)*.01
	df_election_predictions = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']>.005)&(df_election_predictions['Predicted Win Probability']<.995)]
	df_election_predictions_competitive = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']>.05)&(df_election_predictions['Predicted Win Probability']<.95)]
	df_election_predictions_mildly_competitive = df_election_predictions.loc[(df_election_predictions['Predicted Win Probability']<.05)|(df_election_predictions['Predicted Win Probability']>.95)]

	expected_dem_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&(df_election_predictions.Party=='DEM')]['Predicted Win Probability']/10000).sum()
	expected_rep_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&(df_election_predictions.Party=='REP')]['Predicted Win Probability']/10000).sum()
	expected_other_seats = (df_election_predictions.loc[(df_election_predictions.Position==position_name)&((df_election_predictions.Party!='DEM')&(df_election_predictions.Party!='REP'))]['Predicted Win Probability']/10000).sum()

	current_seats = {'DEM':0,'REP':0,'IND':0}
	current_seats['DEM'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='DEM'])
	current_seats['REP'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='REP'])
	current_seats['IND'] = len(df_current_legislators_pos.loc[df_current_legislators_pos.Party=='IND'])	

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
	majority_or_supermajority = 'majority'
	if current_seats[controlling_party] > seats_needed_for_smaj:
		majority_or_supermajority = 'supermajority'
	cut_into_or_improve = 'cut into'
	if current_seats[controlling_party] == party_winner_last_election:
		cut_into_or_improve = 'improve'

	opening_statement = 'Going into the 2018 Election, the {} Party holds a {}-{} lead in the {} {}. During the 2016 Election Cycle, the {} picked up {} overall seats to {} their {}. In this election the following seats were flipped: {}.'.format(controlling_party, current_seats[controlling_party], current_seats[other_party], state_abrv_to_name[state],body_name, party_winner_last_election, num_net_seats_party_winner_last_election,cut_into_or_improve,majority_or_supermajority, ', '.join(flipped_districts))
	#competitive_elections = 'We have identified the following elections as competitive - {}'.format('and'.join(election_predictions_competitive_districts))
	for election in election_predictions_competitive_districts:
		df_current_legislators_pos_dis = df_current_legislators_pos.loc[df_current_legislators_pos.District==election]
		df_election_predictions_dis = df_election_predictions_competitive.loc[df_election_predictions_competitive.District==election]
		df_election_data_features_pos_dis = df_election_data_features_pos.loc[df_election_data_features_pos.district==election]
		df_election_data_features_old_pos_dis = df_election_data_features_old_pos.loc[df_election_data_features_old_pos.district==election]
		incumbent_name = df_current_legislators_pos_dis['Candidate'].iloc[0]

		if incumbent_name in df_election_predictions_dis.Candidate.unique():
			incumbent_running = 'is'
		else:
			incumbent_running = 'is not'
		term_in_seat = df_current_legislators_pos_dis['Number of Terms in Position'].iloc[0]
		can_winner = df_election_data_features_old_pos_dis.loc[df_election_data_features_old_pos_dis.result.str.contains('Won')]['candidate'].iloc[0]
		can_loser_list = []
		for can_loser in df_election_data_features_old_pos_dis.loc[df_election_data_features_old_pos_dis.result.str.contains('Lost')]['candidate'].tolist():
			can_loser_list.append(can_loser)

		district_statement = 'Currently this seat is held by {}, who {} running for reelection in 2018. In {}, {} defeated {} to win his or her {} term in this seat.'.format(incumbent_name,incumbent_running,str(int(year-term_length)),can_winner,'and'.join(can_loser_list),term_in_seat) #(insert about challengers if opposing party in here) In this year"s Democratic primary, {} defeated {} and {} or x amount of challengers and in the Republican Primary .... Our past election results have this district classified as a {} {}, but/and we have this race projected as a {} with {} defeating {} by an averaging margin of {} points, but/and since this is a {} we would be {} suprised to see {} win.'.format()

	election_predictions_semi_competitive_districts = []
	election_predictions_semi_competitive_statement = []
	for district in sorted(df_election_predictions_mildly_competitive.District.unique()):
		print district
		incumbent_name = df_current_legislators_pos.loc[df_current_legislators_pos.District==election]['Candidate'].iloc[0]
		district_statement = 'District {}: '.format(district)
		first_can = True
		print df_election_predictions_mildly_competitive.loc[df_election_predictions_mildly_competitive.District==district]['Candidate'].unique()
		for can in df_election_predictions_mildly_competitive.loc[df_election_predictions_mildly_competitive.District==district]['Candidate'].unique():
			incumbent_filler = ''
			can_vote_share = round(df_election_predictions_mildly_competitive.loc[df_election_predictions_mildly_competitive.Candidate==can]['Predicted Vote Share'].unique(),3)*100
			if can == incumbent_name:
				incumbent_filler = ' (I)'
			can_statement = '{}{} ({})'.format(can,incumbent_filler, can_vote_share)
			if first_can == False:
				can_statement = 'vs. {}{} ({})'.format(can,incumbent_filler, can_vote_share)
			print can_statement
			district_statement = district_statement + can_statement
			first_can = False

		print district_statement
		election_predictions_competitive_districts.append('{}'.format(district))
		election_predictions_semi_competitive_statement.append(district_statement)

	semi_competitive_elections = 'We have identified the following elections as semi-competitive - {}'.format('and'.join(df_election_predictions_mildly_competitive))
	print election_predictions_semi_competitive_statement
	election_predictions_semi_competitive_statement = ', '.join(election_predictions_semi_competitive_statement)


for state in ['GA']:
	news_briefer('State Representative',state)
















