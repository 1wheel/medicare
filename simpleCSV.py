import csv
import json

#loads csv file,
def parseCSV(fileName):
	import csv

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

#write csv
def writeCSV(fileName, array, keys):
	output = [keys]

	for row in array:
		nextRow = []
		for i in range(0, len(keys)):
			nextRow.append(row[keys[i]])
		output.append(nextRow)

	with open(fileName, 'wb') as csvfile:
		writer = csv.writer(csvfile, delimiter=',', quotechar='"')
		for r in output:
			writer.writerow(r)

with open('uH.json', 'rb') as data_file:    
	uniqueHospitals = json.load(data_file)

simpleHosArray = []
for key in uniqueHospitals:
	hospital = uniqueHospitals[key]

	try:
		simpleHospital = {
							'hosID':	key,
							'name':		hospital['Provider Name'],
							'state':	hospital['Provider State'],
							'lat':		hospital['locInfo']['results'][0]['locations'][0]['latLng']['lat'],
							'long':		hospital['locInfo']['results'][0]['locations'][0]['latLng']['lng']}
		simpleHosArray.append(simpleHospital)	

	except Exception, e:
		print key
writeCSV('webpage/simpleHos.csv', simpleHosArray, simpleHosArray[0].keys())

hospitalArray = parseCSV('Medicare_Provider_Charge_Inpatient_DRG100_FY2011.csv')
drgArray = []
for hospital in hospitalArray:
	drg = hospital['DRG Definition'][:3]
	if not drg in drgArray:
		drgArray.append(drg)

drgArrays = {}
for drg in drgArray:
	drgArrays[drg] = []

for hospital in hospitalArray:
	drg = hospital['DRG Definition'][:3]
	drgArrays[drg].append({
							'hosID': hospital['Provider Id'],
							'dischargeNum': hospital[' Total Discharges '],
							'avCharges': hospital[' Average Covered Charges '],
							'avPayments': hospital[' Average Total Payments ']})

for drg in drgArray:
	writeCSV('webpage/drg/' + drg + '.csv', drgArrays[drg], drgArrays[drg][0].keys())

			