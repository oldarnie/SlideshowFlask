import bcrypt
print(bcrypt.hashpw(b"17zoigl!", bcrypt.gensalt()).decode())
