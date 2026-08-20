from selenium import webdriver
from selenium.webdriver.common.by import By

browser = webdriver.Chrome()

browser.get('https://pypi.org/')

login_but = browser.find_element(By.CLASS_NAME, 'Log in')
login_but.click()

user_field = browser.find_element(By.ID, 'username')
user_field.send_keys('yazraponnathota')


password_field = browser.find_element(By.ID, 'password')
password_field.send_keys('Yazra@7755')

Login_but = browser.find_element(By.CLASS_NAME, '.button button--primary')
Login_but.click()
