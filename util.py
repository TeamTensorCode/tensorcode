from rembg import remove
from PIL import Image

input = Image.open("public/logo.png")

output = remove(input)

output.save("public/icon.png")