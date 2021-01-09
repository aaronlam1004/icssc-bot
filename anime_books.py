# Script to download images for $break command of bot

import requests
import subprocess
from bs4 import BeautifulSoup

page = requests.get("https://anime-girls-holding-programming-books.netlify.app/")
print(page)

soup = BeautifulSoup(page.content, "html.parser")
pictures = soup.find_all("picture")


save_dir = "./media/books/"
for pic in pictures:
    for img in pic.find_all("img"):
        pic_str = "https://anime-girls-holding-programming-books.netlify.app" + str(img["src"])
        print(pic_str)
        subprocess.run(["wget", "-P", "", pic_str])
