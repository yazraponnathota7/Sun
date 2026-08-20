import requests
from bs4 import BeautifulSoup
import json
# response = requests.get(
#     'https://www.imdb.com/chart/boxoffice/?ref_=hm_nv_menu')

# soup = BeautifulSoup(response.text, 'html.parser')
# movies = soup.select(
#     '#__next')

# print(movies)


# def scrap_imbd_box_office():
#     url = 'https://www.imdb.com/chart/boxoffice/'

#     headers = {
#         'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
#     }

#     try:
#         response = requests.get(url, headers=headers)
#         response.raise_for_status()
#     except requests.exceptions.HTTPError as e:
#         print(e)
#         return

#     soup = BeautifulSoup(response.text, 'html.parser')

#     script_tag = soup.find('script', id='__next')

#     if not script_tag:
#         print('could not find')
#         return
#     json_data = json.loads(script_tag.string)

#     try:
#         chart_edges =json_data['props']['pageProps']['pageData']['chartTitles']['edges']
#     except KeyError:
#         print('keyerror')
#         return


#     for edge in chart_edge[:10]:
#         node = edge.get('node', {})

#         rank = edge.get('currentRank', 'N/A')
#         title = node.get('titleText', {}).get('text', 'Unknown Title')

#         weekend_gross = node.get('weeksGross', {}).get('total', {} ).get('amount', 0)
#         cumulative_gross = (
#             node.get('cumulativeGross', {}).get('total', {}).get('amoung', 0)

#         )

#         weeks_released = node.get('weeksReleased', 'N/A')

#         weekend_str = (
#             f'{weekend_gross:,.0}' if weekend_gross else 'N/A'


#         )

#         cumulative_str = (
#             f'{cumulative_gross:,.0}' if cumulative_gross else 'N/A'

#         )

#         print(
#             f'{rank:<5} | {title:<40} | {weekend_str} | {cumulative_str} | {weeks_released}'

#         )


# if __name__ == '__main__':
#     scrap_imbd_box_office()


url = 'https://www.imdb.com/chart/top/'

headers = {

    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US, en; q=0.5',
    'Referer': 'https://www.google.com'
}


response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

movies = soup.select('.ipc-metadata-list-summary-item')
print(movies)
for index, movie in enumerate(movies[:10], start=1):

    title_element = movie.select_one('h4.ipc-title__text')

    if title_element:

        raw_title = title_element.get_text()
        clean_title = raw_title.split('.', 1)[-1].strip()

        print(index, clean_title)

