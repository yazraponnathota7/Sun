import requests

url = 'https://weather.googleapis.com/v1/currentConditions:lookup?key=&location.latitude=&location.longitude=&'

params = {
    'location.latitude': 28.6448,
    'location.longitude': 77.2167,
    'key' : 'AlzaSyDybJUmOrSCBzt9Y8TeHZa1845TATL0gnw',
    'unitSystem': 'METRIC'
}

headers = {
    
}

response = requests.get(url, params=params)

print(response.status_code)
