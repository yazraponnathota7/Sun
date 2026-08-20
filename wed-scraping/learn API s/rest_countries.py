import requests

country = input('Country name: ')


url = f'https://api.restcountries.com/countries/v5/names.common/{country}'

headers = {'Authorization': 'Bearer rc_live_e0c81c6c52474278b3829f9d121ad715'}

response = requests.get(url, headers=headers)
data = response.json()
print(data)

a = data['data']['objects'][0]['names']


print('', f'Name: {a['common']}', '\n',
      f'Offcial: {a['official']}')


a = data['data']['objects'][0]
eco = a['economy']['gini_coefficient']


print('', f'Flag: {a['flag']['emoji']}', '\n',
      f'Contient: {a['region']}', '\n',
      f'Coordinates: {a['coordinates']}', '\n',
      f'Currency: {a['currencies']}', '\n',
      f'Government-type: {a['government_type']}', '\n',
      f'Population: {a['population']}', '\n',
      f'Calling-Code: {a['calling_codes']},' '\n',)

print('Economy in each year..')
print('Year', '  ', 'Economy')
for p in eco.items():

    print(p)
