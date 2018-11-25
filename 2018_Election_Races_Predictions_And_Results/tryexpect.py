s = 'abc1235.3'
l = '1'
#give it something to try
try:
	int(s)
#if try doesnt work	(error)
except:
	print 'not int'
#if try works (no error)
else:
	print 'int'	
#either way something to do at the end	
finally:
	print 'done'	

l = '1'	
try:
	int(l)	
except:
	print 'not int'
else:
	print 'int'	
finally:
	print 'done'	