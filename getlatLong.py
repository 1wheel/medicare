import csv
import yaml
from datetime import datetime
import json
import urllib2
import parseCSV

#loads csv file,
def parseCSV(fileName):

	with open(fileName, 'rb') as csvfile:
		reader = csv.reader(csvfile, delimiter=',', quotechar='"')
		columnTitles = reader.next()
		data = []
		for r in reader:

			nextRow = {}
			for i in range(0,len(columnTitles)):
				varName = str(columnTitles[i])
				nextRow[varName] = r[i]
			data.append(nextRow)

	print 'read ' + fileName
	return data

def hospitalAddress(h):
	rv = h['Provider Street Address'] + ' ' + h['Provider City'] + ',' + h['Provider State'] + ' ' + h['Provider Zip Code']
	return rv.replace(" ", "%20")

hospitalArray = parseCSV('Medicare_Provider_Charge_Inpatient_DRG100_FY2011.csv')

uniqueHospitals = {}
for hospital in hospitalArray:
	if not hospital['Provider Id'] in uniqueHospitals:
		uniqueHospitals[hospital['Provider Id']] = hospital

url = "http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluub2quznq%2C80%3Do5-9u72l6&location="


for hospitalID in uniqueHospitals:
	hospital = uniqueHospitals[hospitalID]
	hospital['locInfo'] = json.load(urllib2.urlopen(url + hospitalAddress(hospital)))
	print hospital['Provider Id']



















# #creates array of key values in arrays, used to construct csv
# cArrayKeys = []
# for key in cArray[0]:
# 	cArrayKeys.append(key)

# eArrayKeys = []
# for key in eArray[0]:
# 	eArrayKeys.append(key)	



# #find emmi match with best start date (if none valid, best issued date) and prints them out
# #should date filtering just be done here?
# output = [cArrayKeys + eArrayKeys]

# for survey in cArray:
# 	nextRow = []
# 	for i in range(0, len(cArrayKeys)):
# 		nextRow.append(survey[cArrayKeys[i]]) 


# 	#need to pick best emmi result here instead of always taking the first...
# 	closestEmmi = findClosestEmmi(survey['cRecdate_DT'], survey['e'])
# 	if closestEmmi != -1:
# 		for i in range(0, len(eArrayKeys)):
# 			nextRow.append(survey['e'][closestEmmi][eArrayKeys[i]])
# 	else:
# 		for i in range(0, len(eArrayKeys)):
# 			nextRow.append('')

# 	output.append(nextRow)

# #write output array to csv file
# with open('output.csv', 'wb') as csvfile:
# 	writer = csv.writer(csvfile, delimiter=',', quotechar='"')
# 	for r in output:
# 		writer.writerow(r)