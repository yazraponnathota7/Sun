from selenium import webdriver
from selenium.webdriver.common.by import By

web_browser = webdriver.Chrome()

web_browser.get('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&dsh=S-1089962008%3A1781838773787672&followup=https%3A%2F%2Faccounts.google.com%2F&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AcDsRvwMSTHup6W133bWMYOW-ldRV_PjamdxQ01vjlewv96VdKlfDFksSCnDJ3CU7_9UMUQQDM_IGw')

login_field = web_browser.find_element(By.ID, 'identifierId')
login_field.send_keys('yazraponnathota7@gmail.com')

but = web_browser.find_element(By.LINK_TEXT, 'Next')
but.click()

pass_field = web_browser.find_element(By.NAME, 'Passwd')
pass_field.send_keys('Yazra@7755')

but = web_browser.find_element(By.LINK_TEXT, 'Next')
but.click()