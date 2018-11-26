with open('rcp_state_data.txt','rb') as f:
	text = f.readlines() 

listt = []

for x in text:
	listt.append(x.strip())

print listt	