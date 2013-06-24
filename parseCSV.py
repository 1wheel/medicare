
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


def writeCSV(fileName, array, keys):
	import csv

	output = [keys]

	for row in array:
		nextRow = []
		for i in range(0, len(keys)):
			nextRow.append(array[keys[i]])
	output.append(nextRow)

	with open(fileName, 'wb') as csvfile:
		writer = csv.writer(csvfile, delimiter-',', quotechar='"')
		for r in output:
			write.writerow(r)